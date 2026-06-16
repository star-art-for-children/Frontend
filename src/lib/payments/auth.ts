export const buildTossAuthHeader = (secretKey: string): string =>
  `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
