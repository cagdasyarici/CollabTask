// CreateUserHandler Unit Tests
import { CreateUserHandler } from '../create-user.handler';
import { CreateUserCommand } from '../create-user.command';
import { UserRepository } from '../../../domain/user.repository';
import { UserEntity } from '../../../domain/user.entity';
import { ValidationError } from '../../../../../core/errors';

// Mock UserRepository
const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findByEmail: jest.fn(),
    findActiveUsers: jest.fn(),
    findByFullName: jest.fn(),
    existsByEmail: jest.fn(),
    getUserStatistics: jest.fn(),
    updateLastActive: jest.fn(),
} as jest.Mocked<UserRepository>;

describe('CreateUserHandler', () => {
    let handler: CreateUserHandler;

    beforeEach(() => {
        handler = new CreateUserHandler(mockUserRepository);
        // Her test öncesi mock'ları temizle
        jest.clearAllMocks();
    });

    describe('handle', () => {
        it('geçerli verilerle kullanıcı oluşturmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet Yılmaz',
                'ahmet@example.com',
                'password123'
            );

            const expectedUser = new UserEntity(
                'test-id',
                'ahmet@example.com',
                'Ahmet',
                'Yılmaz'
            );

            mockUserRepository.findByEmail.mockResolvedValue(null); // Email mevcut değil
            mockUserRepository.save.mockResolvedValue(expectedUser);

            // Act
            const result = await handler.handle(command);

            // Assert
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('ahmet@example.com');
            expect(mockUserRepository.save).toHaveBeenCalledWith(
                expect.any(UserEntity),
                expect.any(String) // hash'lenmiş şifre
            );
            expect(result).toEqual(expectedUser);
        });

        it('çok kısa isim ile ValidationError fırlatmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'A',
                'ahmet@example.com',
                'password123'
            );

            // Act & Assert
            await expect(handler.handle(command)).rejects.toThrow(ValidationError);
            await expect(handler.handle(command)).rejects.toThrow('İsim en az 2 karakter olmalıdır');
        });

        it('geçersiz email ile ValidationError fırlatmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet Yılmaz',
                'invalid-email',
                'password123'
            );

            // Act & Assert
            await expect(handler.handle(command)).rejects.toThrow(ValidationError);
            await expect(handler.handle(command)).rejects.toThrow('Geçersiz email formatı');
        });

        it('çok kısa şifre ile ValidationError fırlatmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet Yılmaz',
                'ahmet@example.com',
                '123'
            );

            // Act & Assert
            await expect(handler.handle(command)).rejects.toThrow(ValidationError);
            await expect(handler.handle(command)).rejects.toThrow('Şifre en az 6 karakter olmalıdır');
        });

        it('mevcut email ile ValidationError fırlatmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet Yılmaz',
                'existing@example.com',
                'password123'
            );

            const existingUser = new UserEntity(
                'existing-id',
                'existing@example.com',
                'Mevcut',
                'Kullanıcı'
            );

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(handler.handle(command)).rejects.toThrow(ValidationError);
            await expect(handler.handle(command)).rejects.toThrow('Bu email adresi zaten kullanılıyor');
        });

        it('tek isim ile firstName ve lastName ayırmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet',
                'ahmet@example.com',
                'password123'
            );

            const expectedUser = new UserEntity(
                'test-id',
                'ahmet@example.com',
                'Ahmet',
                ''
            );

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.save.mockResolvedValue(expectedUser);

            // Act
            const result = await handler.handle(command);

            // Assert
            expect(result.firstName).toBe('Ahmet');
            expect(result.lastName).toBe('');
        });

        it('çoklu isim ile firstName ve lastName ayırmalı', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet Ali Yılmaz',
                'ahmet@example.com',
                'password123'
            );

            const expectedUser = new UserEntity(
                'test-id',
                'ahmet@example.com',
                'Ahmet',
                'Ali Yılmaz'
            );

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.save.mockResolvedValue(expectedUser);

            // Act
            const result = await handler.handle(command);

            // Assert
            expect(result.firstName).toBe('Ahmet');
            expect(result.lastName).toBe('Ali Yılmaz');
        });

        it('şifreyi hash\'leyerek save metoduna göndermeli', async () => {
            // Arrange
            const command = new CreateUserCommand(
                'Ahmet Yılmaz',
                'ahmet@example.com',
                'password123'
            );

            const expectedUser = new UserEntity(
                'test-id',
                'ahmet@example.com',
                'Ahmet',
                'Yılmaz'
            );

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.save.mockResolvedValue(expectedUser);

            // Act
            await handler.handle(command);

            // Assert
            const saveCall = mockUserRepository.save.mock.calls[0];
            const hashedPassword = saveCall[1];
            
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe('password123'); // Hash'lenmiş olmalı
            expect(typeof hashedPassword).toBe('string');
        });
    });
}); 