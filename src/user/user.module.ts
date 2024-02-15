import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategy';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
@Module({
  imports: [DatabaseModule, JwtModule.register({}), CloudinaryModule],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
