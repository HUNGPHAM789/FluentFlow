// --- services/promptBuilder.ts ---
import { AppSettings, AppMode } from '../types';

/**
 * Builds the final, structured prompt string for the Gemini API.
 * This combines the app's metadata (mode, level) with the user's specific request.
 * 
 * @param settings The current settings selected by the user.
 * @param userInput The raw text input from the user (e.g., "fix my sentence" or a specific topic).
 * @returns The final prompt string.
 */
export const buildGeminiPrompt = (
  settings: AppSettings,
  userInput: string,
): string => {
  const { level, mode, context } = settings;
  
  // 1. Start with the structured metadata tags
  let prompt = `mode=${mode}, level=${level}.`;

  // 2. Add optional context if available
  if (context) {
    prompt += ` Context: ${context}.`;
  }

  // 3. Append the user's actual request based on mode
  switch (mode) {
    case 'EXPLAIN':
      // The user wants an explanation
      prompt += ` Task: Explain, define, or analyze the term/concept "${userInput}".`;
      break;
      
    case 'EXERCISE':
      // Check if it's a specific drill (often indicated by context) or a general topic quiz
      if (context?.includes("JSON") || context?.includes("Drill")) {
         prompt += ` Task: Create a practice exercise for: "${userInput}".`;
      } else {
         prompt += ` Create 5 to 8 questions on the topic: "${userInput}". Generate the full exercise structure including ### Answer Key and ### Explanations.`;
      }
      break;
      
    case 'SPEAKING':
      // The user wants a dialogue/role-play
      if (context?.includes("JSON")) {
        prompt += ` Task: Create a natural speaking scenario or sentence for topic: "${userInput}".`;
      } else {
        prompt += ` Create a short dialogue for a speaking practice scenario: "${userInput}". Include ### Useful phrases.`;
      }
      break;
      
    case 'EXAM':
      // The user wants exam-specific content
      prompt += ` Adapt the request to ${level} standards. The request is: "${userInput}"`;
      break;

    case 'FEEDBACK':
      // The user is submitting an answer for correction
      prompt += ` Check and provide feedback on the following text based on the level ${level}: "${userInput}"`;
      break;
      
    default:
      // Fallback for general chat/unspecified mode
      prompt += ` ${userInput}`;
      break;
  }
  
  return prompt.trim();
};