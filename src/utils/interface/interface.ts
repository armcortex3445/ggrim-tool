export interface IdentifierInterface<T> {
  identifierKey: keyof T;
  identifier: T[keyof T];
}
