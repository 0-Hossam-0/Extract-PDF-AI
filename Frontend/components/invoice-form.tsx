'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { InvoiceData, InvoiceFormProps } from '@/types/invoice.type';

export function InvoiceForm({ data, onSave, isLoading, resetUploadedFile }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceData>({
    fileId: '',
    vendor: {
      name: '',
      address: '',
      taxId: '',
    },
    invoice: {
      number: '',
      date: '',
      currency: 'USD',
      subtotal: 0,
      taxPercent: 0,
      total: 0,
      poNumber: '',
      poDate: '',
      lineItems: [],
    },
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        lineItems: [...prev.invoice.lineItems, { description: '', unitPrice: 0, quantity: 1, total: 0 }],
      },
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        lineItems: prev.invoice.lineItems.filter((_, i) => i !== index),
      },
    }));
  };
  const handleClear = () => {
    resetUploadedFile();
    setFormData({
      fileId: '',
      vendor: {
        name: '',
        address: '',
        taxId: '',
      },
      invoice: {
        number: '',
        date: '',
        currency: 'USD',
        subtotal: 0,
        taxPercent: 0,
        total: 0,
        poNumber: '',
        poDate: '',
        lineItems: [],
      },
    });
  };
  const updateLineItem = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newLineItems = [...prev.invoice.lineItems];
      newLineItems[index] = { ...newLineItems[index], [field]: value };

      if (field === 'unitPrice' || field === 'quantity') {
        newLineItems[index].total = newLineItems[index].unitPrice * newLineItems[index].quantity;
      }

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          lineItems: newLineItems,
        },
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Extracting invoice data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              value={formData.vendor.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  vendor: { ...prev.vendor, name: e.target.value },
                }))
              }
              placeholder="Enter vendor name"
            />
          </div>
          <div>
            <Label htmlFor="vendor-address">Address</Label>
            <Textarea
              id="vendor-address"
              value={formData.vendor.address || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  vendor: { ...prev.vendor, address: e.target.value },
                }))
              }
              placeholder="Enter vendor address"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="vendor-tax-id">Tax ID</Label>
            <Input
              id="vendor-tax-id"
              value={formData.vendor.taxId || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  vendor: { ...prev.vendor, taxId: e.target.value },
                }))
              }
              placeholder="Enter tax ID"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                value={formData.invoice.number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, number: e.target.value },
                  }))
                }
                placeholder="INV-001"
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={formData.invoice.date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, date: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={formData.invoice.subtotal || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, subtotal: Number.parseFloat(e.target.value) || 0 },
                  }))
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="tax-percent">Tax %</Label>
              <Input
                id="tax-percent"
                type="number"
                step="0.01"
                value={formData.invoice.taxPercent || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, taxPercent: Number.parseFloat(e.target.value) || 0 },
                  }))
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={formData.invoice.total || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, total: Number.parseFloat(e.target.value) || 0 },
                  }))
                }
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Line Items</span>
            <Button onClick={addLineItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.invoice.lineItems.map((item, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Item {index + 1}</span>
                <Button
                  onClick={() => removeLineItem(index)}
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  placeholder="Item description"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', Number.parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input type="number" step="0.01" value={item.total} readOnly className="bg-muted" />
                </div>
              </div>
            </div>
          ))}

          {formData.invoice.lineItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No line items added yet</p>
              <p className="text-sm">Click "Add Item" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Save Invoice
        </Button>
      </div>
    </div>
  );
}
