import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, active: true },
    });
    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
    };
  }

  logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'Sesión cerrada' };
  }

  me(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      permissions: user.role?.permissions ?? [],
    };
  }
}
