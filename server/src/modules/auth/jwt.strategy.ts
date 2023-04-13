import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "../config/config.service";
import { RegisteredUserDTO } from "../users/users.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const configService = new ConfigService();

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getConfigObj("jwt").secret,
        });
    }

    validate(payload: RegisteredUserDTO): RegisteredUserDTO {
        return payload;
    }
}
