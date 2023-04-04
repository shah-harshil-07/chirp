import { Body, Controller, Post } from "@nestjs/common";
import { UserDTO } from "./users.dto";

@Controller("user")
export class UsersController {
    @Post("register")
    async register(@Body() userData: UserDTO): Promise<any> {
        return userData;
    }
}
