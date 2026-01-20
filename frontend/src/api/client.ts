function getToken() {
  return window.localStorage.getItem('token');
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const headers = new Headers(init.headers);
  // Only set content-type for JSON requests.
  // For file uploads/downloads we may need to omit it.
  if (!headers.has('content-type') && init.body != null && typeof init.body === 'string') {
    headers.set('content-type', 'application/json');
  }

  const token = getToken();
  if (token) headers.set('authorization', `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res;
}

