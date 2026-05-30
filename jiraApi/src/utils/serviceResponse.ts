export interface ServiceResponse<T = any> {
  status: boolean;
  httpCode: number;
  key: string;
  data?: T;
}
export const serviceResponse = {
  success<T = any>(
    key: string = "DEFAULT",
    data: T = {} as T,
    httpCode: number = 200
  ): ServiceResponse<T> {
    return {
      status: true,
      httpCode,
      key,
      data,
    };
  },

  error<T = any>(
    key: string = "DEFAULT",
    data: T = {} as T,
    httpCode: number = 400
  ): ServiceResponse<T> {
    return {
      status: false,
      httpCode,
      key,
      data,
    };
  },
};