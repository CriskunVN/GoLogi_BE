import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch() // Để trống nghĩa là bắt TẤT CẢ, không chỉ HttpException
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // In lỗi ra console hoặc log file để debug
    console.error(exception);

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Xác định status code: Nếu là HttpException thì lấy status, nếu lỗi lạ thì trả về 500
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: 'Internal server error', // Giấu lỗi thật đi cho an toàn
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
