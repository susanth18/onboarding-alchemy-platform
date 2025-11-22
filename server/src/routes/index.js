"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const employeeController_1 = require("../controllers/employeeController");
const taskController_1 = require("../controllers/taskController");
const planController_1 = require("../controllers/planController");
const messageController_1 = require("../controllers/messageController");
const settingsController_1 = require("../controllers/settingsController");
const meetingController_1 = require("../controllers/meetingController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Auth
router.post('/auth/login', authController_1.login);
router.post('/auth/register', authController_1.register);
// Employees
router.get('/employees', auth_1.authMiddleware, employeeController_1.getEmployees);
router.get('/employees/:id', auth_1.authMiddleware, employeeController_1.getEmployeeById);
router.post('/employees', auth_1.authMiddleware, employeeController_1.createEmployee);
router.patch('/employees/:id', auth_1.authMiddleware, employeeController_1.updateEmployee);
// Tasks
router.get('/hr_tasks', auth_1.authMiddleware, taskController_1.getTasks);
router.post('/hr_tasks', auth_1.authMiddleware, taskController_1.createTask);
router.patch('/hr_tasks/:id', auth_1.authMiddleware, taskController_1.updateTask);
router.delete('/hr_tasks/:id', auth_1.authMiddleware, taskController_1.deleteTask);
// Milestones
router.get('/milestones', auth_1.authMiddleware, planController_1.getMilestones);
router.post('/milestones', auth_1.authMiddleware, planController_1.assignPlan);
router.patch('/milestones/:id', auth_1.authMiddleware, planController_1.updateMilestone);
// Messages
router.get('/messages', auth_1.authMiddleware, messageController_1.getMessages);
router.post('/messages', auth_1.authMiddleware, messageController_1.sendMessage);
// Settings & Profile (HR Profiles table was merged into User for this implementation)
router.get('/hr_profiles', auth_1.authMiddleware, settingsController_1.getProfile);
router.patch('/hr_profiles', auth_1.authMiddleware, settingsController_1.updateSettings); // Assuming single user update by ID from token
// Meetings
router.post('/meetings', auth_1.authMiddleware, meetingController_1.createMeeting);
router.get('/meetings', auth_1.authMiddleware, meetingController_1.getUpcomingMeetings);
exports.default = router;
//# sourceMappingURL=index.js.map