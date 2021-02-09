import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../auth/provider.enum';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async save(user: User) {
    await this.userRepo.save(user);
  }

  findOneByIdOrFail(userId: string): Promise<User> {
    return this.userRepo.findOneOrFail(userId);
  }

  registerOAuthUser(
    email: string,
    thirdPartyId: string,
    provider: Provider,
  ): Promise<User> {
    return this.userRepo.save(
      new User({
        email,
        thirdPartyId,
        provider,
      }),
    );
  }

  findOneByThirdPartyId(
    thirdPartyId: string,
    provider: Provider,
  ): Promise<User> {
    return this.userRepo.findOne({
      where: {
        thirdPartyId,
        provider,
      },
    });
  }
}
