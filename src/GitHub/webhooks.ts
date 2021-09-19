import { createHmac } from 'crypto';

export const isSignatureValid = (
  signature: string,
  token: string,
  payload: string,
  algorithm: 'sha1' | 'sha256',
) => {
  const digest = createHmac(algorithm, token)
    .update(payload)
    .digest('hex');

  return signature === `${algorithm}=${digest}`;
};

export const getSignatureHeaderName = (algorithm: 'sha1' | 'sha256') => {
  if (algorithm === 'sha256') {
    return 'x-hub-signature-256';
  }

  return 'x-hub-signature';
};
