export interface IResponse<T> {
  code: '000' | '001';
  message: 'success' | string;
  data?: T;
}