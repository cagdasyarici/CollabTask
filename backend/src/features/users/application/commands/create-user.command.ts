// Kullanıcı oluşturma komutu
import { Command } from '../../../../core/interfaces';

export class CreateUserCommand implements Command {
    readonly type = 'CreateUserCommand';

    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly password: string
    ) {}
} 