import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException, Injectable, BadRequestException } from "@nestjs/common";

import { IResponse, IResponseProps, IErrorProps, ISuccessProps } from "./interfaces";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    private successResponse({ data, message }: ISuccessProps): IResponse {
        return { data, meta: { message, status: true, statusCode: 200, messageCode: "SUCCESS" } };
    }

    private errorResponse({ message, errors }: IErrorProps): IResponse {
        const response = { meta: { message, status: false, statusCode: 422, messageCode: "ERROR" } };
        if (errors) response["errors"] = errors;
        return response;
    }

    public intercept(_: ExecutionContext, next: CallHandler<any>): Observable<IResponse> {
        return next.handle().pipe(
            map(({ success, data, errors, message }: IResponseProps) => {
                const method: Function = success ? this.successResponse : this.errorResponse;
                const props = success ? { data, message } : { message, errors };
                return method(props);
            }),
            catchError((err: Error) => {
                return throwError(() => {
                    console.log(err);

                    switch (err.name) {
                        case "BadRequestException":
                            return new BadRequestException(err);
                        default:
                            return new InternalServerErrorException(err);
                    }
                });
            }),
        );
    }
}