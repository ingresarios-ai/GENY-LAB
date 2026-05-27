// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://genylab.ingresarios.net',
  'http://localhost:5173',
  'http://localhost:4173',
];

export function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0]; // default to production
}

// Legacy static headers (used by functions that don't pass req)
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://genylab.ingresarios.net',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
