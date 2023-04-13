import { Body, Controller, Param, Post, UseInterceptors, InternalServerErrorException } from "@nestjs/common";
import { LoggedInUserDTO, OtpDTO, RegisteredUserDTO, UserDTO } from "./users.dto";
import { UsersService } from "./users.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { AuthService } from "../auth/auth.service";

interface IStandardResponse {
    data: any,
    message: string,
}

@UseInterceptors(ResponseInterceptor)
@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService, private readonly authService: AuthService) { }

    @Post("verify-email")
    async verifyEmail(@Body() userData: UserDTO): Promise<IStandardResponse> {
        try {
            const otpData = await this.userService.sendOtp(userData.email, userData.name);
            return { data: otpData, message: "Otp sent successfully." };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    @Post("check-otp/:id")
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: { id: string }): Promise<IStandardResponse> {
        try {
            const otpData = await this.userService.findOtpValue(id);
            const createdTime = otpData.createdAt;
            const currentTime = Date.now();
            const timeDiff = ((currentTime - createdTime) / 1000);

            const data = { valid: (timeDiff <= 60 && requestData.otp === otpData.otp) };
            return { data, message: "OTP verified successfully." };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    @Post("register")
    async register(@Body() requestData: RegisteredUserDTO): Promise<IStandardResponse> {
        try {
            const userObj = await this.userService.createUser(requestData);
            return { data: userObj, message: "Registeration done successfully!" };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("check-user-credentials")
    async checkUniqueness(@Body() requestData: UserDTO): Promise<IStandardResponse> {
        try {
            const userUnique = await this.userService.checkUserUniquness(requestData);
            const message = userUnique ? "The user credentials are unique." : "Please change either username or email.";
            return { data: { userUnique }, message };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("login")
    async login(@Body() requestData: LoggedInUserDTO): Promise<IStandardResponse> {
        try {
            let accessToken = null;
            const userObj = await this.userService.findUser(requestData);
            if (userObj) accessToken = this.authService.generateToken(userObj);
            const message = userObj ? "User logged in successfully!" : "Credentials are incorrect.";

            const data = { userValid: userObj ? true : false };
            if (accessToken) data["accessToken"] = accessToken;
            return { data, message };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
