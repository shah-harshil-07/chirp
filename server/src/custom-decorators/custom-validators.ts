import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";

export function CustomMatch(property: string, validationOptions: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "CustomMatch",

            target: object.constructor,

            propertyName,

            constraints: [property],

            options: validationOptions,

            validator: {
                validate(value?: any, args?: ValidationArguments): boolean {
                    const [ regex_string ] = args.constraints;
                    const regexObj = new RegExp(regex_string);                    
                    return !regexObj.test(value);
                },

                defaultMessage(validationArguments): string {
                    const property = validationArguments?.property ?? "field";
                    return `${property} does not match the required pattern`;
                },
            }
        });
    }
}