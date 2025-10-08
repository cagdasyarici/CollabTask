// Kullanıcı ID'ye göre getirme sorgusu
import { Query } from '../../../../core/interfaces';

export class GetUserByIdQuery implements Query {
    readonly type = 'GetUserByIdQuery';

    constructor(public readonly userId: string) {}
} 