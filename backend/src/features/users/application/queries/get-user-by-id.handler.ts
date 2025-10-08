// Kullanıcı ID'ye göre getirme sorgusu işleyicisi
import { QueryHandler } from '../../../../core/interfaces';
import { NotFoundError } from '../../../../core/errors';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class GetUserByIdHandler implements QueryHandler<GetUserByIdQuery, User> {
    constructor(private readonly userRepository: UserRepository) {}

    async handle(query: GetUserByIdQuery): Promise<User> {
        const user = await this.userRepository.findById(query.userId);
        
        if (!user) {
            throw new NotFoundError(`ID'si ${query.userId} olan kullanıcı bulunamadı`);
        }

        return user;
    }
} 