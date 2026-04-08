import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get()
  health() {
    return {
      status: 'ok',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };
  }
}
