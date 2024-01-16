import { Body, Controller, Param, Post, Get, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";

import { UsersService } from "./users.service";
import { AuthService } from "src/modules/auth/auth.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ResponseInterceptor } from "src/interceptors/response";
import { getFileStorageConfigObj, parseFilePipeObj } from "../posts/file.config";
import {
    OtpDTO,
    UserDTO,
    IParamId,
    LoggedInUserDTO,
    RegisteredUserDTO,
    GoogleAuthedUserDTO,
    IUpdateUserDetailsDTO,
    RegisteredGoogleAuthedUserDTO,
} from "./users.dto";

interface IResponseProps {
    data?: any;
    errors?: any;
    message: string;
    success: boolean;
};

@Controller("user")
@UseInterceptors(ResponseInterceptor)
export class UsersController {
    constructor(private readonly userService: UsersService, private readonly authService: AuthService) { }

    @Post("verify-email")
    async verifyEmail(@Body() userData: UserDTO): Promise<IResponseProps> {
        const otpData = await this.userService.sendOtp(userData.email, userData.name);
        return { success: true, data: otpData, message: "Otp sent successfully." };
    }

    @Post("check-otp/:id")
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: IParamId): Promise<IResponseProps> {
        const otpData = await this.userService.findOtpValue(id);
        const createdTime = otpData.createdAt;
        const currentTime = Date.now();
        const timeDiff = ((currentTime - createdTime) / 1000);

        const data = { valid: (timeDiff <= 60 && requestData.otp === otpData.otp) };
        return { data, success: true, message: "OTP verified successfully." };
    }

    @Post("register")
    async register(@Body() requestData: RegisteredUserDTO): Promise<IResponseProps> {
        const userObj = await this.userService.createUser(requestData);
        const accessToken = this.authService.generateToken(userObj);
        const data = { user: userObj, token: accessToken };
        return { data, success: true, message: "Registeration done successfully!" };
    }

    @Post("check-user-credentials")
    async checkUniqueness(@Body() requestData: UserDTO): Promise<IResponseProps> {
        const userUnique = await this.userService.checkUserUniquness(requestData);
        const message = userUnique ? "The user credentials are unique." : "Please change either username or email.";
        const data = { userUnique }
        return { data, message, success: true };
    }

    @Post("check-google-credentials")
    async checkGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IResponseProps> {
        const userData = await this.userService.getGoogleCredentials(requestData);
        const data = { userAvailable: userData ? true : false };
        const message = userData ? "The user already exists." : "The user is unavailable.";
        return { data, message, success: true };
    }

    @Post("register-google-authed-user")
    async registerGoogleAuthedUser(@Body() requestData: RegisteredGoogleAuthedUserDTO): Promise<IResponseProps> {
        const usernameAvailable = await this.userService.checkUsernameAvailable(requestData.username);
        if (usernameAvailable) {
            return { success: false, message: "User registeration failed.", errors: ["Username already exists."] };
        }

        const userObj = await this.userService.createGoogleAuthedUser(requestData);
        const accessToken = this.authService.generateToken(userObj);
        const data = { user: userObj, token: accessToken };
        return { data, success: true, message: "User registered successfully." };
    }

    @Post("login")
    async login(@Body() requestData: LoggedInUserDTO): Promise<IResponseProps> {
        let accessToken = null;
        const userObj = await this.userService.findUser(requestData);
        if (userObj) accessToken = this.authService.generateToken(userObj);
        const message = userObj ? "User logged in successfully!" : "Credentials are incorrect.";

        const data = { userValid: userObj ? true : false, userData: userObj };
        if (accessToken) data["accessToken"] = accessToken;
        return { data, message, success: true };
    }

    @Post("login-with-google-cred")
    async loginWithGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IResponseProps> {
        const userData = await this.userService.getGoogleAuthedUserData(requestData);

        if (userData) {
            const accessToken = this.authService.generateToken(userData);
            const data = { user: userData, token: accessToken };
            return { data, success: true, message: "User logged in successfully." };
        } else {
            return { success: false, message: "User does not exist" };
        }
    }

    @Get("get-details/:id")
    async getUserDetails(@Param() { id }: IParamId): Promise<IResponseProps> {
        const userData = await this.userService.getUserDetails(id);
        return { success: true, data: userData, message: "User details fetched successfully." };
    }

    @Get("get-posts/:id")
    async getPosts(@Param() { id }: IParamId): Promise<IResponseProps> {
        const userPosts = await this.userService.getUserPosts(id);
        return { success: true, data: userPosts, message: "User posts fetched successfully." };
    }

    @Get("get-saved/:id")
    async getSavedPosts(@Param() { id }: IParamId): Promise<IResponseProps> {
        const posts = await this.userService.getUserSavedPosts(id);
        return { success: true, data: posts, message: "Saved posts fetched successfully." };
    }

    @Get("get-comments/:id")
    async getComments(@Param() { id }: IParamId): Promise<IResponseProps> {
        const data = await this.userService.getComments(id);
        return { success: true, data, message: "User comments fetched successfully." };
    }

    @Post("update-details/:id")
    @UseInterceptors(
        FileInterceptor("picture", getFileStorageConfigObj("user-images")),
        FileInterceptor("backgroundImage", getFileStorageConfigObj("user-images")),
    )
    async updateDetails(
        @Param() { id }: IParamId,
        @Body() requestData: any,
        @UploadedFile(parseFilePipeObj) picture: Express.Multer.File,
        // @UploadedFile(parseFilePipeObj) backgroundImage: Express.Multer.File,
    ): Promise<IResponseProps> {
        // console.log(picture);
        // console.log(backgroundImage);
        // const data = await this.userService.updateDetails(id, requestData);
        return { success: true, data: [], message: "User details updated successfully." };
    }
}
