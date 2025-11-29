
import { GrammarLesson } from "../types";

export const grammarData: GrammarLesson[] = [
  {
    id: "present_simple_daily_life",
    title: "Present Simple – Daily Routines",
    explanation:
      "We use the Present Simple to talk about habits and routines. Add -s or -es for he, she, it.",
    examples: [
      { en: "I do my laundry on Sundays.", vi: "Tôi giặt đồ vào Chủ nhật." },
      { en: "She pays the bills at the end of the month.", vi: "Cô ấy trả các hoá đơn vào cuối tháng." },
      { en: "They usually relax after dinner.", vi: "Họ thường thư giãn sau bữa tối." }
    ],
    exercises: [
      {
        question: "He ___ coffee every morning.",
        options: ["drink", "drinks", "is drinking"],
        answer: "drinks"
      },
      {
        question: "I ___ my neighbor every day.",
        options: ["see", "sees", "seeing"],
        answer: "see"
      },
      {
        question: "They ___ to the grocery store on Saturdays.",
        options: ["go", "goes", "going"],
        answer: "go"
      }
    ]
  }
];
