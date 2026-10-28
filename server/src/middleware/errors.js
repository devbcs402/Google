export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  if (error instanceof SyntaxError && error.status === 400 && Object.hasOwn(error, 'body')) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error?.name === 'ValidationError') {
    return res.status(400).json({ message: 'Please check the provided information.', errors: Object.fromEntries(Object.entries(error.errors).map(([key, item]) => [key, item.message])) });
  }
  if (error?.code === 11000) return res.status(409).json({ message: 'An account with that email is already registered.' });
  if (error?.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  if (process.env.NODE_ENV !== 'production') console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
