export interface IIDentifier<T> {
  identifierKey: keyof T;
  identifier: T[keyof T];
}
