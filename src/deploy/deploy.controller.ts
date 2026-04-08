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
        `
          export NVM_DIR="$HOME/.nvm" &&
          [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" &&
          cd ~/nodejs &&
          git pull origin main &&
          npm install --omit=dev &&
          pm2 restart tasks-api
        `,
        {
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
