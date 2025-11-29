
import { QuizQuestion } from "../types";

export const placementQuiz: QuizQuestion[] = [
  // === DAILY LIFE STYLE QUESTIONS ===
  {
    id: "dl_q1",
    question: "What does 'laundry' mean?",
    options: [
      "việc giặt đồ",
      "tiền thuê nhà",
      "thời gian rảnh",
      "bữa trưa"
    ],
    correct: "việc giặt đồ",
    category: "Vocabulary"
  },
  {
    id: "dl_q2",
    question: "Choose the correct sentence:",
    options: [
      "He pay the bills on Friday.",
      "He pays the bills on Friday.",
      "He paying the bills on Friday.",
      "He is pay the bills on Friday."
    ],
    correct: "He pays the bills on Friday.",
    category: "Grammar"
  },
  {
    id: "dl_q3",
    question: "Which word is closest in meaning to 'neighbor'?",
    options: [
      "hàng xóm",
      "khách hàng",
      "nhân viên",
      "du khách"
    ],
    correct: "hàng xóm",
    category: "Vocabulary"
  },
  {
    id: "dl_q4",
    question: "I ___ my commute every day.",
    options: ["hate", "hates", "is hate", "hating"],
    correct: "hate",
    category: "Grammar"
  },
  {
    id: "dl_q5",
    question: "You look ___. You should relax.",
    options: ["tire", "tired", "tiring", "tiredly"],
    correct: "tired",
    category: "Vocabulary"
  }
];
