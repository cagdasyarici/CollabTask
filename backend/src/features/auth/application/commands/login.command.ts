import { Command } from '../../../../core/interfaces';

export class LoginCommand implements Command {
  readonly type = 'LoginCommand';

  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
} 