import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";

import { JwtStrategy } from "./jwt.strategy";
import { GetAuthTokenGuard } from "./get-token.guard";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.getConfigObj("jwt").secret
			}),
		}),
	],
	providers: [AuthService, JwtStrategy, GetAuthTokenGuard, ConfigService],
	exports: [AuthService, GetAuthTokenGuard],
})
export class AuthModule { }
