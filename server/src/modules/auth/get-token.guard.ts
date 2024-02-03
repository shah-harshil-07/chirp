import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { ConfigService } from "src/modules/config/config.service";

@Injectable()
export class GetAuthTokenGuard implements CanActivate {
	constructor(private jwtService: JwtService, private configService: ConfigService) { }

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(/\s/gm) ?? [];
		return type === "Bearer" ? token : undefined;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (token) {
			const { secret } = this.configService.getConfigObj("jwt");
			const payload = await this.jwtService.verifyAsync(token, { secret });
			request.user = payload;
		}

		return true;
	}
}
