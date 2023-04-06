import { IsEmail, IsNotEmpty, Length, MaxLength, MinLength } from "class-validator";
import { CustomMatch } from "src/custom-decorators/custom-validators";
import * as Constants from "src/constants";

export class UserDTO {
    @IsNotEmpty()
    @CustomMatch(Constants.NAME_REGEX, { message: Constants.NAME_ERR_MESSAGE })
    name: string;

    @IsNotEmpty()
    @CustomMatch(Constants.USERNAME_REGEX, { message: Constants.USERNAME_ERR_MESSAGE })
    username: string;

    @IsNotEmpty()
    @IsEmail({}, { message: Constants.EMAIL_ERR_MESSAGE })
    email: string;
}

export class OtpDTO {
    @Length(4, 4)
    otp: string;
}