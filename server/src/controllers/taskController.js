"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const getTasks = async (req, res) => {
    const userId = req.user?.userId;
    const { employeeId } = req.query;
    try {
        let whereClause = {};
        if (employeeId) {
            // Fetch tasks for a specific employee (Admin view on EmployeeDetails)
            whereClause.employeeId = String(employeeId);
        }
        else {
            // Fetch all tasks for HR's employees (Global Dashboard)
            // Find all employees managed by this HR
            const employees = await prisma_1.default.employee.findMany({
                where: { hrId: userId },
                select: { id: true }
            });
            const employeeIds = employees.map(e => e.id);
            whereClause.employeeId = { in: employeeIds };
            whereClause.status = 'pending'; // Default filter for dashboard
        }
        const tasks = await prisma_1.default.hrTask.findMany({
            where: whereClause,
            include: { employee: { select: { name: true, role: true } } },
            orderBy: { dueDate: 'asc' }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    const { employee_id, title, category, priority, due_date } = req.body;
    try {
        const task = await prisma_1.default.hrTask.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const task = await prisma_1.default.hrTask.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating task' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.hrTask.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map