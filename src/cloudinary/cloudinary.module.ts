import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { cloudinaryProvider } from './cloudinary.provider'; // Import the provider

@Global()
@Module({
  providers: [CloudinaryService, cloudinaryProvider],
  exports: [CloudinaryService, cloudinaryProvider],
})
export class CloudinaryModule {}
