import { Module } from '@nestjs/common';
import { MyLoggerController } from './my-logger.controller';
import { MyLoggerService } from './my-logger.service';

@Module({
  controllers: [MyLoggerController],
  providers: [MyLoggerService],
  exports: [MyLoggerService],
})
export class MyLoggerModule {}
