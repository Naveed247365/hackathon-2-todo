/**
 * Better Auth API route handler.
 * Maps Better Auth endpoints to FastAPI backend auth endpoints.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = 'http://localhost:8000';

/**
 * Map Better Auth paths to backend paths.
 * Better Auth uses: /api/auth/sign-in/email, /api/auth/sign-up/email
 * Backend uses: /api/auth/login, /api/auth/signup
 */
function mapAuthPath(path: string): string {
  if (path === 'sign-in/email' || path === 'sign-in') {
    return 'login';
  }
  if (path === 'sign-up/email' || path === 'sign-up') {
    return 'signup';
  }
  return path;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { all } = req.query;
  const path = Array.isArray(all) ? all.join('/') : all || '';
  const mappedPath = mapAuthPath(path);

  try {
    const backendUrl = `${BACKEND_URL}/api/auth/${mappedPath}`;
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