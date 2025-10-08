// Kullanıcı varlığı (Entity)
import { BaseEntity } from '../../../core/interfaces';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED';

export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    position?: string;
    department?: string;
    timezone?: string;
    lastActive?: Date;
    lastLoginAt?: Date;
}

export class UserEntity implements User {
    constructor(
        public id: string,
        public email: string,
        public firstName: string,
        public lastName: string,
        public role: UserRole = 'MEMBER',
        public status: UserStatus = 'ACTIVE',
        public avatar?: string,
        public position?: string,
        public department?: string,
        public timezone: string = 'Europe/Istanbul',
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public lastActive?: Date,
        public lastLoginAt?: Date
    ) {}

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    updateLastLogin(): void {
        this.lastLoginAt = new Date();
        this.updatedAt = new Date();
    }

    updateLastActive(): void {
        this.lastActive = new Date();
        this.updatedAt = new Date();
    }

    deactivate(): void {
        this.status = 'INACTIVE';
        this.updatedAt = new Date();
    }

    activate(): void {
        this.status = 'ACTIVE';
        this.updatedAt = new Date();
    }

    promoteToManager(): void {
        this.role = 'MANAGER';
        this.updatedAt = new Date();
    }

    promoteToAdmin(): void {
        this.role = 'ADMIN';
        this.updatedAt = new Date();
    }

    demoteToMember(): void {
        this.role = 'MEMBER';
        this.updatedAt = new Date();
    }

    updateProfile(updates: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        position?: string;
        department?: string;
        timezone?: string;
    }): void {
        if (updates.firstName) this.firstName = updates.firstName;
        if (updates.lastName) this.lastName = updates.lastName;
        if (updates.avatar !== undefined) this.avatar = updates.avatar;
        if (updates.position !== undefined) this.position = updates.position;
        if (updates.department !== undefined) this.department = updates.department;
        if (updates.timezone) this.timezone = updates.timezone;
        
        this.updatedAt = new Date();
    }

    isAdmin(): boolean {
        return this.role === 'ADMIN';
    }

    isManager(): boolean {
        return this.role === 'MANAGER' || this.role === 'ADMIN';
    }

    isMember(): boolean {
        return this.role === 'MEMBER';
    }

    isActive(): boolean {
        return this.status === 'ACTIVE';
    }

    isInvited(): boolean {
        return this.status === 'INVITED';
    }
} 