import { Request } from 'express';
export interface IAuthenticatedRequest extends Request {
  userInfo: {
    userId: string;
    role: string;
    //sample, should be jwt structure
  };
}
