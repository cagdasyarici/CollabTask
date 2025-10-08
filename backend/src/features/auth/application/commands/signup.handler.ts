import * as bcrypt from 'bcrypt';
import { CommandHandler } from '../../../../core/interfaces';
import { ValidationError } from '../../../../core/errors';
import { JWTService, TokenPair } from '../../../../core/services/jwt.service';
import { SignupCommand } from './signup.command';
import { UserEntity } from '../../../users/domain/user.entity';
import { UserRepository } from '../../../users/domain/user.repository';

export interface SignupResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
  };
  tokens: TokenPair;
  message: string;
}

export class SignupHandler implements CommandHandler<SignupCommand, SignupResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JWTService
  ) {}

  async handle(command: SignupCommand): Promise<SignupResult> {
    // Input validasyonları
    this.validateInput(command);

    // Email benzersizliği kontrolü
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ValidationError('Bu email adresi zaten kullanılıyor');
    }

    // Şifreyi hash'le
    const hashedPassword = await this.hashPassword(command.password);

    // Name'i firstName ve lastName'e böl
    const nameParts = command.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Yeni kullanıcı oluştur
    const user = new UserEntity(
      'temp-id',
      command.email,
      firstName,
      lastName
    );

    // Veritabanına kaydet
    const savedUser = await this.userRepository.save(user, hashedPassword) as UserEntity;

    // JWT token oluştur
    const tokenPayload = {
      userId: savedUser.id,
      email: savedUser.email,
      role: 'MEMBER' as const,
      permissions: this.jwtService.getPermissionsByRole('MEMBER')
    };

    const tokens = this.jwtService.generateTokenPair(tokenPayload);

    return {
      user: {
        id: savedUser.id,
        name: `${savedUser.firstName} ${savedUser.lastName}`,
        email: savedUser.email,
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: new Date()
      },
      tokens,
      message: 'Kullanıcı başarıyla oluşturuldu'
    };
  }

  private validateInput(command: SignupCommand): void {
    // Name validasyonu
    if (!command.name || command.name.trim().length < 2) {
      throw new ValidationError('İsim en az 2 karakter olmalıdır');
    }

    // Email validasyonu
    if (!this.isValidEmail(command.email)) {
      throw new ValidationError('Geçersiz email formatı');
    }

    // Şifre validasyonu
    if (!command.password || command.password.length < 6) {
      throw new ValidationError('Şifre en az 6 karakter olmalıdır');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 