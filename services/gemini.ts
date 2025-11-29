
// --- services/gemini.ts ---
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SpeakingFeedback, AppLanguage } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Lazy initialization to prevent runtime crashes if env vars aren't ready at module load
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

/* -------------------------------------------------------------------------- */
/*                                TUTOR MODES                                 */
/* -------------------------------------------------------------------------- */

// 1. WRITING FEEDBACK
export type WritingFeedbackParams = {
  learnerText: string;
  questionPrompt?: string;
  level?: string;
  examType?: string;
  learnerLanguage?: string;
};

export async function getWritingFeedback(params: WritingFeedbackParams) {
  const { learnerText, questionPrompt, level = "A2-B1", examType, learnerLanguage = "vi" } = params;
  
  const prompt = [
    `METADATA (JSON): ${JSON.stringify({ mode: "WRITING_FEEDBACK", level, examType, learnerLanguage })}`,
    ``,
    `TASK: You are FLUENTFLOW_TUTOR working ONLY in Tutor/Writing mode.`,
    `The app already has lessons and questions. You only correct and improve the learner's text.`,
    ``,
    questionPrompt ? `Question / task the learner answered:\n${questionPrompt}\n` : ``,
    `Learner's text:\n${learnerText}`,
    ``,
    `Please respond in this structure:`,
    `1) Corrected text:`,
    `...`,
    `2) Key issues (2–4 bullet points):`,
    `- ...`,
    `3) Improved version (still close to their level):`,
    `...`,
    ``,
    `Keep the explanation concise. Use simple English. You may add very short Vietnamese hints only if it helps.`
  ].join("\n");

  const ai = getAI();
  const result = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return result;
}

// 2. ANSWER CHECK
export type AnswerCheckParams = {
  question: string;
  correctAnswer: string;
  learnerAnswer: string;
  level?: string;
  learnerLanguage?: string;
};

export async function checkAnswerWithTutor(params: AnswerCheckParams) {
  const { question, correctAnswer, learnerAnswer, level = "A2-B1", learnerLanguage = "vi" } = params;

  const prompt = [
    `METADATA (JSON): ${JSON.stringify({ mode: "ANSWER_CHECK", level, learnerLanguage })}`,
    ``,
    `TASK: You are FLUENTFLOW_TUTOR. The question and the expected correct answer are stored in the app. You only check the learner's answer and explain briefly.`,
    ``,
    `Question:\n${question}`,
    `Expected correct answer / key idea:\n${correctAnswer}`,
    `Learner's answer:\n${learnerAnswer}`,
    ``,
    `Respond in this structure:`,
    `1) Verdict: "Correct", "Almost correct", or "Not correct".`,
    `2) Short explanation (1–3 sentences) why.`,
    `3) Model answer (1–3 sentences).`,
    ``,
    `Keep it concise and encouraging. Use simple English.`
  ].join("\n");

  const ai = getAI();
  const result = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return result;
}

// 3. SPEAKING FEEDBACK (TEXT ONLY)
export type SpeakingFeedbackParams = {
  transcript: string;
  taskDescription?: string;
  level?: string;
  learnerLanguage?: string;
};

export async function getSpeakingFeedback(params: SpeakingFeedbackParams) {
  const { transcript, taskDescription, level = "A2-B1", learnerLanguage = "vi" } = params;

  const prompt = [
    `METADATA (JSON): ${JSON.stringify({ mode: "SPEAKING_FEEDBACK", level, learnerLanguage })}`,
    ``,
    `TASK: You are FLUENTFLOW_TUTOR. The app already provides speaking questions. You only give feedback on what the learner said.`,
    ``,
    taskDescription ? `Task description:\n${taskDescription}\n` : ``,
    `Learner's speaking (transcript):\n${transcript}`,
    ``,
    `Respond in this structure:`,
    `1) Corrected / more natural version of what they said (1 short paragraph).`,
    `2) Key issues (2–3 bullet points).`,
    `3) Useful phrases (2–4 items) the learner can reuse.`,
    ``,
    `Keep your answer short and friendly.`
  ].join("\n");

  const ai = getAI();
  const result = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return result;
}

// 4. GENERAL TUTOR HELP (Q&A)
export type GeneralTutorHelpParams = {
  userQuestion: string;
  level?: string;
  learnerLanguage?: string;
};

export async function getGeneralTutorHelp(params: GeneralTutorHelpParams) {
  const { userQuestion, level = "A2-B1", learnerLanguage = "vi" } = params;

  const prompt = [
    `METADATA (JSON): ${JSON.stringify({ mode: "WRITING_FEEDBACK", level, learnerLanguage })}`,
    ``,
    `TASK: You are FLUENTFLOW_TUTOR in Tutor/Writing mode.`,
    `The app already contains stored lessons and vocab lists. You only answer the learner's specific question in a short and simple way.`,
    ``,
    `Learner's question:\n${userQuestion}`,
    ``,
    `Respond like this:`,
    `1) Short answer in simple English (2–4 sentences).`,
    `2) 2–3 very short examples.`,
    `3) Optional: 1–2 very short Vietnamese hints to clarify key words if helpful.`,
    ``,
    `Keep the answer compact.`
  ].join("\n");

  const ai = getAI();
  const result = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return result;
}

// --------------------------------------------------------------------------
// MULTIMODAL EVALUATION (AUDIO FEEDBACK)
// --------------------------------------------------------------------------

export const evaluateSpeaking = async (
  audioBase64: string,
  targetSentence: string,
  lang: AppLanguage = 'en'
): Promise<SpeakingFeedback> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  let prompt = `
    Role: English Pronunciation Coach.
    Target sentence: "${targetSentence}".
    Task:
    1. Transcribe the audio exactly as spoken.
    2. Determine if it matches the target sentence (ignore minor accent differences).
    3. Identify specific mispronounced words.
    4. Provide constructive feedback in ${languageName}.
    5. Provide phonetic guidance (IPA) for mispronounced words.
    Return JSON.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      isCorrect: { type: Type.BOOLEAN },
      transcription: { type: Type.STRING },
      feedback: { type: Type.STRING },
      mispronouncedWords: { type: Type.ARRAY, items: { type: Type.STRING } },
      phoneticGuidance: { 
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING }
          },
          required: ["word", "phonetic"]
        }
      }
    },
    required: ["isCorrect", "transcription", "feedback", "mispronouncedWords"],
  };

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/webm;codecs=opus", data: audioBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    const rawData = JSON.parse(text);
    const phoneticMap: Record<string, string> = {};
    if (rawData.phoneticGuidance) {
      rawData.phoneticGuidance.forEach((item: any) => {
        phoneticMap[item.word] = item.phonetic;
      });
    }

    return {
      isCorrect: rawData.isCorrect,
      transcription: rawData.transcription,
      feedback: rawData.feedback,
      mispronouncedWords: rawData.mispronouncedWords || [], 
      phoneticGuidance: phoneticMap
    };

  } catch (error) {
    console.error("Gemini Speaking Eval Error:", error);
    return {
      isCorrect: false,
      transcription: "Error processing audio.",
      feedback: lang === 'vi' ? "Chúng tôi không nghe rõ. Vui lòng thử lại." : "We couldn't hear you clearly. Please try again.",
      mispronouncedWords: [],
    };
  }
};

// --------------------------------------------------------------------------
// GENERIC ROUTER (FOR WRITING ASSISTANT)
// --------------------------------------------------------------------------

export const askGenericAI = async (settings: any, input: string): Promise<string> => {
  const lang = settings.context?.toLowerCase().includes('vietnamese') ? 'vi' : 'en';
  const level = settings.level || "B1";

  // If user is just asking for explanation/help
  if (settings.mode === 'EXPLAIN') {
    const res = await getGeneralTutorHelp({ userQuestion: input, level, learnerLanguage: lang });
    return res.text || "No response";
  }
  
  // Default to writing feedback
  const res = await getWritingFeedback({ learnerText: input, level, learnerLanguage: lang });
  return res.text || "No response";
};
