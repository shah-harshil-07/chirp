import { IsEmail, IsNotEmpty } from "class-validator";
import { CustomMatch } from "src/custom-decorators/custom-validators";
import { NAME_REGEX, NAME_ERR_MESSAGE, USERNAME_REGEX, USERNAME_ERR_MESSAGE, EMAIL_ERR_MESSAGE } from "src/constants";

export class UserDTO {
    @IsNotEmpty()
    @CustomMatch(NAME_REGEX, { message: NAME_ERR_MESSAGE })
    name: string;

    @IsNotEmpty()
    @CustomMatch(USERNAME_REGEX, { message: USERNAME_ERR_MESSAGE })
    username: string;

    @IsNotEmpty()
    @IsEmail({}, { message: EMAIL_ERR_MESSAGE })
    email: string;
}
