export interface StandardResponse<T = any> {
  message: string;
  data: T | null;
  errorCode: string | null;
}
