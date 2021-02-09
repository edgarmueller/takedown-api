import { Module, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinkModule } from './link/link.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { RefreshToken } from './auth/refresh-token.entity';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: Joi.object({
        database: Joi.object({
          url: Joi.string(),
          ssl: Joi.bool().default(false),
        }),
        auth: Joi.object({
          google: Joi.object({
            clientId: Joi.string().required(),
            clientSecret: Joi.string().required(),
            callbackUrl: Joi.string().required(),
          }),
        }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        entities: [User, RefreshToken],
        synchronize: false,
        ssl: configService.get<boolean>('database.ssl'),
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    LinkModule,
    TagModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useValue: new ValidationPipe({
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
