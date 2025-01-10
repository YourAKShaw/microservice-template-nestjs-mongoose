import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import CustomLogger from '@src/common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const logger = app.get(CustomLogger);
  logger.setContext('Bootstrap');

  await app.listen(port);
  logger.logWithContext('success', `Application is running on port ${port}`);
}
bootstrap();
