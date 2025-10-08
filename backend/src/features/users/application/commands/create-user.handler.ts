// Kullanıcı oluşturma komutu işleyicisi
import * as bcrypt from 'bcrypt';
import { CommandHandler } from '../../../../core/interfaces';
import { ValidationError } from '../../../../core/errors';
import { CreateUserCommand } from './create-user.command';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class CreateUserHandler implements CommandHandler<CreateUserCommand, UserEntity> {
    constructor(private readonly userRepository: UserRepository) {}

    async handle(command: CreateUserCommand): Promise<UserEntity> {
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
            this.generateId(),
            command.email,
            firstName,
            lastName
        );

        // Kaydet ve döndür
        return await this.userRepository.save(user, hashedPassword) as UserEntity;
    }

    private validateInput(command: CreateUserCommand): void {
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