import { Provider } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryProvider: Provider = {
  provide: 'CLOUDINARY_PROVIDER',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dbb6qxc6z',
      api_key: '167716255563626',
      api_secret: 'UtqQWgUSOsYO-0Zyz7uG3E6Xo0E',
    });
  },
};
