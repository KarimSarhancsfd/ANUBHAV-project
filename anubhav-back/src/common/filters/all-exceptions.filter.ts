import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * STABILITY: Global Exception Filter.
 *
 * Design goals:
 * - Prevent sensitive internal error leak (e.g., DB connection strings).
 * - Uniform error response format.
 * - Log all 5xx errors for production monitoring.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log critical errors (5xx)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${
          exception instanceof Error ? exception.message : 'Unknown'
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // If message is an object (from ValidationPipe), spread it
      ...(typeof message === 'object' ? message : { message }),
    });
  }
}
