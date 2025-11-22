"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeeting = exports.getUpcomingMeetings = exports.getMeetingStats = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const getMeetingStats = async (req, res) => {
    const userId = req.user?.userId;
    // Count upcoming meetings
    const count = await prisma_1.default.meeting.count({
        where: {
            hrId: userId,
            status: 'scheduled',
            date: { gte: new Date() }
        }
    });
    res.json(count);
};
exports.getMeetingStats = getMeetingStats;
const getUpcomingMeetings = async (req, res) => {
    const userId = req.user?.userId;
    const meetings = await prisma_1.default.meeting.findMany({
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
exports.getUpcomingMeetings = getUpcomingMeetings;
const createMeeting = async (req, res) => {
    const hrId = req.user?.userId;
    const { employee_id, meeting_date, meeting_time, purpose } = req.body;
    // Combine date and time
    const dateStr = meeting_date.split('T')[0];
    const fullDate = new Date(`${dateStr}T${meeting_time}:00`);
    try {
        const meeting = await prisma_1.default.meeting.create({
            data: {
                hrId: hrId,
                employeeId: employee_id,
                date: fullDate,
                purpose,
                status: 'scheduled'
            }
        });
        res.json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating meeting' });
    }
};
exports.createMeeting = createMeeting;
//# sourceMappingURL=meetingController.js.map