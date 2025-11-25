
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || "gpt-35-turbo";

let client: any | null = null;

try {
    if (endpoint && apiKey) {
        const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
        client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    } else {
        console.warn("Azure OpenAI credentials not found. AI features will use fallback logic.");
    }
} catch (error) {
    console.warn("Azure OpenAI client not available. AI features will use fallback logic.");
}

export const getCompletion = async (prompt: string, systemMessage: string = "You are a helpful HR Assistant."): Promise<string | null> => {
    if (!client) return null;

    try {
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
        ];

        const result = await client.getChatCompletions(deploymentId, messages);
        return result.choices[0].message?.content || null;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return null;
    }
};
