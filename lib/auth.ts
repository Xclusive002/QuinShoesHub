'use client';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'quinn123';

export interface AdminSession {
  isAuthenticated: boolean;
  username?: string;
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }

  return null;
}

function parseSessionCookie(rawValue: string): AdminSession | null {
  const candidates = [rawValue];

  try {
    candidates.push(decodeURIComponent(rawValue));
  } catch {
    // Ignore invalid URL decoding.
  }

  try {
    candidates.push(atob(rawValue));
  } catch {
    // Ignore invalid base64 decoding.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        return {
          isAuthenticated: Boolean(parsed.isAuthenticated),
          username: typeof parsed.username === 'string' ? parsed.username : undefined,
        };
      }
    } catch {
      // Continue trying the next candidate.
    }
  }

  return null;
}

export function getSessionFromStorage(): AdminSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false };
  }

  try {
    const storageValue = window.localStorage.getItem('admin-session');
    if (storageValue) {
      const parsedStorageSession = parseSessionCookie(storageValue);
      if (parsedStorageSession?.isAuthenticated) {
        return parsedStorageSession;
      }
    }
  } catch {
    // Ignore storage read failures and fall back to cookies.
  }

  const sessionCookie = getCookie('admin-session');
  if (!sessionCookie) {
    return { isAuthenticated: false };
  }

  const parsedSession = parseSessionCookie(sessionCookie);
  return parsedSession ?? { isAuthenticated: false };
}

export function isAdminAuthenticated(): boolean {
  return getSessionFromStorage().isAuthenticated;
}

export function setSessionInStorage(session: AdminSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem('admin-session', JSON.stringify(session));
  } catch {
    // Ignore storage write failures.
  }

  document.cookie = `admin-session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=43200`;
}

export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem('admin-session');
  } catch {
    // Ignore storage removal failures.
  }

  document.cookie = 'admin-session=; path=/; max-age=0';
}
