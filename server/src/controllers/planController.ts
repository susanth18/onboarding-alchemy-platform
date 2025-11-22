
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getMilestones = async (req: AuthRequest, res: Response) => {
  const { employeeId } = req.query;
  try {
    const milestones = await prisma.milestone.findMany({
      where: { employeeId: String(employeeId) },
      orderBy: { id: 'asc' }
    });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching milestones' });
  }
};

export const assignPlan = async (req: AuthRequest, res: Response) => {
  const { milestones } = req.body; // Expects array of { employee_id, title, category ... }

  if (!Array.isArray(milestones)) return res.status(400).json({ error: 'Invalid format' });

  try {
    // Map snake_case to camelCase if needed, or assume frontend sends correct structure
    const data = milestones.map((m: any) => ({
      employeeId: m.employee_id,
      title: m.title,
      category: m.category,
      completed: m.completed || false,
      notes: m.notes || ''
    }));

    await prisma.milestone.createMany({ data });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error assigning plan' });
  }
};

export const updateMilestone = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { completed, notes } = req.body;

  try {
    const updateData: any = {};
    if (completed !== undefined) updateData.completed = completed;
    if (notes !== undefined) updateData.notes = notes;

    const milestone = await prisma.milestone.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: 'Error updating milestone' });
  }
};
