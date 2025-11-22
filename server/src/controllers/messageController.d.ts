import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messageController.d.ts.map