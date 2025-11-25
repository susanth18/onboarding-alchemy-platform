
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { settings, name, company, position } = req.body;

    try {
        const dataToUpdate: any = {};

        if (settings) {
            dataToUpdate.settings = JSON.stringify(settings);
        }

        // Handle Profile updates (name, company, position)
        if (name) dataToUpdate.name = name;
        if (company) dataToUpdate.company = company;
        if (position) dataToUpdate.position = position;

        await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating settings/profile:", error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};
