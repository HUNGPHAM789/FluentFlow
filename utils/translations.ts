// --- utils/translations.ts ---

export type AppLanguage = 'en' | 'vi';

export const translations = {
  en: {
    // Welcome
    welcomeScreenTitle: "Speak Confidently.",
    welcomeScreenSubtitle: "Your personal AI coach for natural fluency.",
    getStarted: "Get Started",

    // Auth & Landing
    loginTitle: "Sign in to sync your progress",
    continueGoogle: "Continue with Google",
    continueApple: "Continue with Apple",
    skipGuest: "Skip Login & Continue as Guest",
    welcome: "Welcome back",
    selectLanguage: "Select Language",
    searchLanguage: "Search language...",
    
    // Dashboard
    whatToLearn: "What do you want to learn today?",
    shadowingTitle: "Shadowing",
    shadowingDesc: "Fix pronunciation with AI.",
    discoverTitle: "Discover Words",
    discoverDesc: "Master words by level.",
    grammarTitle: "Grammar Guru",
    grammarDesc: "Master rules & usage.",
    vocabRecallTitle: "Vocab Recall",
    vocabRecallDesc: "Drill saved words.",
    grammarListTitle: "Grammar Review",
    grammarListDesc: "Review your weak points.",
    progressTitle: "My Progress",
    progressDesc: "Track stats, badges, and titles.",
    currentLevel: "Current Level",
    viewStats: "View Stats",
    startSession: "Start Session",
    explore: "Explore",
    practice: "Practice",
    startDrill: "Start Drill",
    review: "Review",
    
    // Suggestion
    suggestion: "💡 Suggested for you:",
    fixWeakness: "Fix Weakness",
    reviewVocab: "Review Vocabulary",
    randomDrill: "Random Drill",

    // Stats
    streak: "Streak",
    badges: "Badges",
    wordsMastered: "Words Mastered",
    sentencesSpoken: "Sentences Spoken",
    
    // General
    back: "Back",
    quit: "Quit",
    loading: "Loading...",
    next: "Next",
    submit: "Submit",
    check: "Check Answer",
    correct: "Correct! 🎉",
    incorrect: "Incorrect",
    tryAgain: "Try Again",
    save: "Save to List",
    close: "Close",
    
    // Vocab Drill
    drillIntro: "Study the word below",
    contextUsage: "Contextual Usage",
    meaningQuiz: "What does this word mean?",
    translationQuiz: "Translate this sentence to English",
    usageQuiz: "Arrange the sentence",
    drillComplete: "Drill Complete!",
    drillSuccess: "You've mastered this word!",
    drillFail: "Good practice, but you made some mistakes. Review it again later to master it.",
    why: "Why? (Click for help)",
    
    // New Vocab
    definition: "Definition",
    example: "Example",
    
    // Speaking
    preview: "Listen Preview",
    tapToSpeak: "Tap to Speak",
    listening: "Listening...",
    returnToSentence: "Return to Sentence",
    trickyWords: "Tricky words (Save to practice later):",

    // Grammar Recall
    recallIntro: "The Gauntlet",
    recallDesc: "Answer 3 questions correctly in a row to master this rule.",
    ruleRefresher: "Rule Refresher",
    startGauntlet: "Start The Gauntlet",
    gauntletSuccess: "You have mastered this grammar point!",
    gauntletFail: "You missed one! Review the rule and try again.",
    savedToGrammarList: "Saved to Grammar Review"
  },
  vi: {
    // Welcome
    welcomeScreenTitle: "Nói Tiếng Anh Tự Tin.",
    welcomeScreenSubtitle: "Huấn luyện viên AI cá nhân giúp bạn lưu loát tự nhiên.",
    getStarted: "Bắt đầu ngay",

    // Auth & Landing
    loginTitle: "Đăng nhập để đồng bộ tiến trình",
    continueGoogle: "Tiếp tục với Google",
    continueApple: "Tiếp tục với Apple",
    skipGuest: "Bỏ qua & Tiếp tục với tư cách Khách",
    welcome: "Chào mừng trở lại",
    selectLanguage: "Chọn ngôn ngữ",
    searchLanguage: "Tìm ngôn ngữ...",
    
    // Dashboard
    whatToLearn: "Bạn muốn học gì hôm nay?",
    shadowingTitle: "Luyện Nói (Shadowing)",
    shadowingDesc: "Sửa phát âm cùng AI.",
    discoverTitle: "Khám Phá Từ Vựng",
    discoverDesc: "Học từ theo cấp độ.",
    grammarTitle: "Bậc Thầy Ngữ Pháp",
    grammarDesc: "Nắm vững quy tắc & cách dùng.",
    vocabRecallTitle: "Ôn Tập Từ Vựng",
    vocabRecallDesc: "Luyện tập từ đã lưu.",
    grammarListTitle: "Ôn Tập Ngữ Pháp",
    grammarListDesc: "Ôn lại điểm yếu.",
    progressTitle: "Tiến Độ Của Tôi",
    progressDesc: "Theo dõi chỉ số, huy hiệu.",
    currentLevel: "Cấp độ hiện tại",
    viewStats: "Xem chỉ số",
    startSession: "Bắt đầu",
    explore: "Khám phá",
    practice: "Luyện tập",
    startDrill: "Ôn tập",
    review: "Ôn lại",

    // Suggestion
    suggestion: "💡 Gợi ý cho bạn:",
    fixWeakness: "Sửa lỗi sai",
    reviewVocab: "Ôn từ vựng",
    randomDrill: "Bài học ngẫu nhiên",
    
    // Stats
    streak: "Chuỗi ngày",
    badges: "Huy hiệu",
    wordsMastered: "Từ đã thuộc",
    sentencesSpoken: "Câu đã nói",
    
    // General
    back: "Quay lại",
    quit: "Thoát",
    loading: "Đang tải...",
    next: "Tiếp theo",
    submit: "Gửi",
    check: "Kiểm tra",
    correct: "Chính xác! 🎉",
    incorrect: "Chưa đúng",
    tryAgain: "Thử lại",
    save: "Lưu từ",
    close: "Đóng",
    
    // Vocab Drill
    drillIntro: "Học từ vựng dưới đây",
    contextUsage: "Ngữ cảnh sử dụng",
    meaningQuiz: "Từ này có nghĩa là gì?",
    translationQuiz: "Dịch câu này sang tiếng Anh",
    usageQuiz: "Sắp xếp thành câu hoàn chỉnh",
    drillComplete: "Hoàn thành bài tập!",
    drillSuccess: "Bạn đã thuộc từ này!",
    drillFail: "Luyện tập tốt, nhưng bạn đã mắc lỗi. Hãy ôn lại sau để thực sự nắm vững.",
    why: "Tại sao? (Bấm để xem giải thích)",
    
    // New Vocab
    definition: "Định nghĩa",
    example: "Ví dụ",
    
    // Speaking
    preview: "Nghe mẫu",
    tapToSpeak: "Nhấn để nói",
    listening: "Đang nghe...",
    returnToSentence: "Quay lại cả câu",
    trickyWords: "Từ khó (Lưu để luyện tập):",

    // Grammar Recall
    recallIntro: "Thử Thách Gauntlet",
    recallDesc: "Trả lời đúng 3 câu liên tiếp để nắm vững quy tắc này.",
    ruleRefresher: "Nhắc lại quy tắc",
    startGauntlet: "Bắt đầu thử thách",
    gauntletSuccess: "Bạn đã nắm vững điểm ngữ pháp này!",
    gauntletFail: "Sai rồi! Hãy xem lại quy tắc và thử lại.",
    savedToGrammarList: "Đã lưu vào Ôn Tập Ngữ Pháp"
  }
};