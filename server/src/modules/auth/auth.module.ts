import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { DummyUsersService } from '../users/dummy-users.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({ secret: jwtConstants.secret }),
	],
	providers: [AuthService, DummyUsersService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule { }
