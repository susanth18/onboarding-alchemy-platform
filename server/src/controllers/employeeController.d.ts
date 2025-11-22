import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getEmployees: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getEmployeeById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createEmployee: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateEmployee: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=employeeController.d.ts.map