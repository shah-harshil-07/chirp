import { ExceptionFilter, ArgumentsHost, HttpException, Catch } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const messageCodeObj = exception.getResponse();
        const messageCode = typeof (messageCodeObj) === "string" ? messageCodeObj : exception.message;

        response.status(status).json({
            meta: {
                messageCode,
                status: false,
                statusCode: status,
                message: "Exception Occurred",
            },
            error: {
                message: "Internal Server Exception Occurred.",
            }
        });
    }
}