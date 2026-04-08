import { Controller, Post, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { execSync } from 'child_process';
import { ConfigService } from '@nestjs/config';

@Controller('deploy')
export class DeployController {
  constructor(private config: ConfigService) {}

  @Post()
  @HttpCode(200)
  deploy(@Headers('x-deploy-token') token: string) {
    const secret = this.config.get<string>('DEPLOY_SECRET');

    if (!secret || token !== secret) {
      throw new UnauthorizedException('Invalid deploy token');
    }

    try {
      const output = execSync(
        `cd ~/nodejs && git pull origin main && npm install --omit=dev && npm run build:all && pm2 restart tasks-api`,
        {
          env: {
            ...process.env,
            NVM_DIR: `${process.env.HOME}/.nvm`,
          },
          shell: '/bin/bash',
          timeout: 300000, // 5 minutes
        },
      ).toString();

      return { success: true, output };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}
