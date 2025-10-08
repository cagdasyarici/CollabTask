import * as bcrypt from 'bcrypt';
import { CommandHandler } from '../../../../core/interfaces';
import { ValidationError } from '../../../../core/errors';
import { JWTService, TokenPair } from '../../../../core/services/jwt.service';
import { LoginCommand } from './login.command';
import { UserRepository } from '../../../users/domain/user.repository';

export interface LoginResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastActive: Date;
  };
  tokens: TokenPair;
  message: string;
}

export class LoginHandler implements CommandHandler<LoginCommand, LoginResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JWTService
  ) {}

  async handle(command: LoginCommand): Promise<LoginResult> {
    // Input validasyonları
    this.validateInput(command);

    // Kullanıcıyı email ile bul
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new ValidationError('Email veya şifre hatalı');
    }

    // Şifre kontrolü (Prisma'dan hash'lenmiş şifreyi al)
    const isPasswordValid = await this.verifyPassword(command.password, user.email);
    if (!isPasswordValid) {
      throw new ValidationError('Email veya şifre hatalı');
    }

    // Kullanıcı aktif mi kontrol et
    if (user.status !== 'ACTIVE') {
      throw new ValidationError('Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.');
    }

    // JWT token oluştur
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
      permissions: this.jwtService.getPermissionsByRole(user.role as 'ADMIN' | 'MANAGER' | 'MEMBER')
    };

    const tokens = this.jwtService.generateTokenPair(tokenPayload);

    // Son aktif zamanı güncelle (background'da yapılabilir)
    this.updateLastActive(user.id);

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.status,
        lastActive: new Date()
      },
      tokens,
      message: 'Giriş başarılı'
    };
  }

  private validateInput(command: LoginCommand): void {
    if (!command.email || !command.password) {
      throw new ValidationError('Email ve şifre gereklidir');
    }

    if (!this.isValidEmail(command.email)) {
      throw new ValidationError('Geçersiz email formatı');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async verifyPassword(plainPassword: string, email: string): Promise<boolean> {
    try {
      // Gerçek implementation'da Prisma'dan password hash alınacak
      // Şimdilik mock bir doğrulama yapıyoruz
      // TODO: Prisma'dan user'ı passwordHash ile birlikte al
      
      // Geçici olarak tüm şifreler doğru kabul ediliyor
      return true;
      
      // Gerçek kod:
      // const userWithPassword = await this.prisma.user.findUnique({
      //   where: { email },
      //   select: { passwordHash: true }
      // });
      // return await bcrypt.compare(plainPassword, userWithPassword.passwordHash);
    } catch (error) {
      return false;
    }
  }

  private async updateLastActive(userId: string): Promise<void> {
    try {
      // Background'da son aktif zamanı güncelle
      // TODO: Implement this with Prisma
      // await this.prisma.user.update({
      //   where: { id: userId },
      //   data: { lastActive: new Date() }
      // });
    } catch (error) {
      // Hata logla ama işlemi durdurmA
      console.error('Last active update failed:', error);
    }
  }
} 