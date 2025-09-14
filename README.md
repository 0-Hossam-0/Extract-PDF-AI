# Backend‑Extract‑PDF‑AI

Backend‑Extract‑PDF‑AI is a TypeScript/Express API + Web monorepo for extracting, viewing, editing, saving, listing, updating, and deleting PDF documents with AI assistance.

---

## Deployed Links (Vercel)

* **Web frontend**: [https://extract-pdf-ai.vercel.app/](https://extract-pdf-ai.vercel.app/)

* **API backend**: [https://extract-pdf-ai-9tdc.vercel.app](https://extract-pdf-ai-9tdc.vercel.app)

---

## Demo


https://github.com/user-attachments/assets/21151a1a-0164-4aa3-8ee3-08dfd6a9413a

---

## Screenshots
<p align="center">
  <img width="1307" height="906" alt="Image" src="https://github.com/user-attachments/assets/c99c6cd1-bd30-4574-8071-c5d70bc86dab" />
  <img src="https://github.com/0-Hossam-0/Extract-PDF-AI/blob/master/Screenshots/Screenshot%20from%202025-09-11%2015-09-41.png">
</p>

## Setup & Environment

### Requirements

* Node.js (version ≥ 16 recommended)
* npm or yarn
* A MongoDB database, GridFS
* AI provider API key (Gemini or GROQ)

### Environment Variables

Create a `.env` file in the root of your **Backend** project with at least the following:

```dotenv
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_key        # or
GROQ_API_KEY=your_groq_key
PORT=4000
```

---

## How to Run Locally

From the repo root, assuming a structure like:

```
  /Frontend    ← frontend
  /Backend    ← backend
```

You can run each part separately:

```bash
# Install all dependencies
npm install
```

Then in separate terminals:

```bash
# Backend (API)
cd Backend/
npm run dev

# Frontend (Web)
cd Frontend
npm run dev
```

* The backend will typically run on something like `http://localhost:4000`
* The frontend on something like `http://localhost:3000` (or whatever your config uses)

---

## API Documentation

Here are the main API routes, with sample requests & responses.

| Method   | Route                              | Description                                       | Sample Request                                                                                                            | Sample Response                                                                                                            |
| -------- | ---------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/pdf/invoices?search=<query>` | List or search invoices                           | `GET https://{YOUR_API_URL}/api/pdf/invoices?search=a`                                                                    | `200 OK` <br> `json { "invoices": [ { "id": "123", "filename": "invoice1.pdf", "text": "...extracted text..." }, ... ] } ` |
| `POST`   | `/api/pdf/invoices/upload`         | Upload a new PDF for processing                   | `POST https://{YOUR_API_URL}/api/pdf/invoices/upload` <br> Content-Type: `multipart/form-data` with file field            | `201 Created` <br> `json { "id": "123", "filename": "invoice1.pdf", "status": "processing" } `                             |
| `POST`   | `/api/pdf/invoices/extract`        | Extract the PDF from database with id             | `POST https://{YOUR_API_URL}/api/pdf/invoices/extract`                                                                    | `200 OK` <br> `json { "id": "123", "filename": "invoice1.pdf", "status": "processing" } `                             |
| `GET`    | `/api/pdf/invoices/:id`            | Get details of a specific invoice                 | `GET https://{YOUR_API_URL}/api/pdf/invoices/123`                                                                         | `200 OK` <br> `json { "id": "123", "filename": "invoice1.pdf", "text": "...extracted text..." } `                          |
| `PUT`    | `/api/pdf/invoices/:id`            | Update metadata or edited fields of a PDF invoice | `PUT https://{YOUR_API_URL}/api/pdf/invoices/123` <br> Payload: `{ "filename": "newname.pdf", "text": "edited text..." }` | `200 OK` <br> `json { "id": "123", "filename": "newname.pdf", "text": "edited text..." } `                                 |
| `DELETE` | `/api/pdf/invoices/:id`            | Delete an invoice                                 | `DELETE https://{YOUR_API_URL}/api/pdf/invoices/123`                                                                      | `204 No Content`                                                                                                           |

> Note: Adjust the routes if your codebase differs.

---

## Additional Notes

* Ensure CORS is properly configured in the backend (especially if the frontend is hosted on a different domain).

---


Thank you — contributions & issues welcome!
