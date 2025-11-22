"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getProfile = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const getProfile = async (req, res) => {
    const userId = req.user?.userId;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
};
exports.getProfile = getProfile;
const updateSettings = async (req, res) => {
    const userId = req.user?.userId;
    const { settings } = req.body;
    try {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { settings: JSON.stringify(settings) } // Ensure it's stored as string if using sqlite/postgres text
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating settings' });
    }
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=settingsController.js.map