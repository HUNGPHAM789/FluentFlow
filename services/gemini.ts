// --- services/gemini.ts ---
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EnglishLevel, PlacementQuestion, SpeakingFeedback, VocabDrillContent, NewVocabCard, GrammarQuestion, AppLanguage, AppSettings, AppMode, AppLevel, SpeakingScenario, RolePlayScenario, ExamSpeakingContent } from "../types";
import { buildGeminiPrompt } from "./promptBuilder";
import { TOPIC_VOCAB_LISTS } from "../utils/vocabData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Placement Test ---

export const generatePlacementTest = async (): Promise<PlacementQuestion[]> => {
  const model = "gemini-2.5-flash";
  
  // Using generic construction for this specific complex request as it's a fixed setup
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

export const generateSpeakingSentence = async (topic: string, level: string, lang: AppLanguage = 'en'): Promise<SpeakingScenario> => {
  const model = "gemini-2.5-flash";
  const seed = Date.now();
  
  // Determine mode and level mapping
  let mode: AppMode = 'SPEAKING';
  let appLevel: AppLevel = level as AppLevel;

  // Detect Special Modes
  const isIELTSPart2 = topic.includes('IELTS Speaking Part 2');
  const isRolePlay = topic.includes('Role Play') || topic.includes('Negotiating');

  if (topic.toUpperCase().includes('IELTS')) {
    mode = 'EXAM';
    appLevel = 'IELTS';
  } else if (topic.toUpperCase().includes('CITIZENSHIP')) {
    mode = 'EXAM';
    appLevel = 'CITIZENSHIP';
  }

  // Handle IELTS Part 2 (Exam Mode)
  if (isIELTSPart2) {
    const settings: AppSettings = {
      mode: 'EXAM',
      level: 'IELTS',
      topic: topic,
      context: `Generate IELTS Speaking Part 2 Content. Random seed: ${seed}. Return JSON with cueCard, sampleAnswer, vocabulary.`
    };
    
    let prompt = buildGeminiPrompt(settings, topic);
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['EXAM'] },
        cueCard: { type: Type.STRING },
        sampleAnswer: { type: Type.STRING },
        vocabulary: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: { word: { type: Type.STRING }, definition: { type: Type.STRING } } 
          } 
        }
      },
      required: ["type", "cueCard", "sampleAnswer"]
    };

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });
      const data = JSON.parse(response.text!);
      return { ...data, type: 'EXAM' } as ExamSpeakingContent;
    } catch (e) {
      return "IELTS Content Error";
    }
  }

  // Handle Role Play (Dialogue Mode)
  if (isRolePlay) {
    const settings: AppSettings = {
      mode: 'SPEAKING',
      level: appLevel,
      topic: topic,
      context: `Create a role-play dialogue. Random seed: ${seed}. JSON format.`
    };

    let prompt = buildGeminiPrompt(settings, "Create a role-play dialogue");
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['DIALOGUE'] },
        targetSentence: { type: Type.STRING, description: "One representative sentence for shadowing" },
        dialogue: { 
          type: Type.ARRAY, 
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING },
              text: { type: Type.STRING },
              translation: { type: Type.STRING }
            }
          }
        },
        usefulPhrases: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: { phrase: { type: Type.STRING }, translation: { type: Type.STRING } }
          }
        }
      },
      required: ["type", "targetSentence", "dialogue", "usefulPhrases"]
    };

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });
      const data = JSON.parse(response.text!);
      return { ...data, type: 'DIALOGUE' } as RolePlayScenario;
    } catch (e) {
      return "Role Play Error";
    }
  }

  // Default: Single Sentence
  const settings: AppSettings = {
    mode,
    level: appLevel,
    topic,
    context: `Generate a single natural sentence (8-15 words). Random seed: ${seed}. Return JSON with property 'sentence'.`
  };

  let prompt = buildGeminiPrompt(settings, topic);

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
    level: 'DEFAULT', 
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
      mispronouncedWords: rawData.mispronouncedWords || [], // SAFEGUARD: Default to empty array
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
    level: EnglishLevel.B1, 
    topic: word,
    // Add "JSON Drill" to context so promptBuilder knows to be specific for JSON
    context: `Target Language: ${languageName}. JSON Drill format. 
    IMPORTANT: 
    1. The 'word' property MUST be the ENGLISH word "${word}". 
    2. 'wordForms' (noun, verb, adj, adv) MUST be filled with English words. Do not return null. If a form doesn't exist, use N/A.
    3. 'situations' MUST contain exactly 3 example sentences in English with ${languageName} translation.
    4. 'definition' MUST be in ${languageName}.
    5. 'meaningQuiz' options MUST be in ${languageName}. The wrong options (distractors) must be PLAUSIBLE meanings of OTHER words, not just 'Wrong Answer'.` 
  };

  let prompt = buildGeminiPrompt(settings, word);
  prompt += " Return detailed JSON.";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      definition: { type: Type.STRING },
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
    
    // Parse result
    const data = JSON.parse(response.text!) as VocabDrillContent;

    // --- SAFETY CHECK: Backfill missing data to prevent UI crashes ---
    
    // Check Meaning Quiz
    if (!data.meaningQuiz?.options || data.meaningQuiz.options.length < 2) {
      const fallbackDef = data.definition || (lang === 'vi' ? `Nghĩa của ${word}` : `Definition of ${word}`);
      const fallbackWrong1 = lang === 'vi' ? "Định nghĩa sai 1" : "Something else";
      const fallbackWrong2 = lang === 'vi' ? "Định nghĩa sai 2" : "Another incorrect option";

      data.meaningQuiz = {
        question: lang === 'vi' ? `"${word}" có nghĩa là gì?` : `What is the meaning of "${word}"?`,
        options: [fallbackDef, fallbackWrong1, fallbackWrong2],
        correctIndex: 0
      };
    }

    // Check Translation Quiz
    if (!data.translationQuiz?.scrambledEnglish || data.translationQuiz.scrambledEnglish.length === 0) {
      data.translationQuiz = {
         nativeSentence: lang === 'vi' ? `(Dịch: ${word})` : `(Translate: ${word})`,
         correctEnglish: word,
         scrambledEnglish: [word, "is", "the", "answer"]
      };
    }

    // Check Scramble Sentence
    if (!data.scrambleSentence?.scrambled || data.scrambleSentence.scrambled.length === 0) {
       data.scrambleSentence = {
         scrambled: ["This", "is", "an", "example", "for", word],
         correct: `This is an example for ${word}`,
         translation: lang === 'vi' ? `(Ví dụ câu cho ${word})` : `(Sentence example for ${word})`
       };
    }

    return data;
  } catch (e) {
    console.error(e);
    // Complete Fallback - More natural fallback to avoid "Template" look
    return {
      word: word,
      definition: lang === 'vi' ? `Nghĩa của ${word} (Đang tải...)` : `Definition of ${word} (Loading...)`,
      situations: [
        { english: `Example using ${word}.`, translation: `Ví dụ sử dụng ${word}.` },
        { english: `Another usage of ${word}.`, translation: `Một cách dùng khác của ${word}.` }
      ],
      meaningQuiz: { 
        question: lang === 'vi' ? `Chọn nghĩa đúng của ${word}` : `Select the correct meaning of ${word}`,
        options: [
           lang === 'vi' ? `Nghĩa chính xác của ${word}` : `Correct meaning of ${word}`, 
           lang === 'vi' ? "Một từ hoàn toàn khác" : "A completely different word", 
           lang === 'vi' ? "Không liên quan" : "Unrelated concept"
        ], 
        correctIndex: 0 
      },
      translationQuiz: { nativeSentence: `(Dịch từ: ${word})`, correctEnglish: word, scrambledEnglish: [word, "meaning"] },
      scrambleSentence: { scrambled: [word, "is", "here"], correct: `${word} is here`, translation: `${word} ở đây` },
      wordForms: { noun: word, verb: "N/A", adjective: "N/A", adverb: "N/A" }
    };
  }
};

// --- New Vocab Discovery ---

export const generateNewVocab = async (topic: string, level: string = "B1", lang: AppLanguage = 'en'): Promise<NewVocabCard> => {
  const model = "gemini-2.5-flash";
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  // 1. Determine the target topic (handle Random)
  let targetTopic = topic;
  const availableTopics = TOPIC_VOCAB_LISTS ? Object.keys(TOPIC_VOCAB_LISTS) : [];
  
  if (targetTopic === 'Random' || !availableTopics.includes(targetTopic)) {
     if (availableTopics.length > 0) {
       targetTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
     } else {
       targetTopic = "Daily Life";
     }
  }

  // 2. Select a specific word from the static list
  // This fixes the bug where "Vocabulary Word" generic string was passed to the prompt
  const vocabList = (TOPIC_VOCAB_LISTS && TOPIC_VOCAB_LISTS[targetTopic]) ? TOPIC_VOCAB_LISTS[targetTopic] : ["Serendipity", "Resilience", "Ephemeral"];
  const randomIndex = Math.floor(Math.random() * vocabList.length);
  const selectedWord = vocabList[randomIndex] || "Serendipity";

  const settings: AppSettings = {
    mode: 'EXPLAIN', // Using EXPLAIN to get definitions
    level: level as AppLevel,
    topic: targetTopic,
    context: `Define the ENGLISH word "${selectedWord}". 
    IMPORTANT: 
    1. 'word': "${selectedWord}" (English).
    2. 'definition': Provide the definition in ${languageName}.
    3. 'example': Sentence in English.
    4. 'exampleTranslation': Sentence in ${languageName}.
    5. 'pronunciation': IPA string.
    `
  };

  // 3. Build prompt using the SPECIFIC word
  let prompt = buildGeminiPrompt(settings, selectedWord);
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
    const isVi = lang === 'vi';
    return { 
      word: "Serendipity", 
      definition: isVi ? "Khả năng tình cờ phát hiện ra những điều thú vị hoặc may mắn." : "Finding something good without looking for it.", 
      example: "It was serendipity that we met.", 
      exampleTranslation: isVi ? "Thật tình cờ may mắn là chúng ta đã gặp nhau." : "It was luck that we met.",
      topic: targetTopic, 
      level: level,
      pronunciation: "/ˌser.ənˈdɪp.ə.ti/"
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
    level: EnglishLevel.B1,
    topic: topic,
    // Context indicates JSON to promptBuilder
    context: `Create a unique multiple choice grammar question. Explanation in ${languageName}. Random Seed: ${seed}. JSON.`
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
    context: `Rule: "${rule}". Generate 3 questions testing this rule. Explanations in ${languageName}. JSON.`
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
  return askGenericAI({
    mode: 'FEEDBACK',
    level: level as AppLevel,
    topic: 'Writing Correction',
    context: `Provide constructive feedback and corrections. Explain in ${lang === 'vi' ? 'Vietnamese' : 'English'}.`
  }, text);
};

// --- Generic AI Request (For UI Playground) ---

export const askGenericAI = async (settings: AppSettings, userInput: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = buildGeminiPrompt(settings, userInput);
  
  try {
    const response = await ai.models.generateContent({ 
      model, 
      contents: prompt 
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Generic Error:", error);
    return "Error connecting to AI. Please try again.";
  }
};