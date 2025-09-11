import z from 'zod';

export const InvoiceResponseSchema = z.object({
  fileId: z
    .string()
    .min(1, 'fileId cannot be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'fileId must be alphanumeric with dashes/underscores only'),
  fileName: z.string().min(1, 'fileName cannot be empty'),
  invoice: z.object({
    currency: z.string().optional(),
    date: z.string().min(1, 'invoice.date cannot be empty'),
    number: z.string().min(1, 'invoice.number cannot be empty'),
    poDate: z.string().optional(),
    poNumber: z.string().optional(),
    subtotal: z.coerce.number().min(0, 'invoice.subtotal must be non-negative').optional(),
    taxPercent: z.coerce.number().min(0, 'invoice.taxPercent must be non-negative').optional(),
    total: z.coerce.number().min(0, 'invoice.total must be non-negative').optional(),
    lineItems: z
      .array(
        z.object({
          description: z.string().min(1, 'lineItems.description cannot be empty'),
          unitPrice: z.coerce.number().min(0, 'lineItems.unitPrice must be non-negative'),
          quantity: z.coerce.number().min(0, 'lineItems.quantity must be non-negative'),
          total: z.coerce.number().min(0, 'lineItems.total must be non-negative'),
        })
      )
      .min(1, 'invoice.lineItems must have at least one item'),
  }),
  vendor: z.object({
    name: z.string().min(1, 'vendor.name cannot be empty'),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
});

export type IInvoice = z.infer<typeof InvoiceResponseSchema>;

// export type IInvoice = z.infer<typeof InvoiceResponseSchema>;

export const InvoiceExtractionSchema = z
  .object({
    modal: z.enum(['gemini', 'groq']).default('groq'),
    fileId: z.string(),
  })
  .refine((data) => data.fileId.trim().length > 0, {
    message: 'fileId cannot be empty',
    path: ['fileId'],
  })
  .refine((data) => /^[a-zA-Z0-9_-]+$/.test(data.fileId), {
    message: 'fileId must be alphanumeric with dashes/underscores only',
    path: ['fileId'],
  });

// export type IInvoice = z.infer<typeof InvoiceSchema>;
