declare module 'express' {
  interface Request {
    params: any;
    query: any;
  }
}

export {};
