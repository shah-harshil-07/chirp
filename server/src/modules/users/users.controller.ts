import { Body, Controller, Post } from "@nestjs/common";
import { UserDTO } from "./users.dto";
import { UsersService } from "./users.service";

@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post("register")
    async register(@Body() userData: UserDTO): Promise<void> {
        this.userService.sendOtp(userData.email, userData.name);
    }
}
