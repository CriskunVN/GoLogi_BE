declare const module: any;
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from 'utils/all-exception.filter';
import { TransformInterceptor } from 'utils/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field thừa không khai báo trong DTO (Bảo mật)
      transform: true, // Tự động chuyển đổi kiểu dữ liệu phù hợp với DTO
      forbidNonWhitelisted: true, // Báo lỗi luôn nếu gửi thừa field (Tuỳ chọn)
      transformOptions: {
        enableImplicitConversion: true, // Tự động ép kiểu ngầm (VD: "10" -> 10) không cần @Type
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors({
    origin: [configService.get('FRONTEND_URL'), 'http://localhost:5173'], // Các domain được phép
    credentials: true, // Cho phép gửi cookie/auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers được phép
  });

  await app.listen(process.env.PORT ?? 8000);
  console.log('Server is running port', process.env.PORT);
}
bootstrap();
