export function toBoolean(str: unknown) {
  return str ? (str as string).toLowerCase() === 'true' : undefined;
}

export function toNumber(str: unknown) {
  return str ? parseFloat(str as string) : undefined;
}

export function toDate(str: unknown) {
  return str ? new Date(str as string) : undefined;
}
