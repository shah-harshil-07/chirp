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

interface IStandardResponse {
    data: any,
    message: string,
}

@Controller("user")
export class UsersController {
    constructor(private readonly userService: UsersService, private readonly authService: AuthService) { }

    @UseInterceptors(ResponseInterceptor)
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

    @UseInterceptors(ResponseInterceptor)
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

    @UseInterceptors(ResponseInterceptor)
    @Post("register")
    async register(@Body() requestData: RegisteredUserDTO): Promise<IStandardResponse> {
        try {
            const userObj = await this.userService.createUser(requestData);
            const accessToken = this.authService.generateToken(userObj);
            return { data: { user: userObj, token: accessToken }, message: "Registeration done successfully!" };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @UseInterceptors(ResponseInterceptor)
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

    @UseInterceptors(ResponseInterceptor)
    @Post("check-google-credentials")
    async checkGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IStandardResponse> {
        try {
            const userData = await this.userService.getGoogleCredentials(requestData);
            const data = { userAvailable: userData ? true : false };
            const message = userData ? "The user already exists." : "The user is unavailable.";
            return { data, message };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("register-google-authed-user")
    async registerGoogleAuthedUser(@Body() requestData: RegisteredGoogleAuthedUserDTO): Promise<any> {
        try {
            const usernameAvailable = await this.userService.checkUsernameAvailable(requestData.username);
            if (usernameAvailable) {
                return {
                    meta: {
                        status: false,
                        statusCode: 422,
                        messageCode: "ERROR",
                        message: "User Registeration failed.",
                    },
                    error: {
                        message: "Username already exists.",
                    },
                };
            }

            const userObj = await this.userService.createGoogleAuthedUser(requestData);
            const accessToken = this.authService.generateToken(userObj);

            return {
                meta: {
                    status: true,
                    statusCode: 200,
                    messageCode: "SUCCESS",
                    message: "User Registered successfully.",
                },
                data: {
                    user: userObj,
                    token: accessToken,
                },
            };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @UseInterceptors(ResponseInterceptor)
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

    @Post("login-with-google-cred")
    async loginWithGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<any> {
        try {
            const userData = await this.userService.getGoogleAuthedUserData(requestData);

            if (userData) {
                const accessToken = this.authService.generateToken(userData);
                const data = { user: userData, token: accessToken };
                const meta = {
                    status: true,
                    statusCode: 200,
                    messageCode: "SUCCESS",
                    message: "User Logged in successfully.",
                };

                return { meta, data };
            } else {
                return {
                    meta: { status: false, statusCode: 422, messageCode: "ERROR", message: "User does not exist." }
                };
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
