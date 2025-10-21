// ...existing code...
export function absoluteUrl(path: string, req?: { headers?: Record<string,string> }) {
  const envBase = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || process.env.BASE_URL;
  if (envBase) {
    try { return new URL(path, envBase).toString(); } catch { /* fallthrough */ }
  }
  if (req && req.headers && req.headers['host']) {
    const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
    try { return new URL(path, `${proto}://${req.headers['host']}`).toString(); } catch {}
  }
  return `http://localhost:3000${path.startsWith('/') ? path : '/' + path}`;
}