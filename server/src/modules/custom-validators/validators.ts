import * as Constants from "src/constants";
import { IValidationSet } from "./validators.types";

export class ValidationFactory {
    private static required(value: string): boolean {
        return Boolean(value);
    }

    private static isString(value: any): boolean {
        const allowedTypes = ["string", "undefined"];
        return allowedTypes.includes(typeof value);
    }

    private static checkDateValidity(value: string): boolean {
        if (value) {
            const [year, month, day] = value.split('-');
            if (+month > 12 || +month < 1) return false;
            if (+year > (new Date()).getFullYear()) return false;

            let dayLimit = 28;
            const monthIndex = +month - 1;

            if (monthIndex === 1) {
                dayLimit = +year % 4 === 0 ? 29 : 28;
            } else if (monthIndex <= 6) {
                dayLimit = monthIndex % 2 === 0 ? 31 : 30;
            } else {
                dayLimit = monthIndex % 2 !== 0 ? 31 : 30;
            }

            if (+day > dayLimit) return false;
        }

        return true;
    }

    private static checkInteger(value: string): boolean {
        if (value) return Number.isInteger(Number(value));
        return true;
    }

    private static checkNonNegativeNumber(value: string): boolean {
        if (value) return Number(value) >= 0;
        return true;
    }

    public static getValidationSet(validationRule: string): IValidationSet {
        switch (validationRule) {
            case "isString":
                return { fn: this.isString, errMessage: Constants.IS_STRING_ERR_MESSAGE };
            case "required":
                return { fn: this.required, errMessage: Constants.REQUIRED_ERR_MESSAGE };
            case "isDateValid":
                return { fn: this.checkDateValidity, errMessage: Constants.INVALID_DATE_ERR_MESSAGE };
            case "isInteger":
                return { fn: this.checkInteger, errMessage: Constants.IS_NON_INTEGER_ERR_MESSAGE };
            case "isNonNegative":
                return { fn: this.checkNonNegativeNumber, errMessage: Constants.IS_NON_INTEGER_ERR_MESSAGE };
            default:
                return null;
        }
    }
}