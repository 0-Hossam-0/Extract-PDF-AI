'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InvoiceForm } from './invoice-form';
import { InvoiceData, InvoiceModalProps } from '@/types/invoice.type';
import axios from 'axios';
import { API_URL } from '../environment/environment';

export function InvoiceModal({ isOpen, onClose, onSave, data, title }: InvoiceModalProps) {
  const handleSave = async (formData: InvoiceData) => {
    onSave(formData);
    console.log(formData);
    const response = await axios.put(`${API_URL}/invoices/${formData.fileId}`, {
      ...formData,
    });

    if (!response.request.status.toString().startsWith('2')) {
      alert('Failed to save invoice data');
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <InvoiceForm data={data} onSave={handleSave} isLoading={false} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
