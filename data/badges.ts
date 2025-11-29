
import { BadgeDefinition } from "../types";

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // --- WORDS (The Scroll Path) ---
  {
    id: "w_1",
    name: { en: "Word Initiate", vi: "Tân Binh Từ Vựng" },
    description: { en: "Master your first word.", vi: "Học thuộc từ vựng đầu tiên của bạn." },
    icon: "📜",
    type: "words",
    threshold: 1
  },
  {
    id: "w_2",
    name: { en: "Scribe Apprentice", vi: "Học Giả Tập Sự" },
    description: { en: "Master 5 words.", vi: "Nắm vững 5 từ vựng." },
    icon: "🖋️",
    type: "words",
    threshold: 5
  },
  {
    id: "w_3",
    name: { en: "Scroll Keeper", vi: "Người Giữ Cuộn Giấy" },
    description: { en: "Master 20 words.", vi: "Nắm vững 20 từ vựng." },
    icon: "🏺",
    type: "words",
    threshold: 20
  },
  {
    id: "w_4",
    name: { en: "Lexicon Mage", vi: "Pháp Sư Ngôn Ngữ" },
    description: { en: "Master 50 words.", vi: "Nắm vững 50 từ vựng." },
    icon: "📖",
    type: "words",
    threshold: 50
  },
  {
    id: "w_5",
    name: { en: "Word Weaver", vi: "Người Dệt Chữ" },
    description: { en: "Master 100 words.", vi: "Nắm vững 100 từ vựng." },
    icon: "🧙‍♂️",
    type: "words",
    threshold: 100
  },

  // --- SPEAKING (The Bard Path) ---
  {
    id: "s_1",
    name: { en: "Silent Observer", vi: "Người Quan Sát" },
    description: { en: "Speak your first sentence.", vi: "Nói câu tiếng Anh đầu tiên." },
    icon: "😶",
    type: "sentences",
    threshold: 1
  },
  {
    id: "s_2",
    name: { en: "Whispering Wind", vi: "Cơn Gió Thì Thầm" },
    description: { en: "Speak 5 sentences.", vi: "Nói được 5 câu." },
    icon: "🍃",
    type: "sentences",
    threshold: 5
  },
  {
    id: "s_3",
    name: { en: "Bard's Apprentice", vi: "Học Trò Nhạc Sĩ" },
    description: { en: "Speak 20 sentences.", vi: "Nói được 20 câu." },
    icon: "🪕",
    type: "sentences",
    threshold: 20
  },
  {
    id: "s_4",
    name: { en: "Voice of Valour", vi: "Giọng Nói Dũng Cảm" },
    description: { en: "Speak 50 sentences.", vi: "Nói được 50 câu." },
    icon: "🦁",
    type: "sentences",
    threshold: 50
  },
  {
    id: "s_5",
    name: { en: "Echo Master", vi: "Bậc Thầy Vang Vọng" },
    description: { en: "Speak 100 sentences.", vi: "Nói được 100 câu." },
    icon: "🗣️",
    type: "sentences",
    threshold: 100
  },

  // --- STREAK (The Time Path) ---
  {
    id: "st_1",
    name: { en: "Day Walker", vi: "Người Đi Dạo" },
    description: { en: "Complete a 3 day streak.", vi: "Đạt chuỗi 3 ngày liên tiếp." },
    icon: "🚶",
    type: "streak",
    threshold: 3
  },
  {
    id: "st_2",
    name: { en: "Time Traveler", vi: "Nhà Du Hành" },
    description: { en: "Complete a 7 day streak.", vi: "Đạt chuỗi 7 ngày liên tiếp." },
    icon: "⏳",
    type: "streak",
    threshold: 7
  },
  {
    id: "st_3",
    name: { en: "Chronos Keeper", vi: "Người Giữ Thời Gian" },
    description: { en: "Complete a 30 day streak.", vi: "Đạt chuỗi 30 ngày liên tiếp." },
    icon: "⌛",
    type: "streak",
    threshold: 30
  },

  // --- GRAMMAR (The Syntax Path) ---
  {
    id: "g_1",
    name: { en: "Grammar Goblin", vi: "Yêu Tinh Ngữ Pháp" },
    description: { en: "Master 1 grammar point.", vi: "Nắm vững 1 điểm ngữ pháp." },
    icon: "👺",
    type: "grammar",
    threshold: 1
  },
  {
    id: "g_2",
    name: { en: "Syntax Sorcerer", vi: "Phù Thủy Cú Pháp" },
    description: { en: "Master 5 grammar points.", vi: "Nắm vững 5 điểm ngữ pháp." },
    icon: "🔮",
    type: "grammar",
    threshold: 5
  },
  {
    id: "g_3",
    name: { en: "Rule Bender", vi: "Người Uốn Luật" },
    description: { en: "Master 10 grammar points.", vi: "Nắm vững 10 điểm ngữ pháp." },
    icon: "🌀",
    type: "grammar",
    threshold: 10
  }
];