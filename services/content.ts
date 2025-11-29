
import { 
  PlacementQuestion, 
  VocabDrillContent, 
  NewVocabCard, 
  GrammarQuestion, 
  AppLanguage, 
  SpeakingScenarioData, 
  EnglishLevel 
} from "../types";

import { placementQuiz } from "../data/QuizData";
import { vocabData } from "../data/vocabData";
import { grammarData } from "../data/grammarData";
import { grammarRecallData } from "../data/grammarRecallData";
import { speakingData } from "../data/speakingData";
import { shadowingData } from "../data/shadowingData";
import { contextTemplates } from "../data/contextUsageData";

// --- HELPERS ---

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const getTopicVi = (topic: string): string => {
    // Simple mapping for topic translation
    const map: Record<string, string> = {
        "Daily Life": "Cuộc sống hàng ngày",
        "Work & Business": "Công việc & Kinh doanh",
        "Travel": "Du lịch",
        "Citizenship": "Quốc tịch",
        "Technology": "Công nghệ",
        "Socializing": "Giao tiếp xã hội",
        "Health": "Sức khỏe",
        "IELTS": "IELTS",
        "Slang": "Tiếng lóng"
    };
    return map[topic] || topic;
};

// --- PLACEMENT TEST ---

export const generatePlacementTest = async (): Promise<PlacementQuestion[]> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 400)); 
  return placementQuiz.map(q => ({
    id: q.id,
    category: q.category,
    questionText: q.question, // map new schema to old generic expectation if needed
    question: q.question,
    options: q.options,
    correctAnswerIndex: q.options.indexOf(q.correct), // dynamically find index
    correct: q.correct
  }));
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

// --- SPEAKING ---

export const generateSpeakingSentence = async (topic: string, level: string, lang: AppLanguage = 'en'): Promise<SpeakingScenarioData> => {
    await new Promise(r => setTimeout(r, 400));
    
    // Check if topic matches stored data categories
    const isTopic = (t: string) => topic.toLowerCase().includes(t.toLowerCase());

    if (isTopic("Role Play") || isTopic("Shadowing")) {
        const item = randomItem(shadowingData);
        return {
            type: 'DIALOGUE',
            prompt: item.text,
            subText: lang === 'vi' ? item.translationVi : "Shadow this sentence."
        };
    }
    
    // Default or Exam style
    const prompts = speakingData.filter(p => isTopic(p.topic) || p.topic === "Daily Life");
    const item = randomItem(prompts.length > 0 ? prompts : speakingData);
    
    return {
        type: 'SIMPLE',
        prompt: item.question,
        sampleAnswer: item.sampleAnswer
    };
};

// --- VOCABULARY ---

export const generateVocabDrill = async (word: string, lang: AppLanguage = 'en'): Promise<VocabDrillContent> => {
    await new Promise(r => setTimeout(r, 500));

    const lowerWord = word.toLowerCase();
    
    // 1. Find in Unified DB
    const item = vocabData.find(v => v.word.toLowerCase() === lowerWord);

    // Fallback if not found (shouldn't happen if user saved it from the same DB)
    if (!item) {
       return {
            word: word,
            definition: "Definition unavailable",
            situations: [],
            meaningQuiz: { question: "", options: [], correctIndex: 0 },
            translationQuiz: { nativeSentence: "", correctEnglish: "", scrambledEnglish: [] },
            scrambleSentence: { scrambled: [], correct: "", translation: "" },
            wordForms: {}
       };
    }
    
    // 2. Fallbacks
    const definition = lang === 'vi' ? item.definitionVi : item.definitionEn;

    // 3. Generate Distractors (Meaning Quiz)
    // Find words from same topic, exclude current word
    const topic = item.topic;
    const sameTopicWords = vocabData.filter(v => v.topic === topic && v.word.toLowerCase() !== lowerWord);
    const pool = sameTopicWords.length >= 3 ? sameTopicWords : vocabData.filter(v => v.word.toLowerCase() !== lowerWord);
    
    const distractors = shuffle(pool).slice(0, 3).map(d => lang === 'vi' ? d.definitionVi : d.definitionEn);
    const correctOption = definition;
    const allOptions = shuffle([correctOption, ...distractors]);
    
    // 4. Context Situations
    let situations: { english: string; translation: string }[] = [];
    if (item.examples) {
         situations = item.examples.map(ex => ({ english: ex.en, translation: ex.vi }));
    }
    
    // Add procedural templates ONLY if we don't have enough rich examples
    const remainingNeeded = 3 - situations.length;
    if (remainingNeeded > 0) {
        // Map topic string to template key
        let templateKey: keyof typeof contextTemplates = "general";
        
        switch (topic) {
            case "Daily Life": templateKey = "dailyLife"; break;
            case "Work & Business": templateKey = "workBusiness"; break;
            case "Travel": templateKey = "travel"; break;
            case "Citizenship": templateKey = "citizenship"; break;
            case "Technology": templateKey = "technology"; break;
            case "Socializing": templateKey = "socializing"; break;
            case "Health": templateKey = "health"; break;
            case "IELTS": templateKey = "ielts"; break;
            case "Slang": templateKey = "slang"; break;
        }

        const templates = contextTemplates[templateKey] || contextTemplates.general;
        const topicVi = getTopicVi(topic);

        const newSits = shuffle(templates).slice(0, remainingNeeded).map(t => ({
            english: t.en.replace(/{word}/g, word).replace(/{topic}/g, topic),
            translation: t.vi.replace(/{word}/g, word).replace(/{topic}/g, topicVi)
        }));
        situations = [...situations, ...newSits];
    }

    // 5. Scramble Sentence
    const sampleSentence = item.examples?.[0]?.en || `I am learning the word ${word}.`;
    const nativePrompt = item.examples?.[0]?.vi || (lang === 'vi' ? `Tôi đang học từ ${word}.` : `Translate: ${word}`);
    
    // Create distractor words for scramble
    const sentenceWords = sampleSentence.replace(/[.,!?]/g, '').split(' ');
    const extraWords = ["is", "are", "the", "a", "not", "very"].filter(w => !sentenceWords.includes(w)).slice(0, 2);
    const scramblePool = shuffle([...sentenceWords, ...extraWords]);

    return {
        word: item.word,
        ipa: item.ipa, 
        definition: definition,
        situations: situations,
        meaningQuiz: {
            question: lang === 'vi' ? `"${item.word}" có nghĩa là gì?` : `What is the meaning of "${item.word}"?`,
            options: allOptions,
            correctIndex: allOptions.indexOf(correctOption)
        },
        translationQuiz: {
            nativeSentence: nativePrompt,
            correctEnglish: sampleSentence,
            scrambledEnglish: scramblePool
        },
        scrambleSentence: {
            scrambled: shuffle(sampleSentence.replace(/[.,!?]/g, '').split(' ')),
            correct: sampleSentence,
            translation: lang === 'vi' ? `(Sắp xếp câu ví dụ)` : `(Arrange the example)`
        },
        wordForms: item.wordForms
    };
};

export const generateNewVocab = async (topic: string, level: string, lang: AppLanguage = 'en', exclude: string[] = []): Promise<NewVocabCard | null> => {
    await new Promise(r => setTimeout(r, 400));
    
    // Filter by topic from Unified DB
    const candidates = vocabData.filter(v => 
        (v.topic === topic || topic === "Random") && 
        !exclude.some(e => e.toLowerCase() === v.word.toLowerCase())
    );

    if (candidates.length === 0) return null;
    
    const selected = randomItem(candidates);
    
    return {
        word: selected.word,
        definition: lang === 'vi' ? selected.definitionVi : selected.definitionEn,
        example: selected.examples?.[0]?.en || "",
        exampleTranslation: selected.examples?.[0]?.vi || "",
        topic: selected.topic,
        level: level,
        pronunciation: selected.ipa || `/${selected.word.toLowerCase()}/`
    };
};

// --- GRAMMAR ---

export const generateGrammarExercise = async (topic: string, lang: AppLanguage = 'en'): Promise<GrammarQuestion> => {
    await new Promise(r => setTimeout(r, 500));
    
    // If topic is specific, try to find a lesson for it, else random
    const lessons = grammarData; 
    // Flatten exercises
    const allExercises: GrammarQuestion[] = [];
    
    lessons.forEach(l => {
        l.exercises.forEach((ex, i) => {
            allExercises.push({
                id: `${l.id}_${i}`,
                topic: l.title,
                question: ex.question,
                options: ex.options,
                correctIndex: ex.options.indexOf(ex.answer),
                explanation: l.explanation
            });
        });
    });

    return randomItem(allExercises);
};

export const generateGrammarRecallQuestions = async (topic: string, rule: string, lang: AppLanguage = 'en'): Promise<GrammarQuestion[]> => {
    await new Promise(r => setTimeout(r, 600));
    
    // Get random items from Grammar Gauntlet data
    const items = shuffle(grammarRecallData).slice(0, 3);
    
    return items.map(item => ({
        id: item.id,
        topic: "Recall",
        question: item.prompt,
        options: item.options,
        correctIndex: item.options.indexOf(item.answer),
        explanation: `The correct answer is "${item.answer}".`
    }));
};
