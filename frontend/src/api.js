export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'خطا در ارتباط با سرور');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const money = (n) => Number(n || 0).toLocaleString('fa-IR') + ' ریال';
export const date = (d) => (d ? new Date(d).toLocaleDateString('fa-IR') : '—');
