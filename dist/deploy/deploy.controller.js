"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployController = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const config_1 = require("@nestjs/config");
let DeployController = class DeployController {
    config;
    constructor(config) {
        this.config = config;
    }
    deploy(token) {
        const secret = this.config.get('DEPLOY_SECRET');
        if (!secret || token !== secret) {
            throw new common_1.UnauthorizedException('Invalid deploy token');
        }
        try {
            const output = (0, child_process_1.execSync)(`
          export NVM_DIR="$HOME/.nvm" &&
          [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" &&
          cd ~/nodejs &&
          git pull origin main &&
          npm install --omit=dev &&
          pm2 restart tasks-api
        `, {
                shell: '/bin/bash',
                timeout: 300000,
            }).toString();
            return { success: true, output };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
};
exports.DeployController = DeployController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-deploy-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "deploy", null);
exports.DeployController = DeployController = __decorate([
    (0, common_1.Controller)('deploy'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DeployController);
//# sourceMappingURL=deploy.controller.js.map