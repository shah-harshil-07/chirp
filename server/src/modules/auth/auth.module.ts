import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({ secret: jwtConstants.secret }),
	],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule { }
