const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001/api/v1';

// TEMP: fake user id – replace with real auth later
const FAKE_USER_ID = process.env.NEXT_PUBLIC_FAKE_USER_ID ?? '';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': FAKE_USER_ID,
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

