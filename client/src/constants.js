/* Regex validating expressions */
/*--------------------------------------------------------------------------------*/
export const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}/;
export const EMAIL_REGEX = /^([a-zA-Z0-9+_-]+)(\.[a-zA-Z0-9+_-]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;
export const NAME_REGEX = /[^a-zA-Z\s]+/gm;
export const USERNAME_REGEX = /[^A-Za-z0-9_]/gm;

/* Regex validation error messages */
/*--------------------------------------------------------------------------------*/
export const PASSWORD_ERR_MESSAGE = "Must contain atleast 8 characters with atleast one uppercase, one lowercase and one special character.";
export const NAME_ERR_MESSAGE = "Only letters are allowed.";
export const USERNAME_ERR_MESSAGE = "Only letters, numbers and underscore are allowed.";
export const EMAIL_ERR_MESSAGE = "Email must be valid.";
export const CONFIRM_PASSWORD_MESSAGE = "Confirm Password must be same as Password.";

/* Request Methods */
/*--------------------------------------------------------------------------------*/
export const GET = "get";
export const POST = "post";
export const PUT = "put";
export const DELETE = "delete";

/* API half URLs */
/*--------------------------------------------------------------------------------*/
export const GET_POSTS = "posts/all";
export const GET_OTP = "user/verify-email";
export const VERIFY_OTP = "user/check-otp";
export const REGISTER = "user/register";
export const CHECK_USER_CREDENTIALS = "user/check-user-credentials";
export const LOGIN = "user/login";
export const GOOGLE_USER_VERIFICATION = "https://www.googleapis.com/oauth2/v1/userinfo";
export const CHECK_GOOGLE_CREDENTIALS = "user/check-google-credentials";
export const REGISTER_GOOGLE_AUTHED_USER = "user/register-google-authed-user";
export const LOGIN_WITH_GOOGLE_CRED = "user/login-with-google-cred";

export const CREATE_POST = "posts/create";
export const GET_SCHEDULED_POSTS = "posts/scheduled/all";
export const GET_SAMPLE_FILE = "posts/sample-file"