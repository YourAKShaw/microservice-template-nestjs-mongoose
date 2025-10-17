import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import CustomLogger from '@src/common/logger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const logger = new CustomLogger('Bootstrap');

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port);
  logger.success(`Application is running on port ${port}`);
}
bootstrap();
