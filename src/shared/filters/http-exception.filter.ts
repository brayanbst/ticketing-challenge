import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IResponse } from '../interfaces/response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as any;
      message = body?.message ?? body ?? exception.message;
      if (Array.isArray(message)) message = message.join(', ');
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const payload: IResponse<never> = {
      code: '001',
      message: String(message),
    };

    res.status(status).json(payload);
  }
}
