import { Command } from '../../../../core/interfaces';

export class SignupCommand implements Command {
  readonly type = 'SignupCommand';

  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}
} 