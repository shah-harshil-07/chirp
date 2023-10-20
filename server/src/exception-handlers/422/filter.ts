import { Response } from "express";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

import { CustomUnprocessableEntityException } from "./handler";

@Catch(CustomUnprocessableEntityException)
export class UnprocessableEntityExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const errorMessage = exception?.getResponse()?.message ?? "Unprocessable request";

        response.status(status).json({
            meta: {
                status: false,
                statusCode: status,
                message: errorMessage,
                messageCode: "Unprocessable request",
            },
        });
    }
}
