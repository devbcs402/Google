import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evm-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('evm-token')) {
      localStorage.removeItem('evm-token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return (
    error.customMessage ||
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.'
  );
}

export async function downloadBackupPdf() {
  try {
    const response = await api.get('/emails/backup/pdf', {
      responseType: 'blob'
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = `email-vault-backup-${new Date().toISOString().split('T')[0]}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return filename;
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json?.message) error.customMessage = json.message;
      } catch {
        /* ignore */
      }
    }
    throw error;
  }
}
