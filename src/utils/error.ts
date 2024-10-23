export const ErrorEnum = {
  REST_API: "REST_API",
  INTERNAL_LOGIC: "INTERNAL_LOGIC",
};

type ErrorType = typeof ErrorEnum;
type ErrorTypeKeys = keyof ErrorType;

export class CustomError extends Error {
  constructor(location: string, errEnum: ErrorTypeKeys, message: string) {
    const msg = `[${location}][${errEnum}] ` + message;
    super(msg);
  }
}
