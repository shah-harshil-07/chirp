import { ArgumentsHost, Catch, ExceptionFilter, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";

@Catch(UnprocessableEntityException)
export class UnprocessableEntityExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const messageCode = exception.message;

        response.status(status).json({
            meta: { messageCode, status: false, statusCode: status, message: "Unprocessable entity." },
            error: { message: "Unable to process the request data" },
        });
    }
}