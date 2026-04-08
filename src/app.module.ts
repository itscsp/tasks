import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { DeployModule } from './deploy/deploy.module';

@Module({
  imports: [
    // Loads .env automatically in all environments
    ConfigModule.forRoot({ isGlobal: true }),

    TodosModule,
    DeployModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
