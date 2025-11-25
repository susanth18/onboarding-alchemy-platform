
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { employeeId } = req.query;

  try {
    let whereClause: any = {};

    if (employeeId) {
      // Fetch tasks for a specific employee (Admin view on EmployeeDetails)
      whereClause.employeeId = String(employeeId);
    } else {
      // Fetch all tasks for HR's employees (Global Dashboard)
      // Find all employees managed by this HR
      const employees = await prisma.employee.findMany({
        where: { hrId: userId },
        select: { id: true }
      });
      const employeeIds = employees.map(e => e.id);
      whereClause.employeeId = { in: employeeIds };
      whereClause.status = 'pending'; // Default filter for dashboard
    }

    const tasks = await prisma.hrTask.findMany({
      where: whereClause,
      include: { employee: { select: { name: true, role: true } } },
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const { employee_id, title, category, priority, due_date } = req.body;
  try {
    const task = await prisma.hrTask.create({
      data: {
        employeeId: employee_id,
        title,
        category,
        priority,
        dueDate: due_date ? new Date(due_date) : null,
        status: 'pending'
      }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error creating task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const task = await prisma.hrTask.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.hrTask.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
};
