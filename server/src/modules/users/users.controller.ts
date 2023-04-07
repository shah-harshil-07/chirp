import { Body, Controller, Param, Post } from "@nestjs/common";
import { OtpDTO, UserDTO } from "./users.dto";
import { UsersService } from "./users.service";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";

@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post("verify-email")
    async verifyEmail(@Body() userData: UserDTO): Promise<string> {
        try {
            return await this.userService.sendOtp(userData.email, userData.name);
        } catch (err) {
            console.log(err);
            throw ExceptionsHandler;
        }
    }

    @Post("check-otp/:id")
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: { id: string }): Promise<boolean> {
        try {
            const otpData = await this.userService.findOtpValue(id);
            const createdTime = otpData.createdAt.getTime();
            const currentTime = (new Date()).getTime();

            const timeDiff = ((currentTime - createdTime) / 1000);
            return (timeDiff <= 20 && requestData.otp === otpData.otp);
        } catch (err) {
            console.log(err);
            throw ExceptionsHandler;
        }
    }
}
