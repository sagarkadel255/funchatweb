export const isValidEmail    = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const isValidPassword = (p: string) => p.length >= 6;
export const isValidUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);