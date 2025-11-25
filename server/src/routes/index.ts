
import express from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/authController';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, getMyProfile } from '../controllers/employeeController';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { getMilestones, assignPlan, updateMilestone } from '../controllers/planController';
import { getMessages, sendMessage } from '../controllers/messageController';
import { getProfile, updateSettings } from '../controllers/settingsController';
import { createMeeting, getUpcomingMeetings } from '../controllers/meetingController';
import {
    generateJobDescription,
    generateOnboardingPlan,
    draftEmail,
    detectRisks,
    checkCompliance,
    suggestMeetingTime,
    askHrBot,
    parseResume,
    analyzeSentiment,
    recommendResources
} from '../controllers/aiController';
import { uploadDocument, downloadDocument, getDocuments } from '../controllers/documentController';
import { upload } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Auth
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// Employees
router.get('/employees/me', authMiddleware, getMyProfile); // Must be before :id
router.get('/employees', authMiddleware, getEmployees);
router.get('/employees/:id', authMiddleware, getEmployeeById);
router.post('/employees', authMiddleware, createEmployee);
router.patch('/employees/:id', authMiddleware, updateEmployee);

// Tasks
router.get('/hr_tasks', authMiddleware, getTasks);
router.post('/hr_tasks', authMiddleware, createTask);
router.patch('/hr_tasks/:id', authMiddleware, updateTask);
router.delete('/hr_tasks/:id', authMiddleware, deleteTask);

// Milestones
router.get('/milestones', authMiddleware, getMilestones);
router.post('/milestones', authMiddleware, assignPlan);
router.patch('/milestones/:id', authMiddleware, updateMilestone);

// Messages
router.get('/messages', authMiddleware, getMessages);
router.post('/messages', authMiddleware, sendMessage);

// Settings & Profile (HR Profiles table was merged into User for this implementation)
router.get('/hr_profiles', authMiddleware, getProfile);
router.patch('/hr_profiles', authMiddleware, updateSettings); // Assuming single user update by ID from token

// Meetings
router.post('/meetings', authMiddleware, createMeeting);
router.get('/meetings', authMiddleware, getUpcomingMeetings);

// AI Copilot Features
router.post('/ai/generate-jd', authMiddleware, generateJobDescription);
router.post('/ai/generate-plan', authMiddleware, generateOnboardingPlan);
router.post('/ai/draft-email', authMiddleware, draftEmail);
router.get('/ai/risks', authMiddleware, detectRisks);
router.get('/ai/compliance', authMiddleware, checkCompliance);
router.get('/ai/suggest-meeting', authMiddleware, suggestMeetingTime);
router.post('/ai/chat', authMiddleware, askHrBot);
router.post('/ai/parse-resume', authMiddleware, parseResume);
router.post('/ai/sentiment', authMiddleware, analyzeSentiment);
router.get('/ai/resources', authMiddleware, recommendResources);

// Documents
router.post('/documents/upload', authMiddleware, upload.single('file'), uploadDocument);
router.get('/documents/:id/download', authMiddleware, downloadDocument); // Auth optional? No, secure it.
router.get('/documents', authMiddleware, getDocuments);

export default router;
