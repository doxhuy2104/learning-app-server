import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT ? Number(process.env.PORT) : 5000;
    app.enableCors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    });
    await app.listen(port, '0.0.0.0');

}

bootstrap();


