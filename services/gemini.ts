// --- services/gemini.ts ---
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EnglishLevel, PlacementQuestion, SpeakingFeedback, VocabDrillContent, NewVocabCard, GrammarQuestion, AppLanguage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Placement Test ---

export const generatePlacementTest = async (): Promise<PlacementQuestion[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
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
  // Add randomness
  const seed = Date.now();
  const prompt = `
    Generate a single, natural, useful English sentence for speaking practice.
    Topic: ${topic}
    Level: ${level}
    Constraint: Length should be 8-15 words. Random seed: ${seed}.
    Return JSON with property 'sentence'.
  `;

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
  
  const prompt = `
    Analyze the user's spoken audio against the target sentence: "${targetSentence}".
    1. Transcribe the audio.
    2. STRICTLY determine if the pronunciation and accuracy are acceptable.
    3. Identify specific mispronounced words.
    4. Provide phonetic guidance (IPA) for mispronounced words.
    5. Provide feedback in ${languageName}.
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

export const getExplanation = async (term: string, context: string, lang: AppLanguage = 'en') => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  const prompt = `
    Explain the English concept or word "${term}" in the context of: "${context}".
    Provide the explanation in ${languageName}.
    Keep it concise (under 40 words) and helpful for a learner.
  `;
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || "Explanation unavailable.";
};

export const generateVocabDrill = async (word: string, lang: AppLanguage = 'en'): Promise<VocabDrillContent> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';

  const prompt = `
    Create a detailed learning drill for the word "${word}" for a user who speaks ${languageName}.
    1. 3 distinct usage situations in English, and provide a translation for each in ${languageName}.
    2. A Multiple Choice Question (MCQ) asking for the meaning of "${word}". The options should be in ${languageName}.
    3. A "Translation Challenge": Create a simple sentence in ${languageName} that translates to a sentence using "${word}" in English. Provide the Native Sentence, the Correct English Sentence, and a scrambled array of the English words.
    4. A "Scramble Challenge": Another English sentence using "${word}". Provide the scrambled parts, the correct string, and the ${languageName} translation.
    5. Common word forms.
    Return JSON.
  `;
  
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
    // Fallback data
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
  
  const prompt = `
    Generate a SINGLE "necessary" English vocabulary word that is strictly level ${level} related to the topic: "${topic}".
    Ensure the word is commonly used in ${level} contexts.
    Include definition in ${languageName}.
    Include example sentence in English and its translation in ${languageName}.
    Return JSON.
  `;

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
  const randomSeed = Date.now();

  const prompt = `
    Generate a CREATIVE and UNIQUE English grammar multiple-choice question related to: "${topic}".
    If topic is "Random", choose any common grammar pitfall (tenses, prepositions, etc.).
    Include the question, 3 options, the correct index.
    Provide the explanation in ${languageName}.
    Ensure it is different from typical generic examples. Random Seed: ${randomSeed}
    Return JSON.
  `;

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
  
  const prompt = `
    Generate 3 distinct English grammar multiple-choice questions to test the specific rule: "${rule}" (Topic: ${topic}).
    Language for explanations: ${languageName}.
    Return a JSON array of 3 questions.
  `;

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
    console.error("Recall Error", e);
    return [];
  }
};