export interface InvoiceData {
  fileId: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
  };
}


export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvoiceData) => void;
  data: InvoiceData | null;
  title: string;
}

export interface ````````````````````````````````````````````````````````````````````InvoiceFormProps {
  data: InvoiceData | null;
  onSave: (data: InvoiceData) => void;
  isLoading?: boolean;
  resetUploadedFile: () => void;
}
