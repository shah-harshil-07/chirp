import { NestInterceptor, ExecutionContext, CallHandler, Injectable, HttpException, HttpStatus } from "@nestjs/common";

import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

interface IMeta {
    message: string,
    messageCode: string,
    status: boolean,
    statusCode: number
}

interface ISuccessResponse {
    meta: IMeta,
    data: any,
}

interface IErrorResponse {
    meta: IMeta,
    error: any,
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    private successResponse(data: any, message: string): ISuccessResponse {
        return {
            meta: { message, messageCode: "SUCCESS", status: true, statusCode: 200 },
            data,
        };
    }

    private errorResponse(error: any, statusCode: number): IErrorResponse {
        return {
            meta: { statusCode, message: "Error", messageCode: "ERROR", status: false },
            error
        };
    }

    public intercept(_: ExecutionContext, next: CallHandler<any>): Observable<ISuccessResponse | IErrorResponse> {
        return next.handle().pipe(
            map(data => this.successResponse(data.data, data.message)),
            catchError(async err => {
                if (err?.status === 500) {
                    throw new HttpException(
                        "INTERNAL_SERVER_ERROR",
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        { cause: new Error(), description: "Server Error" },
                    );
                }

                const errorObj = { message: err?.response?.message?.[0] ?? "Validation Error" };
                const statusCode = err?.status ?? 422;
                return this.errorResponse(errorObj, statusCode);
            })
        );
    }
}