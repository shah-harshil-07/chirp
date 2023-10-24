import { Response } from "express";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

import { CustomBadRequestException } from "./handler";

@Catch(CustomBadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const status = exception.getStatus();
        const response = ctx.getResponse<Response>();
        const errors = exception?.getResponse()?.response ?? "Validation Error";

        response.status(status).json({
            errors,
            meta: {
                status: false,
                statusCode: status,
                message: "Bad Request",
                messageCode: "Validation Error",
            },
        });
    }
}
