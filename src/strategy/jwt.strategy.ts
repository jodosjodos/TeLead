import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/database/database.service';
import { payloadProps } from 'src/interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  async validate(payLoad: payloadProps) {
    const user = await this.prisma.user.findUnique({
      where: { id: payLoad.id, email: payLoad.email },
    });

    if (!user)
      throw new UnauthorizedException(
        "please valid token with valid credentials or user doesn't exists",
      );
    return user;
  }
}
