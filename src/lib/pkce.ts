/**
 * PKCE helpers for Google OAuth flow.
 * - generateCodeVerifier: random 43-128 char URL-safe string
 * - generateCodeChallenge: SHA-256 hash of verifier, base64url-encoded
 */

export function generateCodeVerifier(): string {
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = "";
  buffer.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export const PKCE_VERIFIER_KEY = "cinx:oauth:code_verifier";
export const PKCE_ROLE_KEY = "cinx:oauth:role";
export const PKCE_RETURN_URL_KEY = "cinx:oauth:return_url";
