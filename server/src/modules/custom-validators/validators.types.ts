export interface IErrorData {
    [key: string]: string;
}

export interface IValidationResponse {
    isValid: boolean;
    errors?: IErrorData;
}

export interface IValidationSet {
    fn: (data: any) => boolean;
    errMessage: string;
}

export interface IValidationRules {
    [key: string]: string;
}