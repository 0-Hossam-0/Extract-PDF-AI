import { Router } from 'express';
import multer from 'multer';
import {
  deletePDF,
  extractPDF,
  getInvoice,
  getInvoices,
  searchInvoice,
  updateInvoice,
  uploadPDF,
} from '../controllers/pdf.controller';
import { InvoiceExtractionSchema, InvoiceResponseSchema } from '../../validator/pdf.validator';
import { checkExists, validateRequest } from '../middlewares/pdf.middleware';
import InvoiceCollection from '../models/invoice.model';
import { getCheckExistsLogger } from '../../utils/checkExists.util';

const router = Router();
const upload = multer();

router.post('/extract', validateRequest(InvoiceExtractionSchema, 'body'), extractPDF);

router.post('/upload', upload.single('file'), uploadPDF);

router.delete(
  '/invoices/:fileId',
  checkExists(true, 'invoice', 'fileId', 'fileId', 'params', InvoiceCollection, getCheckExistsLogger('invoice')),
  deletePDF
);

router.get(
  '/invoices/:fileId',
  checkExists(true, 'invoice', 'fileId', 'fileId', 'params', InvoiceCollection, getCheckExistsLogger('invoice')),
  getInvoice
);

router.get('/invoices', searchInvoice);

router.put(
  '/invoices/:id',
  upload.single('file'),
  checkExists(true, 'invoice', '_id', 'id', 'params', InvoiceCollection, getCheckExistsLogger('invoice')),
  validateRequest(InvoiceResponseSchema, 'body'),
  updateInvoice
);

// router.get('/invoices', getInvoices)

export default router;
