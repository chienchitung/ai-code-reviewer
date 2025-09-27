import { GoogleGenAI, Type } from '@google/genai';
import { Language, ReviewIssue } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const reviewSchema = {
    type: Type.OBJECT,
    properties: {
        report: {
            type: Type.STRING,
            description: "A comprehensive and constructive code review report in Markdown format.",
        },
        issues: {
            type: Type.ARRAY,
            description: "A list of identified issues.",
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: {
                        type: Type.STRING,
                        enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
                        description: "The severity of the issue.",
                    },
                    category: {
                        type: Type.STRING,
                        description: "The category of the issue (e.g., 'Security', 'Performance', 'Best Practices').",
                    },
                    lineNumber: {
                        type: Type.INTEGER,
                        description: "The line number where the issue occurs. Use 0 if not applicable.",
                    },
                    description: {
                        type: Type.STRING,
                        description: "A concise description of the issue.",
                    },
                    suggestion: {
                        type: Type.STRING,
                        description: "A concrete suggestion or code example to fix the issue.",
                    },
                },
                required: ['severity', 'category', 'lineNumber', 'description', 'suggestion'],
            },
        },
    },
    required: ['report', 'issues'],
};


const getPrompt = (language: string, code: string, appLanguage: Language): string => {
    const langInstruction = appLanguage === Language.ZH_TW 
        ? "Your entire response, including the markdown report and all JSON fields (like description, suggestion, category), must be in Traditional Chinese (zh-tw)."
        : "Your entire response, including the markdown report and all JSON fields, must be in English (en).";

    return `
You are a world-class senior software engineer acting as an automated code reviewer.
Your task is to provide a comprehensive and constructive review of the following ${language} code.

Please analyze the code for clarity, best practices, potential bugs, performance, and security vulnerabilities.
Generate a detailed report in Markdown format and also provide a structured list of all identified issues.
If no issues are found, the 'issues' array should be empty, and the report should be a brief, positive confirmation.

${langInstruction}

Code to review:
\`\`\`${language}
${code}
\`\`\`
`;
}


export const analyzeCodeWithGemini = async (code: string, language: string, appLanguage: Language): Promise<{ report: string; issues: ReviewIssue[] }> => {
  const prompt = getPrompt(language, code, appLanguage);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: reviewSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
        const fallbackMessage = appLanguage === Language.ZH_TW 
            ? "AI 未能生成分析報告。" 
            : "The AI failed to generate an analysis report.";
        return { report: fallbackMessage, issues: [] };
    }

    const parsedResponse = JSON.parse(responseText);
    
    const report = parsedResponse.report || '';
    const issues = parsedResponse.issues || [];

    return { report, issues };

  } catch (error) {
    console.error('Error analyzing code with Gemini:', error);
    if (error instanceof SyntaxError) {
        throw new Error(appLanguage === Language.ZH_TW
            ? '無法解析 AI 的回應。 AI 可能回傳了無效的格式。'
            : 'Failed to parse the AI response. It might be in an invalid format.');
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error(appLanguage === Language.ZH_TW 
            ? '設定的 API 金鑰無效。請檢查您的設定。' 
            : 'The configured API key is invalid. Please check your settings.');
    }
    throw new Error(appLanguage === Language.ZH_TW 
        ? '與 AI 通訊時發生錯誤。請稍後再試。' 
        : 'An error occurred while communicating with the AI. Please try again later.');
  }
};
