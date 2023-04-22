interface IMeta {
    message: string,
    messageCode: string,
    status: boolean,
    statusCode: number
}

export interface IResponse {
    meta: IMeta,
    data?: any,
    errors?: any,
}

export interface IResponseProps {
    data?: any,
    errors?: any,
    message: string,
    success: boolean,
};

export interface IErrorProps {
    message: string,
    errors?: any,
}

export interface ISuccessProps {
    message: string,
    data: any,
}
