import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { MyLoggerService } from './my-logger/my-logger.service';
import { Request, Response } from 'express';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

type MyResponseObject = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionFilter.name);
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const myResponseObject: MyResponseObject = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };
    if (exception instanceof HttpException) {
      myResponseObject.statusCode = exception.getStatus();
      myResponseObject.response = exception.getResponse();
    } else if (exception instanceof PrismaClientValidationError) {
      myResponseObject.statusCode = 422;
      myResponseObject.response = exception.message.replaceAll(/\n/g, '');
    } else {
      myResponseObject.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObject.response = 'INTERNAL_SERVER_ERROR';
    }
    response.status(myResponseObject.statusCode).json(myResponseObject);
    this.logger.error(myResponseObject.response, AllExceptionFilter.name);
    super.catch(exception, host);
  }
}
