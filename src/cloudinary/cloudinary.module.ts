import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { cloudinaryProvider } from './cloudinary.provider'; // Import the provider

@Module({
  providers: [CloudinaryService, cloudinaryProvider], // Use the imported provider
  exports: [CloudinaryService, cloudinaryProvider],
})
export class CloudinaryModule {}
