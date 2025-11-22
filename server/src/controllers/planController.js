"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilestone = exports.assignPlan = exports.getMilestones = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const getMilestones = async (req, res) => {
    const { employeeId } = req.query;
    try {
        const milestones = await prisma_1.default.milestone.findMany({
            where: { employeeId: String(employeeId) },
            orderBy: { id: 'asc' }
        });
        res.json(milestones);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching milestones' });
    }
};
exports.getMilestones = getMilestones;
const assignPlan = async (req, res) => {
    const { milestones } = req.body; // Expects array of { employee_id, title, category ... }
    if (!Array.isArray(milestones))
        return res.status(400).json({ error: 'Invalid format' });
    try {
        // Map snake_case to camelCase if needed, or assume frontend sends correct structure
        const data = milestones.map((m) => ({
            employeeId: m.employee_id,
            title: m.title,
            category: m.category,
            completed: m.completed || false,
            notes: m.notes || ''
        }));
        await prisma_1.default.milestone.createMany({ data });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error assigning plan' });
    }
};
exports.assignPlan = assignPlan;
const updateMilestone = async (req, res) => {
    const { id } = req.params;
    const { completed, notes } = req.body;
    try {
        const updateData = {};
        if (completed !== undefined)
            updateData.completed = completed;
        if (notes !== undefined)
            updateData.notes = notes;
        const milestone = await prisma_1.default.milestone.update({
            where: { id: Number(id) },
            data: updateData
        });
        res.json(milestone);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating milestone' });
    }
};
exports.updateMilestone = updateMilestone;
//# sourceMappingURL=planController.js.map