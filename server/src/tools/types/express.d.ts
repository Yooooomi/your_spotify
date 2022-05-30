declare module 'express' {
  interface Request {
    params: any;
    query: Record<string, any>;
  }
}

export {};
