import { Inject, Injectable } from "@nestjs/common";
import { ValidationFactory } from "./validators";
import { IValidationResponse, IValidationRules } from "./validators.types";

@Injectable()
export class CustomValidatorsService {
    private validationObj: any;

    constructor(@Inject("validationObj") validationObj: IValidationRules) {
        this.validationObj = validationObj;
    }

    public validate(data: any): IValidationResponse {
        if (typeof data === "object") {
            let isDataValid = true, errors = {};

            for (const key in this.validationObj) {
                const validationStr = this.validationObj[key];
                const rules = validationStr.split('|');
                const value = data[key];

                for (let i = 0; i < rules.length; i++) {
                    const rule: string = rules[i];
                    const { fn: validationFn, errMessage } = ValidationFactory.getValidationSet(rule);

                    if (validationFn) {
                        const isValid = validationFn(value);

                        if (!isValid) {
                            isDataValid = false;
                            errors[key] = errMessage;
                            break;
                        }
                    }
                }
            }

            return { isValid: isDataValid, errors };
        } else {
            return { isValid: false, errors: { data: "data must be of the type object" } };
        }
    }
}
