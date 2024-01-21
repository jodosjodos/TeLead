import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
@Module({
  imports: [
    UserModule,
    MyLoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
  ],
})
export class AppModule {}
