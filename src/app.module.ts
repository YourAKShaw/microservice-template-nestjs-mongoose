import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import CustomLogger from '@src/common/logger';
import { configValidationSchema } from '@src/config/config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema: configValidationSchema,
      isGlobal: true, // Make ConfigModule global
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: CustomLogger,
      useClass: CustomLogger,
    },
  ],
})
export class AppModule {}
