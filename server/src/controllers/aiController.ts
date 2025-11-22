
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { subDays, addDays, format } from 'date-fns';
import { getCompletion } from '../services/openaiService';

// 1. Job Description Generator
export const generateJobDescription = async (req: AuthRequest, res: Response) => {
  const { role } = req.body;

  const prompt = `Write a professional job description for a ${role}. Include responsibilities and requirements.`;
  const aiResponse = await getCompletion(prompt);

  if (aiResponse) {
      return res.json({ description: aiResponse });
  }

  // Fallback
  const templates: Record<string, string> = {
    "Software Engineer": "We are looking for a Software Engineer to build high-quality software. You will work with a team of developers to design, test, and implement new features.\n\nResponsibilities:\n- Write clean, efficient code.\n- Debug and resolve issues.\n- Collaborate with product managers.",
    "Product Manager": "We need a Product Manager to guide the success of our products. You will lead the product team and align product strategy with business goals.\n\nResponsibilities:\n- Define product roadmap.\n- Analyze market trends.\n- Prioritize features.",
    "HR Specialist": "We are seeking an HR Specialist to manage our recruitment and employee relations. You will be the go-to person for all HR-related queries.\n\nResponsibilities:\n- Screen resumes.\n- Conduct interviews.\n- Manage onboarding."
  };

  const description = templates[role] || `We are looking for a ${role} to join our team. You will be responsible for key initiatives in your department.\n\nResponsibilities:\n- Drive projects to completion.\n- Collaborate with cross-functional teams.\n- Maintain high standards of quality.`;

  res.json({ description });
};

// 2. Smart Onboarding Plan
export const generateOnboardingPlan = async (req: AuthRequest, res: Response) => {
    const { role } = req.body;

    const prompt = `Create a 30-60-90 day onboarding plan for a ${role}. Return JSON format with title and category (First 30 Days, 60 Days, 90 Days).`;
    const aiResponse = await getCompletion(prompt);

    // Parsing AI JSON response is risky without structure mode, so we keep fallback as primary if parsing fails.
    // For this MVP, let's stick to the reliable template logic unless we want to parse complex text.
    // To "automate" we can use AI to generate specific text items if we had structured output.

    const baseTasks = [
        { title: "Company Orientation", category: "First 30 Days" },
        { title: "Meet the Team", category: "First 30 Days" }
    ];

    const roleTasks: Record<string, any[]> = {
        "Software Engineer": [
            { title: "Setup Dev Environment", category: "First 30 Days" },
            { title: "Commit first code", category: "60 Days" },
            { title: "Lead a tech talk", category: "90 Days" }
        ],
        "Product Manager": [
            { title: "Review Product Roadmap", category: "First 30 Days" },
            { title: "Conduct User Interviews", category: "60 Days" },
            { title: "Launch a Feature", category: "90 Days" }
        ]
    };

    const suggestedPlan = [...baseTasks, ...(roleTasks[role] || [])];
    res.json({ plan: suggestedPlan });
};

// 3. Email Drafter
export const draftEmail = async (req: AuthRequest, res: Response) => {
    const { type, recipientName, role, startDate } = req.body;

    const prompt = `Draft a ${type} email for ${recipientName} who is joining as a ${role} on ${startDate}.`;
    const aiResponse = await getCompletion(prompt);

    if (aiResponse) {
        return res.json({ subject: `${type === 'welcome' ? 'Welcome' : 'Offer'}: ${role}`, body: aiResponse });
    }

    let subject = "";
    let body = "";

    if (type === "welcome") {
        subject = `Welcome to the team, ${recipientName}!`;
        body = `Hi ${recipientName},\n\nWe are thrilled to have you join us as a ${role} starting on ${startDate}. We have a great onboarding plan ready for you.\n\nBest,\nThe HR Team`;
    } else if (type === "offer") {
        subject = `Job Offer: ${role} at Acme Corp`;
        body = `Dear ${recipientName},\n\nWe are pleased to offer you the position of ${role}. Please find the attached offer letter.\n\nRegards,\nHR Manager`;
    }

    res.json({ subject, body });
};

// 4. Risk Detector
export const detectRisks = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const overdueTasks = await prisma.hrTask.findMany({
        where: {
            employee: { hrId: userId },
            status: 'pending',
            dueDate: { lt: new Date() }
        },
        include: { employee: true }
    });

    const risks: Record<string, any> = {};
    overdueTasks.forEach(task => {
        if (!risks[task.employeeId]) {
            risks[task.employeeId] = {
                employeeName: task.employee.name,
                reason: "Overdue Tasks",
                count: 0,
                details: []
            };
        }
        risks[task.employeeId].count++;
        risks[task.employeeId].details.push(task.title);
    });

    res.json(Object.values(risks));
};

// 5. Compliance Auditor
export const checkCompliance = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const employees = await prisma.employee.findMany({
        where: { hrId: userId },
        include: { documents: true } // Updated to use Document model if available, or legacy fields
    });

    const issues = [];
    for (const emp of employees) {
        const missing = [];

        // Check Documents table first
        const hasContract = emp.documents.some(d => d.type === 'contract') || emp.contractUrl;
        const hasJD = emp.documents.some(d => d.type === 'job_description') || emp.jobDescriptionUrl;

        if (!hasContract) missing.push("Contract");
        if (!hasJD) missing.push("Job Description");

        if (missing.length > 0) {
            issues.push({
                employeeName: emp.name,
                missingDocs: missing,
                severity: missing.includes("Contract") ? "High" : "Medium"
            });
        }
    }

    res.json(issues);
};

// 6. Smart Scheduler
export const suggestMeetingTime = async (req: AuthRequest, res: Response) => {
    // In a real app, check calendar availability
    const suggestions = [
        { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: "10:00" },
        { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: "14:00" },
        { date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), time: "11:00" }
    ];
    res.json({ suggestions });
};

// 7. HR Q&A Bot
export const askHrBot = async (req: AuthRequest, res: Response) => {
    const { question } = req.body;

    const prompt = `You are an HR assistant. Answer this employee question based on standard HR policies: ${question}`;
    const aiResponse = await getCompletion(prompt);

    if (aiResponse) {
        return res.json({ answer: aiResponse });
    }

    const q = question.toLowerCase();
    let answer = "I'm not sure about that. Please check the handbook.";

    if (q.includes("holiday") || q.includes("leave")) {
        answer = "Employees are entitled to 25 days of paid annual leave plus bank holidays.";
    } else if (q.includes("remote") || q.includes("home")) {
        answer = "We operate a hybrid policy: 3 days in office, 2 days from home.";
    } else if (q.includes("pay") || q.includes("salary")) {
        answer = "Payroll is processed on the 25th of each month.";
    } else if (q.includes("dress")) {
        answer = "Our dress code is business casual.";
    }

    res.json({ answer });
};

// 8. Resume Parser (Mock)
export const parseResume = async (req: AuthRequest, res: Response) => {
    res.json({
        extracted: {
            name: "Candidate Name (Extracted)",
            email: "candidate@example.com",
            skills: ["JavaScript", "React", "Node.js"],
            experience: "5 years"
        }
    });
};

// 9. Sentiment Analyzer
export const analyzeSentiment = async (req: AuthRequest, res: Response) => {
    const { text } = req.body;

    const prompt = `Analyze the sentiment of this feedback text. Return only one word: Positive, Negative, or Neutral. Text: "${text}"`;
    const aiResponse = await getCompletion(prompt);

    if (aiResponse) {
        return res.json({ sentiment: aiResponse.trim(), score: 0 }); // Score is mock
    }

    // Fallback
    const positive = ["great", "good", "happy", "excited", "love", "excellent"];
    const negative = ["bad", "sad", "worried", "confused", "hate", "poor"];

    const tokens = text.toLowerCase().split(/\s+/);
    let score = 0;
    tokens.forEach((t: string) => {
        if (positive.includes(t)) score++;
        if (negative.includes(t)) score--;
    });

    let sentiment = "Neutral";
    if (score > 0) sentiment = "Positive";
    if (score < 0) sentiment = "Negative";

    res.json({ sentiment, score });
};

// 10. Resource Recommender
export const recommendResources = async (req: AuthRequest, res: Response) => {
    const { role } = req.query;

    const resources: Record<string, any[]> = {
        "Software Engineer": [
            { title: "Clean Code (Book)", type: "Book", url: "#" },
            { title: "React Documentation", type: "Website", url: "https://react.dev" }
        ],
        "Product Manager": [
            { title: "Inspired (Book)", type: "Book", url: "#" },
            { title: "Product School", type: "Course", url: "#" }
        ]
    };

    const recs = resources[String(role)] || [
        { title: "Company Handbook", type: "Document", url: "#" },
        { title: "Security Training", type: "Course", url: "#" }
    ];

    res.json(recs);
};
