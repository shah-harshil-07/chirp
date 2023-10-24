import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from "@nestjs/common";
import { Response } from "express";

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const messageCode = exception.message;

        response.status(status).json({
            meta: { messageCode, status: false, statusCode: status, message: "Unauthorized" },
            error: { message: "Unable to authenticate the user." },
        });
    }
}