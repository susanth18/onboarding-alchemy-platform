
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  // Using OR logic to find messages where current user is sender OR receiver
  // Filter can be specific if needed (e.g. filter by other person)
  // Frontend usually filters by conversation partner.
  // Or we can return all relevant messages for this user.
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const senderId = req.user?.userId;
  const { receiver_id, content } = req.body;

  if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: receiver_id,
        content,
        read: false
      }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
};
