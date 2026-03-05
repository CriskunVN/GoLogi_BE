import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    console.error(exception);

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Lấy thông tin từ exception
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errors: Array<{ field: string; message: string }> = [];

    if (exception instanceof HttpException) {
      const response = exception.getResponse() as any;
      message = response?.message || exception.message;

      // Xử lý validation errors từ ValidationPipe
      if (
        httpStatus === HttpStatus.BAD_REQUEST &&
        Array.isArray(response?.message)
      ) {
        errorCode = 'VALIDATION_ERROR';
        errors = response.message.map((err: any) => ({
          field: err.property,
          message: Object.values(err.constraints || {})[0],
        }));
      } else if (httpStatus === HttpStatus.BAD_REQUEST) {
        errorCode = 'VALIDATION_ERROR';
      } else if (httpStatus === HttpStatus.UNAUTHORIZED) {
        errorCode = 'UNAUTHORIZED';
      } else if (httpStatus === HttpStatus.FORBIDDEN) {
        errorCode = 'FORBIDDEN';
      } else if (httpStatus === HttpStatus.NOT_FOUND) {
        errorCode = 'NOT_FOUND';
      } else if (httpStatus === HttpStatus.CONFLICT) {
        errorCode = 'CONFLICT';
      }
    }

    const responseBody: ErrorResponse = {
      success: false,
      statusCode: httpStatus,
      message,
      errorCode,
      ...(errors.length > 0 && { errors }),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
