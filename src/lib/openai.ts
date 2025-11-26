
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
