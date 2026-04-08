"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const isProd = process.env.NODE_ENV === 'production';
    const port = process.env.PORT || 3000;
    app.enableCors({
        origin: isProd
            ? ['https://tasks.drcart.in', 'https://www.tasks.drcart.in']
            : ['http://localhost:4200', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(port);
    const mode = isProd ? 'production' : 'development';
    console.log(`\n🚀 Server ready [${mode}]`);
    console.log(`   API:      http://localhost:${port}/api/v1`);
    if (!isProd) {
        console.log(`   Frontend: http://localhost:4200`);
    }
    else {
        console.log(`   Frontend: https://tasks.drcart.in`);
    }
    console.log('');
}
bootstrap();
//# sourceMappingURL=main.js.map