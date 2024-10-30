import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import CustomLogger from '@src/common/logger';

@Module({
  imports: [],
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
