import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMilestones: (req: AuthRequest, res: Response) => Promise<void>;
export declare const assignPlan: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMilestone: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=planController.d.ts.map