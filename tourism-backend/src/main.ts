import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS-ის ჩასწორებული კონფიგურაცია
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://p40c888k0oocg0owokskkwo0.46.225.96.181.sslip.io', // შენი ფრონტენდის URL
      'https://p40c888k0oocg0owokskkwo0.46.225.96.181.sslip.io' // ყოველი შემთხვევისთვის HTTPS ვერსიაც
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;

  // 0.0.0.0 აუცილებელია, რომ კონტეინერმა გარედან მიიღოს მოთხოვნები
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();