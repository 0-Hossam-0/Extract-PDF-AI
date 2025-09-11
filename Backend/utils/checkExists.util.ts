import { ILogMessages } from '../src/types/pdf.type';

export const getCheckExistsLogger = (type: 'invoice'): ILogMessages => {
  switch (type) {
    case 'invoice':
      return {
        NOT_FOUND: 'Invoice is not found.',
        EXISTS: 'Invoice with this fileId already exists.',
        SUCCESS: 'Invoice existence check passed successfully.',
      };
  }
};
