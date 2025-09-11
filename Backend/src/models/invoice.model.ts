import mongoose from 'mongoose';

const InvoiceSchema: mongoose.Schema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },

    vendor: {
      name: { type: String, required: true },
      address: { type: String },
      taxId: { type: String },
    },

    invoice: {
      number: { type: String, required: true },
      date: { type: String, required: true },
      currency: { type: String },
      subtotal: { type: Number },
      taxPercent: { type: Number },
      total: { type: Number },
      poNumber: { type: String },
      poDate: { type: String },
      lineItems: [
        {
          description: { type: String, required: true },
          unitPrice: { type: Number, required: true },
          quantity: { type: Number, required: true },
          total: { type: Number, required: true },
        },
      ],
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const InvoiceCollection = mongoose.model('Invoice', InvoiceSchema);

export default InvoiceCollection;
