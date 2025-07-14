// use declaration merging to extend the Express Request interface.
declare namespace Express {
  export interface Request {
    isAuthenticated?: boolean;
  }
}