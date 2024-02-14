/* Regex validating expressions */
/*--------------------------------------------------------------------------------*/
export const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}/;
export const EMAIL_REGEX = "/^([a-zA-Z0-9\+_\-]+)(\.[a-zA-Z0-9\+_\-]+)*@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,6}$/";
export const NAME_REGEX = "[^a-zA-Z\\s]+";
export const USERNAME_REGEX = "[^A-Za-z\\d_]";
export const DOB_REGEX = /^(?![\d]{4}-[\d]{2}-[\d]{2}$).*$/;

/* Regex validation messages */
/*--------------------------------------------------------------------------------*/
export const PASSWORD_ERR_MESSAGE = "Must contain atleast 8 characters with atleast one uppercase, one lowercase and one special character.";
export const NAME_ERR_MESSAGE = "Only letters are allowed in name field.";
export const USERNAME_ERR_MESSAGE = "Only uppercase and lowercase letters, numbers and underscore are allowed in username field.";
export const EMAIL_ERR_MESSAGE = "Email must be valid.";
export const REQUIRED_ERR_MESSAGE = "The field input is required.";
export const IS_STRING_ERR_MESSAGE = "The field value must be a string.";
export const DOB_TYPE_ERR_MESSAGE = "The date of birth must be of the type YYYY-mm-dd format."
export const INVALID_DATE_ERR_MESSAGE = "The date is invalid.";
export const IS_NON_INTEGER_ERR_MESSAGE = "The given number must be an integer";
export const IS_NEGATIVE_ERR_MESSAGE = "The given number must be non-negative.";

/** Other constants */
/*--------------------------------------------------------------------------------*/
export const topupIncrementalValue = 5;