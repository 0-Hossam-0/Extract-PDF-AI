// declare module 'pdfjs-dist/legacy/build/pdf' {
//   const pdfjsLib: any;
//   export = pdfjsLib;
// }

declare module 'pdfjs-dist/legacy/build/pdf.worker.min.js' {
  const workerSrc: string;
  export = workerSrc;
}