export const setClientCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === 'https:';
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=lax${isSecure ? ';Secure' : ''}`;
  document.cookie = cookieString;
  console.log(`🍪 Setting cookie: ${name}`, { secure: isSecure, cookieString });
};

export const getClientCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  console.log(`🍪 Cookie not found: ${name}`, { allCookies: document.cookie });
  return null;
};

export const clearClientCookie = (name: string) => {
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=lax${isSecure ? ';Secure' : ''}`;
  console.log(`🍪 Cleared cookie: ${name}`);
};
