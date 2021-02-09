import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createRepositoryMock } from '../common/testing/mocks';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RefreshToken } from './refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secretOrPrivateKey: 'test',
        }),
      ],
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: createRepositoryMock(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
