/**
 * Better Auth API route handler.
 * Catches all /api/auth/* requests and delegates to Better Auth.
 *
 * Note: For full Better Auth server integration, this route would initialize
 * the Better Auth server instance. In this hackathon setup, auth is handled
 * by the FastAPI backend, and this route serves as the Better Auth client
 * API endpoint for session management.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract the auth path after /api/auth/
  const { all } = req.query;
  const path = Array.isArray(all) ? all.join('/') : all || '';

  // Proxy auth requests to FastAPI backend
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
