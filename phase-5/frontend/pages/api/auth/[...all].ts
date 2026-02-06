/**
 * Better Auth API route handler.
 * Proxies auth requests to FastAPI backend.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { all } = req.query;
  const path = Array.isArray(all) ? all.join('/') : all || '';

  try {
    const backendUrl = `${BACKEND_URL}/api/auth/${path}`;
    const response = await fetch(backendUrl, {
      method: req.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization as string }
          : {}),
      },
      ...(req.body && req.method !== 'GET'
        ? { body: JSON.stringify(req.body) }
        : {}),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Auth service unavailable' });
  }
}
