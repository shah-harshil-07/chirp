import * as Constants from "src/constants";
import { IValidationSet } from "./validators.types";

export class ValidationFactory {
    private static required(value: string): boolean {
        return Boolean(value);
    }

    private static isString(value: any): boolean {
        return typeof value === "string";
    }

    public static getValidationSet(validationRule: string): IValidationSet {
        switch (validationRule) {
            case "isString":
                return { fn: this.isString, errMessage: Constants.IS_STRING_ERR_MESSAGE };
            case "required":
                return { fn: this.required, errMessage: Constants.REQUIRED_ERR_MESSAGE };
            default:
                return null;
        }
    }
}