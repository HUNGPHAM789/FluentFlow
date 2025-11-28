// --- services/gemini.ts ---
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EnglishLevel, PlacementQuestion, SpeakingFeedback, VocabDrillContent, NewVocabCard, GrammarQuestion, AppLanguage, AppSettings, AppMode, AppLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Centralized Prompt Builder ---

export const buildGeminiPrompt = (settings: AppSettings, userInput: string): string => {
  const { level, mode, context } = settings;
  
  // 1. Start with the structured metadata tags
  let prompt = `mode=${mode}, level=${level}.`;

  // 2. Add optional context if available
  if (context) {
    prompt += ` Context: ${context}.`;
  }

  // 3. Append the user's request based on mode
  switch (mode) {
    case 'EXPLAIN':
      prompt += ` Task: Explain, define, or analyze the term/concept "${userInput}".`;
      break;
      
    case 'EXERCISE':
      prompt += ` Task: Create a practice exercise for: "${userInput}".`;
      break;
      
    case 'SPEAKING':
      prompt += ` Task: Create a natural speaking scenario or sentence for topic: "${userInput}".`;
      break;
      
    case 'EXAM':
      prompt += ` Task: Generate specific exam content for: "${userInput}".`;
      break;

    case 'FEEDBACK':
      prompt += ` Task: Analyze and provide feedback on the following input: "${userInput}".`;
      break;
      
    default:
      prompt += ` ${userInput}`;
      break;
  }
  
  return prompt.trim();
};

// --- Placement Test ---

export const generatePlacementTest = async (): Promise<PlacementQuestion[]> => {
  const model = "gemini-2.5-flash";
  
  // Using generic construction for this specific complex request
  const prompt = `
    mode=EXAM, level=MIXED.
    Generate an English placement test with exactly 7 questions (1 for each category).
    Categories: Academy, Work, IELTS, TOEIC, Daily Life, Speaking, Slang.
    Difficulty: Mixed A2 to C1.
    Return a JSON array.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        category: { type: Type.STRING },
        questionText: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER },
      },
      required: ["id", "category", "questionText", "options", "correctAnswerIndex"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as PlacementQuestion[];
  } catch (error) {
    console.error("Gemini Placement Test Error:", error);
    return [
      {
        id: 1,
        category: 'Daily Life',
        questionText: "Which sentence is correct?",
        options: ["She go to school yesterday.", "She went to school yesterday.", "She gone to school yesterday."],
        correctAnswerIndex: 1
      }
    ] as PlacementQuestion[]; 
  }
};

export const determineLevel = async (score: number, total: number): Promise<EnglishLevel> => {
  const percentage = score / total;
  if (percentage < 0.3) return EnglishLevel.A1;
  if (percentage < 0.5) return EnglishLevel.A2;
  if (percentage < 0.7) return EnglishLevel.B1;
  if (percentage < 0.85) return EnglishLevel.B2;
  if (percentage < 0.95) return EnglishLevel.C1;
  return EnglishLevel.C2;
};

// --- Speaking & Shadowing ---

export const generateSpeakingSentence = async (topic: string, level: string, lang: AppLanguage = 'en'): Promise<string> => {
  const model = "gemini-2.5-flash";
  const seed = Date.now();
  
  // Determine mode and level mapping
  let mode: AppMode = 'SPEAKING';
  let appLevel: AppLevel = level as AppLevel;

  if (topic.toUpperCase().includes('IELTS')) {
    mode = 'EXAM';
    appLevel = 'IELTS';
  } else if (topic.toUpperCase().includes('CITIZENSHIP')) {
    mode = 'EXAM';
    appLevel = 'CITIZENSHIP';
  }

  const settings: AppSettings = {
    mode,
    level: appLevel,
    topic,
    context: `Generate a single natural sentence (8-15 words). Random seed: ${seed}.`
  };

  let prompt = buildGeminiPrompt(settings, topic);
  prompt += " Return JSON with property 'sentence'.";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      sentence: { type: Type.STRING }
    },
    required: ["sentence"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    const data = JSON.parse(response.text!);
    return data.sentence;
  } catch (e) {
    return "I would like to schedule a meeting for next Tuesday.";
  }
};

export const evaluateSpeaking = async (
  audioBase64: string,
  targetSentence: string,
  lang: AppLanguage = 'en'
): Promise<SpeakingFeedback> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  const settings: AppSettings = {
    mode: 'FEEDBACK',
    level: 'DEFAULT', // Level isn't critical for phonetic analysis but required by type
    topic: 'Pronunciation',
    context: `Target sentence: "${targetSentence}". Provide feedback in ${languageName}.`
  };

  let prompt = buildGeminiPrompt(settings, "Audio Analysis");
  prompt += `
    1. Transcribe audio.
    2. Determine correctness.
    3. Identify mispronounced words.
    4. Provide phonetic guidance (IPA).
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

    type RawResponse = {
      isCorrect: boolean;
      transcription: string;
      feedback: string;
      mispronouncedWords: string[];
      phoneticGuidance?: { word: string, phonetic: string }[];
    };

    const rawData = JSON.parse(text) as RawResponse;

    const phoneticMap: Record<string, string> = {};
    if (rawData.phoneticGuidance) {
      rawData.phoneticGuidance.forEach(item => {
        phoneticMap[item.word] = item.phonetic;
      });
    }

    return {
      isCorrect: rawData.isCorrect,
      transcription: rawData.transcription,
      feedback: rawData.feedback,
      mispronouncedWords: rawData.mispronouncedWords,
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

// --- Vocabulary & Explanations ---

export const getExplanation = async (term: string, context: string, level: string = "B1", lang: AppLanguage = 'en') => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  const settings: AppSettings = {
    mode: 'EXPLAIN',
    level: level as AppLevel,
    topic: term,
    context: `Context: "${context}". Language: ${languageName}. Keep it concise.`
  };

  const prompt = buildGeminiPrompt(settings, term);
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || "Explanation unavailable.";
};

export const generateVocabDrill = async (word: string, lang: AppLanguage = 'en'): Promise<VocabDrillContent> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';

  const settings: AppSettings = {
    mode: 'EXERCISE',
    level: EnglishLevel.B1, // Defaulting to B1 for drills if not specified, could be passed in
    topic: word,
    context: `Target Language: ${languageName}. Create situations, quizzes, and translation challenges.`
  };

  let prompt = buildGeminiPrompt(settings, word);
  prompt += " Return detailed JSON.";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      situations: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT,
          properties: {
             english: { type: Type.STRING },
             translation: { type: Type.STRING }
          }
        } 
      },
      meaningQuiz: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER }
        }
      },
      translationQuiz: {
        type: Type.OBJECT,
        properties: {
           nativeSentence: { type: Type.STRING },
           correctEnglish: { type: Type.STRING },
           scrambledEnglish: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      scrambleSentence: {
        type: Type.OBJECT,
        properties: {
          scrambled: { type: Type.ARRAY, items: { type: Type.STRING } },
          correct: { type: Type.STRING },
          translation: { type: Type.STRING }
        }
      },
      wordForms: {
        type: Type.OBJECT,
        properties: {
          noun: { type: Type.STRING },
          verb: { type: Type.STRING },
          adjective: { type: Type.STRING },
          adverb: { type: Type.STRING }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({ 
      model, 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return JSON.parse(response.text!) as VocabDrillContent;
  } catch (e) {
    console.error(e);
    return {
      word: word,
      situations: [{ english: "Example 1", translation: "Ví dụ 1" }],
      meaningQuiz: { question: "Meaning?", options: ["A", "B", "C"], correctIndex: 0 },
      translationQuiz: { nativeSentence: "Test", correctEnglish: "Test", scrambledEnglish: ["Test"] },
      scrambleSentence: { scrambled: ["This", "is", "test"], correct: "This is test", translation: "Đây là bài kiểm tra" },
      wordForms: {}
    };
  }
};

// --- New Vocab Discovery ---

export const generateNewVocab = async (topic: string, level: string = "B1", lang: AppLanguage = 'en'): Promise<NewVocabCard> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  const settings: AppSettings = {
    mode: 'EXPLAIN', // Using EXPLAIN to get definitions
    level: level as AppLevel,
    topic: topic,
    context: `Generate ONE necessary vocabulary word. Definitions/translations in ${languageName}.`
  };

  let prompt = buildGeminiPrompt(settings, "Vocabulary Word");
  prompt += " Return JSON.";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      definition: { type: Type.STRING },
      example: { type: Type.STRING },
      exampleTranslation: { type: Type.STRING },
      topic: { type: Type.STRING },
      level: { type: Type.STRING },
      pronunciation: { type: Type.STRING }
    },
    required: ["word", "definition", "example"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as NewVocabCard;
  } catch (e) {
    return { 
      word: "Serendipity", 
      definition: "Finding something good without looking for it.", 
      example: "It was serendipity that we met.", 
      exampleTranslation: "Thật tình cờ may mắn là chúng ta đã gặp nhau.",
      topic: topic, 
      level: level 
    };
  }
};

// --- Grammar Exercise ---

export const generateGrammarExercise = async (topic: string, lang: AppLanguage = 'en'): Promise<GrammarQuestion> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  const seed = Date.now();

  const settings: AppSettings = {
    mode: 'EXERCISE',
    level: EnglishLevel.B1, // Could be dynamic
    topic: topic,
    context: `Create a unique multiple choice grammar question. Explanation in ${languageName}. Random Seed: ${seed}.`
  };

  let prompt = buildGeminiPrompt(settings, topic);
  prompt += " Return JSON.";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      topic: { type: Type.STRING },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING }
    },
    required: ["question", "options", "correctIndex", "explanation"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as GrammarQuestion;
  } catch (e) {
    return { 
      id: "1", topic: "Random", 
      question: "She _____ to the store.", 
      options: ["go", "went", "gone"], 
      correctIndex: 1, 
      explanation: lang === 'vi' ? "Sử dụng 'went' cho thì quá khứ." : "Use 'went' for past tense." 
    };
  }
};

// --- Grammar Recall (3 Questions) ---

export const generateGrammarRecallQuestions = async (topic: string, rule: string, lang: AppLanguage = 'en'): Promise<GrammarQuestion[]> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  const settings: AppSettings = {
    mode: 'EXERCISE',
    level: EnglishLevel.B1,
    topic: topic,
    context: `Rule: "${rule}". Generate 3 questions testing this rule. Explanations in ${languageName}.`
  };

  let prompt = buildGeminiPrompt(settings, topic);
  prompt += " Return JSON array.";

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        topic: { type: Type.STRING },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correctIndex", "explanation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as GrammarQuestion[];
  } catch (e) {
    return [];
  }
};

// --- Writing/Feedback Assistant ---

export const checkUserText = async (text: string, level: string, lang: AppLanguage = 'en'): Promise<string> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  const settings: AppSettings = {
    mode: 'FEEDBACK',
    level: level as AppLevel,
    topic: 'Writing Correction',
    context: `Provide constructive feedback and corrections. Explain in ${languageName}.`
  };

  const prompt = buildGeminiPrompt(settings, text);
  
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || "Feedback unavailable.";
};
