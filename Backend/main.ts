import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import pdfRoutes from './src/routes/pdf.route';
import { errorHandlerMiddleware } from './src/middlewares/error.middleware';
import { corsMiddleware } from './src/middlewares/cors.middleware';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: 'https://frontend-extract-pdf-ai.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/pdf', pdfRoutes);

// Error handler
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
export default app; // export for Vercel serverless
