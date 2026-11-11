import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid JSON body.' });
  } else if (error?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large.' });
  } else {
    console.error('Unexpected backend error');
    res.status(500).json({ error: 'Internal server error.' });
  }
};
