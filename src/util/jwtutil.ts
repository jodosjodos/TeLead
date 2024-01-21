import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export const generateToken = async (email: string, id: string) => {
  const payLoad = { email, id };
  const config = new ConfigService();
  const jwtService = new JwtService();
  const token = await jwtService.signAsync(payLoad, {
    secret: config.get('JWT_SECRET'),
    expiresIn: '3d',
  });
  return token;
};
