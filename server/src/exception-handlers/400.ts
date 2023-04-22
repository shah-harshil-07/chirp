import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const errors = exception?.response?.message ?? "Validation Error";

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
