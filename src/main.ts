import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    // TODO
    origin: process.env.CORS_ORIGIN,
  });
  await app.listen(process.env.PORT);
}
bootstrap();
