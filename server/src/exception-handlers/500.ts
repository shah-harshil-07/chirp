import { ExceptionFilter, ArgumentsHost, Catch, InternalServerErrorException, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(InternalServerErrorException)
export class InternalServerExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const messageCode = exception.message;

        response.status(status).json({
            meta: { messageCode, status: false, statusCode: status, message: "Exception Occurred" },
            error: { message: "Internal Server Exception Occurred." },
        });
    }
}