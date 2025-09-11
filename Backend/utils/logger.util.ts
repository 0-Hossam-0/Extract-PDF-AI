// logger.util.ts
import winston from 'winston';

export { createCombinedLogger };

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const SENSITIVE_KEYS = ['password', 'token', 'refreshToken', 'creditCard', 'ssn'];

const createLoggerFormat = (middlewareName: string) => {
  return winston.format.combine(
    winston.format.timestamp({ format: TIMESTAMP_FORMAT }),
    winston.format.json(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...rest } = info;
      return JSON.stringify({
        timestamp,
        level,
        middleware: middlewareName,
        message,
        ...rest,
      });
    })
  );
};

// Pretty console format
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: TIMESTAMP_FORMAT }),
  winston.format.colorize(),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, req, ...restMeta } = info;
    const request = req;

    const requestContext = request
      ? {
          method: request.method,
          endpoint: request.originalUrl,
          ip: request.ip,
          userAgent: request.headers?.['user-agent'],
        }
      : {};

    const { headers, ...restMetaWithoutHeaders } = restMeta;
    const allMeta = { ...requestContext, ...restMetaWithoutHeaders };

    const ctx = Object.entries(allMeta)
      .map(([key, value]) => {
        const formattedValue = formatValue(value);
        return formattedValue ? `${key}=${formattedValue}` : null;
      })
      .filter(Boolean)
      .join(' | ');

    return `${timestamp} [${level}]${ctx ? ` [${ctx}]` : ''} - ${message}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: TIMESTAMP_FORMAT }),
  winston.format.json()
);

const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') return body;

  const clone: Record<string, any> = { ...body };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.includes(key)) {
      clone[key] = '***REDACTED***';
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitizeBody(clone[key]);
    }
  }
  return clone;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return '';
    return JSON.stringify(sanitizeBody(value));
  }
  return String(value);
};

// Create a console transport to reuse
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// Single logger function that only writes to console (was file)
const createCombinedLogger = (middlewareName: string) => {
  return winston.createLogger({
    format: createLoggerFormat(middlewareName),
    transports: [consoleTransport],
  });
};

// For middlewares that should only log to combined logs (console only)
const createCombinedOnlyLogger = (middlewareName: string) => {
  return winston.createLogger({
    format: createLoggerFormat(middlewareName),
    transports: [consoleTransport],
  });
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [consoleTransport],
  exitOnError: false,
});

export const createLogger = (moduleFilename?: string) => {
  const baseMeta = moduleFilename ? { file: moduleFilename } : {};
  return {
    info: (msg: string, meta?: Record<string, any>) => logger.info(msg, { ...baseMeta, ...meta }),
    warn: (msg: string, meta?: Record<string, any>) => logger.warn(msg, { ...baseMeta, ...meta }),
    error: (msg: string, meta?: Record<string, any>) => logger.error(msg, { ...baseMeta, ...meta }),
    debug: (msg: string, meta?: Record<string, any>) => logger.debug(msg, { ...baseMeta, ...meta }),
  };
};

export default logger;
