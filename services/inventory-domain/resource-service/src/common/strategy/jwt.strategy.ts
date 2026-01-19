import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY', // Debe ser la misma que Auth-Service
    });
  }

  async validate(payload: any) {
    // Sincronizado con el Auth Service: usamos 'sub'
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}