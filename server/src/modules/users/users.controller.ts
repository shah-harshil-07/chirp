import { Body, Controller, Param, Post, UseInterceptors, InternalServerErrorException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { AuthService } from "../auth/auth.service";
import {
    OtpDTO,
    UserDTO,
    LoggedInUserDTO,
    RegisteredUserDTO,
    GoogleAuthedUserDTO,
    RegisteredGoogleAuthedUserDTO,
} from "./users.dto";

interface IResponseProps {
    data?: any,
    errors?: any,
    message: string,
    success: boolean,
};

@UseInterceptors(ResponseInterceptor)
@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService, private readonly authService: AuthService) { }

    @Post("verify-email")
    async verifyEmail(@Body() userData: UserDTO): Promise<IResponseProps> {
        try {
            const otpData = await this.userService.sendOtp(userData.email, userData.name);
            return { success: true, data: otpData, message: "Otp sent successfully." };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    @Post("check-otp/:id")
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: { id: string }): Promise<IResponseProps> {
        try {
            const otpData = await this.userService.findOtpValue(id);
            const createdTime = otpData.createdAt;
            const currentTime = Date.now();
            const timeDiff = ((currentTime - createdTime) / 1000);

            const data = { valid: (timeDiff <= 60 && requestData.otp === otpData.otp) };
            return { data, success: true, message: "OTP verified successfully." };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    @Post("register")
    async register(@Body() requestData: RegisteredUserDTO): Promise<IResponseProps> {
        try {
            const userObj = await this.userService.createUser(requestData);
            const accessToken = this.authService.generateToken(userObj);
            const data = { user: userObj, token: accessToken };
            return { data, success: true, message: "Registeration done successfully!" };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("check-user-credentials")
    async checkUniqueness(@Body() requestData: UserDTO): Promise<IResponseProps> {
        try {
            const userUnique = await this.userService.checkUserUniquness(requestData);
            const message = userUnique ? "The user credentials are unique." : "Please change either username or email.";
            const data = { userUnique }
            return { data, message, success: true };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("check-google-credentials")
    async checkGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IResponseProps> {
        try {
            const userData = await this.userService.getGoogleCredentials(requestData);
            const data = { userAvailable: userData ? true : false };
            const message = userData ? "The user already exists." : "The user is unavailable.";
            return { data, message, success: true };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("register-google-authed-user")
    async registerGoogleAuthedUser(@Body() requestData: RegisteredGoogleAuthedUserDTO): Promise<IResponseProps> {
        try {
            const usernameAvailable = await this.userService.checkUsernameAvailable(requestData.username);
            if (usernameAvailable) {
                return { success: false, message: "User registeration failed.", errors: ["Username already exists."] };
            }

            const userObj = await this.userService.createGoogleAuthedUser(requestData);
            const accessToken = this.authService.generateToken(userObj);
            const data = { user: userObj, token: accessToken };
            return { data, success: true, message: "User registered successfully." };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("login")
    async login(@Body() requestData: LoggedInUserDTO): Promise<IResponseProps> {
        try {
            let accessToken = null;
            const userObj = await this.userService.findUser(requestData);
            if (userObj) accessToken = this.authService.generateToken(userObj);
            const message = userObj ? "User logged in successfully!" : "Credentials are incorrect.";

            const data = { userValid: userObj ? true : false };
            if (accessToken) data["accessToken"] = accessToken;
            return { data, message, success: true };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("login-with-google-cred")
    async loginWithGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IResponseProps> {
        try {
            const userData = await this.userService.getGoogleAuthedUserData(requestData);

            if (userData) {
                const accessToken = this.authService.generateToken(userData);
                const data = { user: userData, token: accessToken };
                return { data, success: true, message: "User logged in successfully." };
            } else {
                return { success: false, message: "User does not exist" };
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
