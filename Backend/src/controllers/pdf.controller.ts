import { GoogleGenerativeAI } from '@google/generative-ai';
import { Request, Response } from 'express';
import { PDFRequest } from '../types/pdf.type';
import dotenv from 'dotenv';
import { InvoiceCollection } from '../models/invoice.model';
import { getGFS } from '../../config/database';
import { ObjectId } from 'mongodb';
import pdf from 'pdf-parse';
import axios from 'axios';
import mongoose from 'mongoose';
import { geminiPrompt, groqPrompt } from '../../utils/prompt.util';
import { streamToBuffer } from '../../utils/streamToBuffer.util';
import logger from '../../utils/logger.util';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const extractPDF = async (req: Request, res: Response) => {
  const { fileId, model } = req.body;

  try {
    const invoiceDoc = await InvoiceCollection.findOne({ fileId });
    if (!invoiceDoc) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Invoice not found' });
    }

    const gfs = getGFS();
    const downloadStream = gfs.openDownloadStream(new ObjectId(fileId));
    const buffer = await streamToBuffer(downloadStream);

    logger.debug(`Processing fileId ${fileId} with buffer size: ${buffer.length} bytes`, { middleware: 'extractPDF' });

    const maxRetries = 3;
    let pdfData = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Parsing attempt ${attempt} for fileId: ${fileId}`, { middleware: 'extractPDF' });
        pdfData = await pdf(buffer);
        logger.debug(`PDF parsed successfully on attempt ${attempt}`, { middleware: 'extractPDF' });
        break;
      } catch (error: any) {
        logger.warn(`PDF parsing attempt ${attempt} failed: ${error.message}`, { middleware: 'extractPDF' });
        if (attempt === maxRetries) {
          logger.error(`Failed to parse PDF after ${maxRetries} attempts`, { middleware: 'extractPDF' });
        }
      }
    }
    if (!pdfData) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Pdf couldn't be parsed" });
    }

    const pdfText = pdfData.text?.trim();
    let extracted: any;
    if (!pdfText) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'PDF contains no text' });
    }

    if (model.toLowerCase() === 'gemini') {
      const aiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = geminiPrompt(pdfText);

      const result = await aiModel.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json|```/g, '')
        .trim();

      extracted = JSON.parse(text);
    } else if (model.toLowerCase() === 'groq') {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/responses',
        {
          model: 'openai/gpt-oss-120b',
          input: groqPrompt(pdfText),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const groqResponse = response.data;
      if (!groqResponse.output || groqResponse.output.length === 0) {
        throw new Error('Groq did not return any output');
      }

      const outputItem = groqResponse.output.find((item: any) => item.content && item.content.length > 0);
      if (!outputItem) {
        throw new Error('Groq API returned no content');
      }

      let text = outputItem.content
        .map((c: any) => (c.text ? c.text : ''))
        .join('')
        .replace(/```json|```/g, '')
        .trim();

      if (!text) {
        throw new Error('Groq returned empty text');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Groq returned invalid JSON format');
      }
      extracted = JSON.parse(jsonMatch[0]);
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Unsupported model type' });
    }

    const updatedInvoice = await InvoiceCollection.findOneAndUpdate(
      { fileId },
      { $set: { vendor: extracted.vendor, invoice: extracted.invoice, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return res.status(StatusCodes.OK).json({ invoice: updatedInvoice });
  } catch (err: any) {
    logger.error(`Extraction error: ${err.message}`, { middleware: 'extractPDF' });
    return res.status(StatusCodes.BAD_GATEWAY).json({ error: `Failed to extract PDF: ${err.message}` });
  }
};

export const uploadPDF = async (req: PDFRequest, res: Response) => {
  if (!req.file) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });

  const gfs = getGFS();
  const uploadStream = gfs.openUploadStream(req.file.originalname);

  uploadStream.end(req.file.buffer);

  uploadStream.on('finish', async () => {
    const fileId = uploadStream.id.toString();
    if (req.file) {
      await InvoiceCollection.create({
        fileId,
        fileName: req.file.originalname,
        vendor: { name: 'Unknown' },
        invoice: { number: 'Unknown', date: new Date().toISOString(), lineItems: [] },
        createdAt: new Date().toISOString(),
      });

      res.status(StatusCodes.CREATED).json({ fileId, fileName: req.file.originalname });
    }
  });

  uploadStream.on('error', (err) => {
    logger.error(`GridFS upload error: ${err.message}`, { middleware: 'uploadPDF' });
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Failed to save PDF' });
  });
};

export const deletePDF = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const bucket = getGFS();
    const objectId = new mongoose.Types.ObjectId(fileId);

    await bucket.delete(objectId);
    await InvoiceCollection.deleteOne({ fileId: fileId });

    res.status(StatusCodes.OK).json({ message: `File with ID: ${fileId} deleted successfully.` });
  } catch (error: any) {
    logger.error(`Error deleting file from GridFS: ${error.message}`, { middleware: 'deletePDF' });
    if (error.name === 'FileNotFound') {
      return res.status(StatusCodes.NOT_FOUND).send('PDF file not found.');
    }
    res.status(StatusCodes.BAD_REQUEST).send('An internal server error occurred while deleting the file.');
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  logger.debug(`Fetching invoice with fileId: ${fileId}`, { middleware: 'getInvoice' });
  const invoice = await InvoiceCollection.findOne({ fileId: fileId });
  logger.debug(`Fetched invoice: ${JSON.stringify(invoice)}`, { middleware: 'getInvoice' });
  return res.status(StatusCodes.OK).json({
    message: 'Invoice found successfully',
    invoice: invoice,
  });
};

export const searchInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceName = (req.query.search as string)?.trim();
    if (!invoiceName) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Search term is required' });
    }

    const regex = new RegExp(invoiceName, 'i');

    const invoices = await InvoiceCollection.find({
      'vendor.name': { $regex: regex },
    });

    res.status(StatusCodes.OK).json(invoices);
  } catch (err) {
    throw Object.assign(new Error('Validation Error'), { dev: err, middleware: 'getInvoice' });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  const invoices = await InvoiceCollection.find();

  res.status(StatusCodes.OK).json({
    invoices: invoices,
  });
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    logger.debug('Update request received', { body: req.body, middleware: 'updateInvoice' });

    const { fileId, fileName, vendor, invoice } = req.body;

    const updatedFields: any = { updatedAt: new Date() };

    if (fileName) updatedFields.fileName = fileName;
    if (vendor) updatedFields.vendor = vendor;
    if (invoice) updatedFields.invoice = invoice;

    const updatedInvoice = await InvoiceCollection.findOneAndUpdate(
      { fileId: fileId },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      logger.warn(`No invoice found with fileId: ${fileId}`, { fileId, middleware: 'updateInvoice' });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Invoice not found.' });
    }

    logger.info(`Invoice with fileId: ${fileId} updated successfully.`, { fileId, middleware: 'updateInvoice' });
    return res.status(StatusCodes.OK).json({
      message: 'Invoice updated successfully.',
      data: updatedInvoice,
    });
  } catch (error: any) {
    throw Object.assign(new Error('Validation Error'), { dev: error, middleware: 'updateInvoice' });
  }
};
