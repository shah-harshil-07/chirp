import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from "@nestjs/common";
import { Response } from "express";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const messageCode = exception.message;

        response.status(status).json({
            meta: { messageCode, status: false, statusCode: status, message: "Not Found" },
            error: { message: "Unable to locate the requested route." },
        });
    }
}