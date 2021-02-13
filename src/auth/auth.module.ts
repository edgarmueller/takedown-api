import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleController } from './google.controller';
import { GoogleStrategy } from './google.strategy';
import { GraphqlJwtGuard } from './graphql-jwt.guard';
import { JwtRefreshTokenStrategy } from './jwt-refresh.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RefreshToken } from './refresh-token.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwt.secret'),
        // TODO
        signOptions: { expiresIn: '60s' },
      }),
    }),
    UserModule,
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GraphqlJwtGuard,
  ],
  controllers: [AuthController, GoogleController],
})
export class AuthModule {}
