import { ConfigService } from '@nestjs/config';
export declare class DeployController {
    private config;
    constructor(config: ConfigService);
    deploy(token: string): {
        success: boolean;
        output: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        output?: undefined;
    };
}
