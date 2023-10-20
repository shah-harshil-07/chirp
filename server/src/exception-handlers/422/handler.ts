import { UnprocessableEntityException } from "@nestjs/common";

export class CustomUnprocessableEntityException extends UnprocessableEntityException {
    constructor(customError: any) {
        super(customError, "Unprocessable error");
    }
}
