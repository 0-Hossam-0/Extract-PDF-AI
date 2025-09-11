export const groqPrompt = (
  pdfText: string
) => `Extract the following fields from this invoice PDF and return ONLY valid JSON and convert numeric fields to numbers. Use empty strings for text fields and 0 for numbers, and don't respond with any text other than the JSON:
          use this exact JSON format in the response:
  {

    "vendor": { "name": "", "address": "", "taxId": "" },

    "invoice": {

      "number": "",

      "date": "",

      "currency": "",

      "subtotal": 0,

      "taxPercent": 0,

      "total": 0,

      "poNumber": "",

      "poDate": "",

      "lineItems": [

        { "description": "", "unitPrice": 0, "quantity": 0, "total": 0 }

      ]

    }

  }

PDF Content:
${pdfText}`;

export const geminiPrompt = (
  pdfText: string
) => `Extract the following fields from this invoice PDF and return ONLY valid JSON. Use empty strings for text fields and 0 for numbers:
{
  "vendor": { "name": "", "address": "", "taxId": "" },
  "invoice": {
    "number": "",
    "date": "",
    "currency": "",
    "subtotal": 0,
    "taxPercent": 0,
    "total": 0,
    "poNumber": "",
    "poDate": "",
    "lineItems": [
      { "description": "", "unitPrice": 0, "quantity": 0, "total": 0 }
    ]
  }
}

PDF Content:
${pdfText}`;
