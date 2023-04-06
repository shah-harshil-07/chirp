import { Body, Controller, Param, Post } from "@nestjs/common";
import { OtpDTO, UserDTO } from "./users.dto";
import { UsersService } from "./users.service";

@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post("verify-email")
    async verifyEmail(@Body() userData: UserDTO): Promise<string | null> {
        try {
            return await this.userService.sendOtp(userData.email, userData.name);
        } catch (err) {
            return null;
        }
    }

    @Post("check-otp/:id")
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: { id: string }): Promise<any> {
        try {
            const otp_data = await this.userService.findOtpValue(id);
            const created_time = otp_data.createdAt.getSeconds();
            const current_time = (new Date()).getSeconds();

            return (current_time - created_time);
        } catch (error) {
            return false;
        }
    }
}
