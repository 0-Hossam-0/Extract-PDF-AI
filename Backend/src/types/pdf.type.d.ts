import { Request } from 'express';

export interface PDFRequest extends Request {
  file?: Express.Multer.File;
}

export interface ILogMessages {
  NOT_FOUND: string;
  EXISTS: string;
  SUCCESS: string;
}