import z from 'zod';
import logger from '../../utils/logger.util';
import { Request, Response,NextFunction } from 'express';
import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { ILogMessages } from '../types/pdf.type';

export const validateRequest = (Schema: z.ZodObject, place : 'body'| 'query' | 'params') => (req: any, res: any, next: any) => {
  try {
    const data = req[place]
    logger.debug('Validating request', { place: data });
    Schema.parse(data);
    logger.debug('Request validation successful', { place: data });
    next();
  } catch (err: any) {
    throw Object.assign(new Error('Validation Error'), { dev: err, middleware: 'validateRequest' });
  }
};


export const checkExists =
  (
    shouldExist: boolean,
    type: string,
    keySearch: string,
    valueSearch: string,
    place: 'body' | 'params',
    Collection: Model<any>,
    logs: ILogMessages
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug('Existence check running...', {
        method: req.method,
        endpoint: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers?.['user-agent'],
        middleware: 'checkExists',
      });
      const data = await Collection.findOne({ [keySearch]: (req as any)[place][valueSearch] });
      if (!data && shouldExist) {
        logger.warn(logs.NOT_FOUND, {
          method: req.method,
          endpoint: req.originalUrl,
          ip: req.ip,
          userAgent: req.headers?.['user-agent'],
          middleware: 'checkExists',
        });
        return res.status(StatusCodes.NOT_FOUND).json({ message: logs.NOT_FOUND });
      }
      if (data && !shouldExist) {
        logger.warn(logs.EXISTS, {
          method: req.method,
          endpoint: req.originalUrl,
          ip: req.ip,
          userAgent: req.headers?.['user-agent'],
          middleware: 'checkExists',
        });
        return res.status(StatusCodes.CONFLICT).json({ message: logs.EXISTS });
      }
      logger.info(logs.SUCCESS, {
        method: req.method,
        endpoint: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers?.['user-agent'],
        middleware: 'checkExists',
      });
      if (data) {
        (req as any)[type] = data;
        (req as any)[type].id = data._id.toString();
      }
      next();
    } catch (error) {
      throw Object.assign(
        new Error(`Failed to check if ${type} ${shouldExist ? 'exists' : 'does not exist'} with ${keySearch}`),
        {
          middleware: 'checkExists',
          type,
          keySearch,
          shouldExist,
          place,
          dev: error,
        }
      );
    }
  };
