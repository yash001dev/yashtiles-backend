import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    sub?: string;
    userId?: string;
    refreshToken?: string;
    [key: string]: any;
  };
}
