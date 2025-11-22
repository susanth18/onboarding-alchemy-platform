
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { subDays } from 'date-fns';

// Standard Pre-boarding Tasks logic moved to backend
const STANDARD_PRE_BOARDING_TASKS = [
  { title: "Prepare Offer Letter", daysBefore: 14, category: "HR" },
  { title: "Order Laptop & Equipment", daysBefore: 10, category: "IT" },
  { title: "Create Company Email", daysBefore: 7, category: "IT" },
  { title: "Setup Payroll Account", daysBefore: 5, category: "Finance" },
  { title: "Send Welcome Packet", daysBefore: 3, category: "HR" },
  { title: "Add to Slack/Teams", daysBefore: 1, category: "IT" },
  { title: "Day 1 Logistics Email", daysBefore: 1, category: "HR" },
];

export const getEmployees = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  try {
    const employees = await prisma.employee.findMany({
      where: { hrId: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employees' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true } // Include linked user info if needed
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employee' });
  }
};

// New Endpoint for Employee Portal
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const employee = await prisma.employee.findUnique({
            where: { userId: userId }
        });

        if (!employee) return res.status(404).json({ error: 'Employee profile not found for this user' });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching my profile' });
    }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId; // The HR User ID
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { name, email, phone, role, employee_id, start_date } = req.body;

  try {
    // 1. Create Employee Record
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        phone,
        role,
        employeeId: employee_id,
        startDate: start_date ? new Date(start_date) : null,
        hrId: userId,
        status: 'pending'
      }
    });

    // 2. Auto-Generate HR Tasks (Copilot Logic)
    if (start_date) {
      const startDateObj = new Date(start_date);
      const tasksToCreate = STANDARD_PRE_BOARDING_TASKS.map(task => {
        const dueDate = subDays(startDateObj, task.daysBefore);
        return {
          title: task.title,
          category: task.category,
          priority: 'medium',
          status: 'pending',
          dueDate: dueDate,
          employeeId: employee.id
        };
      });

      await prisma.hrTask.createMany({
        data: tasksToCreate
      });
    }

    // 3. Create User Account for Employee
    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Check if user email exists (rare edge case if creating employee who is already a user)
    let userAccount = await prisma.user.findUnique({ where: { email } });

    if (!userAccount) {
      userAccount = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'EMPLOYEE'
        }
      });
    }

    // Link User to Employee
    await prisma.employee.update({
      where: { id: employee.id },
      data: { userId: userAccount.id }
    });

    // In production, send email with tempPassword here
    console.log(`[EMAIL MOCK] Credentials for ${email}: ${tempPassword}`);

    res.json({ ...employee, userId: userAccount.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating employee' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await prisma.employee.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating employee' });
  }
};
