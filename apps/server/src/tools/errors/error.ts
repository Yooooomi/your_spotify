export const ErrorTypeToHTTPCode = {
  MALFORMED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNKNOWN: 500,
} as const;

export class YourSpotifyError extends Error {
  public type: keyof typeof ErrorTypeToHTTPCode = "UNKNOWN";
}
