import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";

export function CustomMatch(property: string | object, validationOptions: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            propertyName,
            name: "CustomMatch",
            constraints: [property],
            target: object.constructor,
            options: validationOptions,
            validator: {
                validate(value?: any, args?: ValidationArguments): boolean {
                    const [ regexPattern ] = args.constraints;
                    const regexObj = typeof(regexPattern) === "string" ? new RegExp(regexPattern) : regexPattern;
                    return !regexObj.test(value);
                },
                defaultMessage(validationArguments): string {
                    const property = validationArguments?.property ?? "field";
                    return `${property} does not match the required pattern`;
                },
            },
        });
    };
}