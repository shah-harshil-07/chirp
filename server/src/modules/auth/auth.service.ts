import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDTO } from "../users/users.dto";

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    generateToken(user: UserDTO) {
        return this.jwtService.sign(JSON.stringify(user));
    }
}
