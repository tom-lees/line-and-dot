// TODO Learn line by line
// src/lib/client.ts
export type HttpError = { status: number; message: string; body?: unknown };

export function createClient(baseUrl: string, getToken?: () => string | null) {
  async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    const token = getToken?.();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(`${baseUrl}${input}`, { ...init, headers });
    const text = await res.text();
    const body = text ? JSON.parse(text) : undefined;
    if (!res.ok) throw { status: res.status, message: res.statusText, body } as HttpError;
    return body as T;
  }

  return {
    get: <T>(url: string) => request<T>(url, { method: 'GET' }),
    post: <T, B = unknown>(url: string, body?: B) =>
      request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  };
}
