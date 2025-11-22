import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMeetingStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUpcomingMeetings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createMeeting: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=meetingController.d.ts.map