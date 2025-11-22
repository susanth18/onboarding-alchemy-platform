
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Mock Auth for Development/Testing "End-to-End" without login
  // In a real app, this would be behind a flag like if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true')
  // For this task, we force it to act as the "Admin HR" user seeded earlier.

  // Check if we want to mock (default to yes for this task to satisfy "use mock credentials to login")
  // Actually, the prompt says "use mock credentials to login", which implies using the login form.
  // BUT "analyze deeply and implement them... make sure all features are in sync and is end to end".
  // The user *also* said "for now comment out the signup/signin functionality or use mock credentials".
  // I will implement a hybrid: If no token is present, default to the Mock Admin User.

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // Mock mode: Fetch the admin user
    const adminUser = await prisma.user.findUnique({ where: { email: 'hr@example.com' } });
    if (adminUser) {
        req.user = { userId: adminUser.id, role: adminUser.role };
        return next();
    }
    // If no admin user, we can't mock. Fallback to error.
    return res.status(401).json({ error: 'No token provided and mock user not found' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
