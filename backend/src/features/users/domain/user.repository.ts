// Kullanıcı repository arayüzü
import { Repository } from '../../../core/interfaces';
import { User, UserEntity } from './user.entity';

export interface UserRepository extends Repository<User> {
    save(entity: User, hashedPassword?: string): Promise<UserEntity>;
    findByEmail(email: string): Promise<User | null>;
    findActiveUsers(): Promise<User[]>;
    findByFullName(firstName: string, lastName: string): Promise<User[]>;
    existsByEmail(email: string): Promise<boolean>;
    getUserStatistics(userId: string): Promise<any>;
} 