import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    // Loads .env automatically in all environments
    ConfigModule.forRoot({ isGlobal: true }),

    // Serves the built Angular app for all non-API routes
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        '..',
        'frontend',
        'dist',
        'frontend',
        'browser',
      ),
      // Never intercept /api/v1/* — those go to NestJS controllers
      exclude: ['/api/v1/(.*)'],
    }),

    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
