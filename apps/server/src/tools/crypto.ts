import { getRandomValues, subtle } from "crypto";

export function generateRandomString(entropyBytes: number) {
  const entropy = getRandomValues(new Uint8Array(entropyBytes));
  return Buffer.from(entropy).toString("base64url");
}

export async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return subtle.digest("SHA-256", data);
}
