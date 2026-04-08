import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  // CORS: allow local dev + production domain
  app.enableCors({
    origin: isProd
      ? ['https://tasks.drcart.in', 'https://www.tasks.drcart.in']
      : ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port);
  console.log(
    `🚀 NestJS running on http://localhost:${port}/api/v1 [${isProd ? 'production' : 'development'}]`,
  );
}
bootstrap();
