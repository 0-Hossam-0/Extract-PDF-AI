import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import logger from '../../utils/logger.util';


export const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const middleware = err.middleware as string;
  if (err.dev instanceof ZodError) {
    const flattened = err.dev.flatten();
    logger.warn(`Validation Warn : ${JSON.stringify(flattened.fieldErrors, null, 2)}`, {
      req: req,
      responseStatusCode: StatusCodes.BAD_REQUEST,
      middleware: middleware,
    });
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: flattened.fieldErrors,
    });
  }

  logger.error(`${err.dev}`, {
    req: req,
    responseStatusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    middleware: middleware,
  });
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message || 'Something went wrong.',
  });
};
