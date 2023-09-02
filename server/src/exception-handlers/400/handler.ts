import { BadRequestException } from "@nestjs/common";

export class CustomBadRequestException extends BadRequestException {
    constructor(customError: any) {
        super(customError, "Validation Error");
    }
}
