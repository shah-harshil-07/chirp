import { Body, Controller, Param, Post, UseInterceptors, InternalServerErrorException } from "@nestjs/common";
import { OtpDTO, RegisteredUserDTO, UserDTO } from "./users.dto";
import { UsersService } from "./users.service";
import { ResponseInterceptor } from "src/interceptors/response";

@UseInterceptors(ResponseInterceptor)
@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post("verify-email")
    async verifyEmail(@Body() userData: UserDTO): Promise<{ otpId: string }> {
        try {
            return await this.userService.sendOtp(userData.email, userData.name);
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    @Post("check-otp/:id")
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: { id: string }): Promise<{ valid: boolean }> {
        try {
            const otpData = await this.userService.findOtpValue(id);
            const createdTime = otpData.createdAt;
            const currentTime = Date.now();
            const timeDiff = ((currentTime - createdTime) / 1000);

            return { valid: (timeDiff <= 40 && requestData.otp === otpData.otp) };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    @Post("register")
    async register(@Body() requestData: RegisteredUserDTO): Promise<RegisteredUserDTO> {
        try {
            const userObj = await this.userService.createUser(requestData);
            return userObj;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
