import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
  origin: function (origin: string | undefined, callbackFunc: CallableFunction) {
    if (!origin) return callbackFunc(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      callbackFunc(null, true);
    } else {
      callbackFunc(new Error(`CORS Policy: Origin ${origin} not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
};

export const corsMiddleware = cors(corsOptions);
