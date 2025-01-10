export class ApiResponse<T> {
  status: string;
  message: string;
  statusCode: number; // Used for both success and error responses
  data?: T;
  error?: any;
  meta?: any;

  constructor(
    status: string,
    message: string,
    statusCode: number,
    data?: T,
    meta?: any,
    error?: any,
  ) {
    this.status = status;
    this.message = message;
    this.statusCode = statusCode;
    if (data !== undefined && data !== null) {
      this.data = data;
    }
    if (meta !== undefined && meta !== null) {
      this.meta = meta;
    }
    if (error !== undefined && error !== null) {
      this.error = error;
    }
  }

  // Static method to create a successful response
  static success<T>(
    data: T,
    message = 'Request was successful',
    statusCode = 200,
    meta?: any,
  ): ApiResponse<T> {
    return new ApiResponse<T>('success', message, statusCode, data, meta);
  }

  // Static method to create an error response
  static error(
    message: string,
    statusCode = 400,
    error?: any,
  ): ApiResponse<null> {
    return new ApiResponse<null>(
      'error',
      message,
      statusCode,
      undefined,
      undefined,
      error,
    );
  }

  // Converts the response to plain JSON object
  toJSON() {
    const responseObject: any = {
      status: this.status,
      message: this.message,
      statusCode: this.statusCode,
    };
    if (this.data !== undefined) {
      responseObject.data = this.data;
    }
    if (this.meta !== undefined) {
      responseObject.meta = this.meta;
    }
    if (this.error !== undefined) {
      responseObject.error = this.error;
    }
    return responseObject;
  }
}
