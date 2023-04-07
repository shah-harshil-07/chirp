import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from "@nestjs/common";
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
    private successResponse(data: any): ISuccessResponse {
        return {
            meta: { message: "Success", messageCode: "SUCCESS", status: true, statusCode: 200 },
            data,
        };
    }

    private errorResponse(error: any): IErrorResponse {
        return {
            meta: { message: "Error", messageCode: "ERROR", status: false, statusCode: 422 },
            error
        };
    }

    private exceptionResponse(): IErrorResponse {
        return {
            meta: { message: "Exception Occurred", messageCode: "EXCEPTION", status: false, statusCode: 500 },
            error: {
                message: "Internal Server Error",
            }
        };
    }

    public intercept(_: ExecutionContext, next: CallHandler<any>): Observable<ISuccessResponse | IErrorResponse> {
        return next.handle().pipe(
            map(data => this.successResponse(data)),
            catchError(async () => this.exceptionResponse())
        );
    }
}