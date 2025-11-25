
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prisma';
import { sendPasswordResetEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role = 'HR', company } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        company,
        settings: JSON.stringify({
            notifications: { email: true },
            system: { language: 'en', dateFormat: 'mdy' }
        })
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    const settings = user.settings ? JSON.parse(user.settings) : {};
    settings.resetToken = resetTokenHash;
    settings.resetTokenExpiry = resetTokenExpiry.toISOString();

    await prisma.user.update({
      where: { id: user.id },
      data: { settings: JSON.stringify(settings) }
    });

    const resetUrl = `${FRONTEND_URL}/auth?tab=reset-password&token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetToken, resetUrl);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const users = await prisma.user.findMany();
    let user = null;

    for (const u of users) {
      if (u.settings) {
        const settings = JSON.parse(u.settings);
        if (settings.resetToken === resetTokenHash) {
          const expiry = new Date(settings.resetTokenExpiry);
          if (expiry > new Date()) {
            user = u;
            break;
          }
        }
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const settings = JSON.parse(user.settings!);
    delete settings.resetToken;
    delete settings.resetTokenExpiry;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        settings: JSON.stringify(settings)
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error resetting password' });
  }
};
