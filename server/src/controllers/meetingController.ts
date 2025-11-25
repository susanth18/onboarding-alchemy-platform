
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getMeetingStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    // Count upcoming meetings
    const count = await prisma.meeting.count({
        where: {
            hrId: userId,
            status: 'scheduled',
            date: { gte: new Date() }
        }
    });
    res.json(count);
};

export const getUpcomingMeetings = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const meetings = await prisma.meeting.findMany({
        where: {
            hrId: userId,
            status: 'scheduled',
            date: { gte: new Date() }
        },
        include: { employee: { select: { name: true } } },
        orderBy: { date: 'asc' },
        take: 5
    });
    res.json(meetings);
};

export const createMeeting = async (req: AuthRequest, res: Response) => {
    const hrId = req.user?.userId;
    const { employee_id, meeting_date, meeting_time, purpose } = req.body;

    // Combine date and time
    const dateStr = meeting_date.split('T')[0];
    const fullDate = new Date(`${dateStr}T${meeting_time}:00`);

    try {
        const meeting = await prisma.meeting.create({
            data: {
                hrId: hrId!,
                employeeId: employee_id,
                date: fullDate,
                purpose,
                status: 'scheduled'
            }
        });
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ error: 'Error creating meeting' });
    }
};
