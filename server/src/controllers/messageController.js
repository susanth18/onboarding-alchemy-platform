"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const getMessages = async (req, res) => {
    const userId = req.user?.userId;
    // Using OR logic to find messages where current user is sender OR receiver
    // Filter can be specific if needed (e.g. filter by other person)
    // Frontend usually filters by conversation partner.
    // Or we can return all relevant messages for this user.
    try {
        const messages = await prisma_1.default.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    const senderId = req.user?.userId;
    const { receiver_id, content } = req.body;
    if (!senderId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const message = await prisma_1.default.message.create({
            data: {
                senderId,
                receiverId: receiver_id,
                content,
                read: false
            }
        });
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ error: 'Error sending message' });
    }
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=messageController.js.map