export function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
