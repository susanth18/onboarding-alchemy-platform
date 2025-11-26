
// Types for AI responses
export interface JobDescriptionResponse {
  markdown: string;
  suggestedSkills: string[];
  suggestedSalaryRange: { min: number; max: number; currency: string };
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  summary: string;
}

export interface CandidateAnalysis {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: "Strong Hire" | "Hire" | "Consider" | "No Hire";
  reasoning: string;
}

export interface OfferGuidanceResponse {
  min: number;
  max: number;
  median: number;
  marketPercentile: number;
  currency: string;
  explanation: string;
}

// Configuration for the AI service
// In a real app, this would point to a proxy or Edge Function to hide API keys
const AI_ENDPOINT = '/api/ai'; // or supabase.functions.invoke('ai-service')

/**
 * Generates a job description using Azure OpenAI
 */
export const generateJobDescription = async (
  role: string, 
  keywords: string[], 
  tone: 'professional' | 'casual' | 'innovative' = 'professional'
): Promise<JobDescriptionResponse> => {
  console.log(`[AI Service] Generating JD for ${role} with keywords: ${keywords.join(', ')} (${tone})`);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock response based on inputs
  return {
    markdown: `
# ${role}

## About Us
We are a forward-thinking company looking for a ${tone === 'innovative' ? 'visionary' : 'dedicated'} ${role} to join our team.

## The Role
As a ${role}, you will play a pivotal role in shaping our future. You will work with cutting-edge technologies and a passionate team.

## Key Responsibilities
${keywords.map(k => `- Leverage your expertise in **${k}** to drive results.`).join('\n')}
- Collaborate with cross-functional teams to define requirements.
- Maintain high standards of quality and performance.
- Mentor junior team members and contribute to knowledge sharing.

## Requirements
- Proven experience as a ${role} or similar role.
- Strong knowledge of ${keywords.slice(0, 3).join(', ')}.
- Excellent problem-solving skills.
- Degree in Computer Science or related field.

## Benefits
- Competitive salary and equity package.
- Flexible work hours and remote options.
- Health, dental, and vision insurance.
    `,
    suggestedSkills: [...keywords, "Communication", "Agile", "Problem Solving", "Teamwork"],
    suggestedSalaryRange: { min: 120000, max: 160000, currency: "USD" }
  };
};

/**
 * Parses a resume file using Azure Document Intelligence or OpenAI
 */
export const parseResume = async (file: File): Promise<ParsedResume> => {
  console.log(`[AI Service] Parsing resume: ${file.name}`);
  
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/alexmorgan",
    skills: ["React", "TypeScript", "Node.js", "Azure", "GraphQL"],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Solutions Inc.",
        duration: "2021 - Present",
        description: "Led the migration to React 18 and implemented CI/CD pipelines."
      },
      {
        title: "Software Developer",
        company: "Creative Web Agency",
        duration: "2018 - 2021",
        description: "Built responsive websites using Vue.js and Laravel."
      }
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        school: "State University",
        year: "2018"
      }
    ],
    summary: "Experienced full-stack developer with a passion for building scalable web applications."
  };
};

/**
 * Analyzes a candidate's fit for a role
 */
export const analyzeCandidate = async (candidateData: ParsedResume, jobDescription?: string): Promise<CandidateAnalysis> => {
  console.log(`[AI Service] Analyzing candidate: ${candidateData.name}`);
  
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    matchScore: 85,
    strengths: ["Strong technical stack (React, Node)", "Leadership experience", "Clear career progression"],
    weaknesses: ["No explicit mention of cloud architecture"],
    recommendation: "Hire",
    reasoning: "Candidate possesses the core skills required for the role and has demonstrated growth in previous positions."
  };
};


export interface GoalSuggestion {
  goal: string;
  metrics: string[];
  timeline: string;
}

export interface BiasAnalysis {
  hasBias: boolean;
  flaggedPhrases: string[];
  suggestions: string[];
  score: number; // 0-100, 100 is unbiased
}

export interface SentimentAnalysis {
  overallScore: number; // -1 to 1
  mood: "Positive" | "Neutral" | "Negative" | "Burnout Risk";
  topics: { topic: string; sentiment: "positive" | "negative" | "neutral" }[];
  burnoutRisk: "Low" | "Medium" | "High";
}

export interface LearningRecommendation {
  courseTitle: string;
  provider: string; // e.g. "LinkedIn Learning", "Coursera"
  reason: string;
  duration: string;
}

export interface AttritionPrediction {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskScore: number; // 0-100
  factors: string[];
  recommendedActions: string[];
}

/**
 * Drafts performance goals based on role and focus area
 */
export const draftPerformanceGoals = async (role: string, focusArea: string): Promise<GoalSuggestion[]> => {
    console.log(`[AI Service] Drafting goals for ${role} focusing on ${focusArea}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    return [
        {
            goal: `Increase ${focusArea} efficiency by implementing new automated workflows.`,
            metrics: ["Reduce processing time by 20%", "Automate 5 weekly reports"],
            timeline: "Q3 2024"
        },
        {
            goal: `Lead a cross-functional initiative to improve ${focusArea}.`,
            metrics: ["Stakeholder satisfaction score > 4.5/5", "Successful delivery of project X"],
            timeline: "End of Year"
        }
    ];
};

/**
 * Detects biased language in performance reviews
 */
export const detectBias = async (text: string): Promise<BiasAnalysis> => {
    console.log(`[AI Service] Analyzing text for bias`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lower = text.toLowerCase();
    const hasBias = lower.includes("aggressive") || lower.includes("emotional") || lower.includes("culture fit");

    return {
        hasBias,
        flaggedPhrases: hasBias ? ["aggressive", "emotional"] : [],
        suggestions: hasBias ? ["assertive", "passionate"] : [],
        score: hasBias ? 75 : 98
    };
};

/**
 * Analyzes sentiment from feedback or comments
 */
export const analyzeSentiment = async (texts: string[]): Promise<SentimentAnalysis> => {
    console.log(`[AI Service] Analyzing sentiment for ${texts.length} items`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        overallScore: -0.2,
        mood: "Burnout Risk",
        topics: [
            { topic: "Workload", sentiment: "negative" },
            { topic: "Management support", sentiment: "neutral" },
            { topic: "Team collaboration", sentiment: "positive" }
        ],
        burnoutRisk: "High"
    };
};

/**
 * Recommends learning content based on role and gaps
 */
export const recommendLearning = async (role: string, gaps: string[]): Promise<LearningRecommendation[]> => {
    console.log(`[AI Service] Recommending learning for ${role} with gaps: ${gaps.join(', ')}`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    return gaps.map(gap => ({
        courseTitle: `Mastering ${gap} for ${role}s`,
        provider: "Internal L&D",
        reason: `Addresses identified gap in ${gap}`,
        duration: "4 hours"
    }));
};

/**
 * Predicts attrition risk for an employee
 */
export const predictAttrition = async (employeeId: string): Promise<AttritionPrediction> => {
     console.log(`[AI Service] Predicting attrition for ${employeeId}`);
     await new Promise(resolve => setTimeout(resolve, 2000));
     
     return {
         riskLevel: "High",
         riskScore: 78,
         factors: ["Time since last promotion > 3 years", "Recent manager change", "Commute distance increased"],
         recommendedActions: ["Schedule stay interview", "Review compensation band", "Offer remote flexibility"]
     };
}

/**
 * Provides compensation guidance based on market data and internal equity
 */
export const getOfferGuidance = async (role: string, location: string, level: string): Promise<OfferGuidanceResponse> => {
  console.log(`[AI Service] Getting offer guidance for ${role} in ${location} (${level})`);
  
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock logic for variance
  const base = 100000;
  const multiplier = level === 'Senior' ? 1.5 : level === 'Lead' ? 1.8 : 1.0;
  const locMultiplier = location === 'Remote' ? 1.0 : location === 'SF' ? 1.4 : 1.1;
  const total = Math.round(base * multiplier * locMultiplier);

  return {
    min: total - 10000,
    max: total + 20000,
    median: total + 5000,
    marketPercentile: 65,
    currency: "USD",
    explanation: "Based on real-time market data from similar companies and internal pay equity analysis."
  };
};

/**
 * Generates a SMART goal based on role and focus area
 */
export const generateGoal = async (role: string, focusArea: string): Promise<string> => {
    console.log(`[AI Service] Generating goal for ${role} in ${focusArea}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return `By end of Q3, successfully implement a new ${focusArea} strategy that improves efficiency by 20%, as measured by weekly KPI tracking and team feedback.`;
};

/**
 * Drafts a performance review and checks for bias
 */
export const draftPerformanceReview = async (
    employeeName: string, 
    achievements: string[], 
    areasForImprovement: string[]
): Promise<{ text: string; biasCheck: string }> => {
    console.log(`[AI Service] Drafting review for ${employeeName}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
        text: `${employeeName} has had a strong quarter, particularly in ${achievements.join(', ')}. To reach the next level, focusing on ${areasForImprovement.join(', ')} will be key. Overall, a valuable contribution to the team.`,
        biasCheck: "No gendered or biased language detected. The review focuses on objective outcomes."
    };
};

/**
 * Analyzes sentiment from feedback or comments
 */
export const analyzeSentiment = async (feedbackItems: string[]): Promise<{ 
    score: number; 
    mood: string; 
    burnoutRisk: 'Low' | 'Medium' | 'High';
    trends: string[];
}> => {
    console.log(`[AI Service] Analyzing sentiment for ${feedbackItems.length} items`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
        score: 7.5,
        mood: "Optimistic but Stressed",
        burnoutRisk: "Medium",
        trends: ["High collaboration", "Concerns about deadlines", "Positive team culture"]
    };
};

/**
 * Recommends learning resources based on role and gaps
 */
export const getLearningRecommendations = async (role: string, skillsGap: string[]): Promise<{ title: string; type: string; duration: string }[]> => {
    console.log(`[AI Service] Getting learning recs for ${role}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return skillsGap.map(skill => ({
        title: `Mastering ${skill} for ${role}s`,
        type: "Course",
        duration: "4 hours"
    })).concat([
        { title: "Advanced Leadership Strategies", type: "Workshop", duration: "2 days" }
    ]);
};

/**
 * Generates career path suggestions
 */
export const getCareerPaths = async (currentRole: string): Promise<{ 
    role: string; 
    match: number; 
    gaps: string[] 
}[]> => {
    console.log(`[AI Service] Getting career paths for ${currentRole}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return [
        { role: "Senior " + currentRole, match: 85, gaps: ["Strategic Planning", "Mentorship"] },
        { role: "Team Lead", match: 70, gaps: ["People Management", "Budgeting"] },
        { role: "Product Manager", match: 60, gaps: ["Roadmapping", "User Research"] }
    ];
};

// --- Performance & Growth ---

export interface GoalSuggestion {
    title: string;
    description: string;
    metrics: string[];
}

export const generateGoalSuggestions = async (role: string, focusArea: string): Promise<GoalSuggestion[]> => {
    console.log(`[AI Service] Generating goals for ${role} focusing on ${focusArea}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return [
        {
            title: "Improve Code Quality",
            description: "Reduce technical debt by refactoring legacy modules and increasing test coverage.",
            metrics: ["Increase unit test coverage to 85%", "Reduce bug reports by 15%"]
        },
        {
            title: "Enhance System Scalability",
            description: "Optimize database queries and implement caching strategies to handle increased load.",
            metrics: ["Reduce API latency by 20%", "Support 2x concurrent users"]
        },
        {
            title: "Mentorship & Knowledge Sharing",
            description: "Mentor junior developers and conduct regular code review sessions.",
            metrics: ["Conduct 4 workshops", "Mentor 2 junior devs"]
        }
    ];
};

export const draftPerformanceReview = async (employeeName: string, performanceData: any): Promise<{ draft: string; biasCheck: string[] }> => {
     console.log(`[AI Service] Drafting review for ${employeeName}`);
     await new Promise((resolve) => setTimeout(resolve, 2000));

     return {
         draft: `${employeeName} has shown remarkable growth this quarter. They successfully led the migration project and demonstrated strong technical skills. However, they could improve on communication during daily stand-ups. Overall, a solid performance.`,
         biasCheck: ["No biased language detected.", "Tone is objective and constructive."]
     };
};

export const analyzeSentiment = async (feedbackText: string): Promise<{ score: number; mood: 'Positive' | 'Neutral' | 'Negative' | 'Concern'; burnoutRisk: 'Low' | 'Medium' | 'High' }> => {
     console.log(`[AI Service] Analyzing sentiment`);
     await new Promise((resolve) => setTimeout(resolve, 1000));
     
     // Mock logic
     const isNegative = feedbackText.toLowerCase().includes("stress") || feedbackText.toLowerCase().includes("tired");
     
     return {
         score: isNegative ? 0.3 : 0.8,
         mood: isNegative ? 'Concern' : 'Positive',
         burnoutRisk: isNegative ? 'High' : 'Low'
     };
};

export const getCareerPaths = async (currentRole: string): Promise<{ role: string; gap: string[]; readiness: number }[]> => {
    console.log(`[AI Service] Getting career paths for ${currentRole}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return [
        { role: "Staff Engineer", gap: ["System Architecture", "Strategic Planning"], readiness: 75 },
        { role: "Engineering Manager", gap: ["People Management", "Budgeting"], readiness: 60 },
        { role: "Principal Engineer", gap: ["Cross-team Leadership", "Public Speaking"], readiness: 40 }
    ];
};

export const getCoachingTips = async (teamData: any): Promise<string[]> => {
     console.log(`[AI Service] Generating coaching tips`);
     await new Promise((resolve) => setTimeout(resolve, 1000));

     return [
         "Encourage more open dialogue in team meetings to address recent morale dip.",
         "Recognize the efforts of the frontend team for the recent release.",
         "Schedule 1:1s with team members showing signs of burnout."
     ];
};
