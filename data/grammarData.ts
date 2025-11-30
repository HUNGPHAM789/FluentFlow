

import { GrammarLevelGroup } from "../types";

export const grammarLevels: GrammarLevelGroup[] = [
  // === Pre-A0: ABSOLUTE BEGINNER ===
  {
    level: "PreA0",
    titleVi: "Pre-A0 – Khóa nền tảng siêu cơ bản",
    titleEn: "Pre-A0 – Ultra-basic foundation",
    descriptionVi: "Dành cho người gần như chưa biết tiếng Anh. Giải thích bằng tiếng Việt, tập trung vào S, V, to be, do/does.",
    lessons: [
      {
        id: "prea0_pronouns_subjects",
        level: "PreA0",
        purposeTitleVi: "Đại từ: I, You, We, They...",
        purposeTitleEn: "Pronouns: I, You, We, They, He, She, It",
        shortDescriptionVi: "Hiểu I/you/we/they/he/she/it là ai.",
        sampleSentenceVi: "I am Hung. – Tôi là Hưng.",
        sampleSentenceEn: "I am Hung.",
        explanationVi: "S = Chủ ngữ (người thực hiện hành động). I (Tôi), You (Bạn), We (Chúng tôi), They (Họ), He (Anh ấy), She (Cô ấy), It (Nó).",
        explanationEn: "Subject pronouns represent people or things.",
        drills: [
          { 
            id: "pa0_d1", 
            type: "multiple_choice",
            question: "Chọn từ đúng để điền vào chỗ trống: ___ am a student.", 
            options: ["I", "You", "He"], 
            answer: "I" 
          },
          { 
            id: "pa0_d2", 
            type: "fill_blank",
            question: "Điền chủ ngữ còn thiếu: ___ is my friend. (Cô ấy)", 
            answer: "She" 
          }
        ]
      },
      {
        id: "prea0_to_be_basic",
        level: "PreA0",
        purposeTitleVi: "To be: am/is/are",
        purposeTitleEn: "To be: am/is/are",
        shortDescriptionVi: "Hiểu to be = thì/là/ở.",
        sampleSentenceVi: "I am tired. – Tôi (thì) mệt.",
        sampleSentenceEn: "I am tired.",
        explanationVi: "Công thức: I am, He/She/It is, You/We/They are.",
        explanationEn: "I am, He/She/It is, You/We/They are.",
        drills: [
          { 
            id: "pa0_d3", 
            type: "drag_drop",
            question: "Kéo từ đúng vào chỗ trống:",
            sentence: "I ___ happy.",
            choices: ["am", "is", "are"],
            answer: "am" 
          },
          { 
            id: "pa0_d4", 
            type: "drag_drop", 
            question: "Kéo từ đúng vào chỗ trống:",
            sentence: "It ___ a cat.",
            choices: ["am", "is", "are"],
            answer: "is" 
          }
        ]
      },
      {
        id: "prea0_this_that",
        level: "PreA0",
        purposeTitleVi: "This / That (Cái này / Cái kia)",
        purposeTitleEn: "This is / That is",
        shortDescriptionVi: "Chỉ vào đồ vật: Đây là... Kia là...",
        sampleSentenceVi: "This is my phone.",
        sampleSentenceEn: "This is my phone.",
        explanationVi: "This (đây, gần), That (kia, xa). Đi với 'is' (số ít).",
        explanationEn: "This (near), That (far). Use with 'is'.",
        drills: [
          { 
            id: "pa0_d5", 
            type: "reorder",
            question: "Sắp xếp thành câu đúng (Gần):",
            items: ["This", "is", "my", "book"],
            answer: ["This", "is", "my", "book"]
          },
          { 
            id: "pa0_d6", 
            type: "reorder",
            question: "Sắp xếp thành câu đúng (Xa):",
            items: ["That", "is", "a", "bird"],
            answer: ["That", "is", "a", "bird"]
          }
        ]
      },
      {
        id: "prea0_do_does",
        level: "PreA0",
        purposeTitleVi: "Do / Does (Làm)",
        purposeTitleEn: "Do / Does",
        shortDescriptionVi: "Phân biệt 'thì/là' và 'làm'.",
        sampleSentenceVi: "I do homework.",
        sampleSentenceEn: "I do homework.",
        explanationVi: "I/You/We/They dùng 'Do'. He/She/It dùng 'Does'.",
        explanationEn: "I/You/We/They use Do. He/She/It uses Does.",
        drills: [
          { id: "pa0_d7", type: "multiple_choice", question: "She ___ yoga.", options: ["do", "does", "is"], answer: "does" },
          { id: "pa0_d8", type: "fill_blank", question: "We ___ the dishes. (Làm)", answer: "do" }
        ]
      },
      {
        id: "prea0_negation",
        level: "PreA0",
        purposeTitleVi: "Câu phủ định (Không)",
        purposeTitleEn: "Negation (Not)",
        shortDescriptionVi: "Tôi không mệt. Tôi không làm.",
        sampleSentenceVi: "I am not tired.",
        sampleSentenceEn: "I am not tired.",
        explanationVi: "Thêm 'not' sau am/is/are. Thêm 'do not' (don't) hoặc 'does not' (doesn't) trước động từ thường.",
        explanationEn: "Add 'not' after be. Use don't/doesn't for verbs.",
        drills: [
          { id: "pa0_d9", type: "drag_drop", question: "Hoàn thành câu phủ định:", sentence: "I am ___ tired.", choices: ["not", "no", "don't"], answer: "not" },
          { id: "pa0_d10", type: "drag_drop", question: "Hoàn thành câu phủ định:", sentence: "He ___ like pizza.", choices: ["not", "doesn't", "don't"], answer: "doesn't" }
        ]
      },
      {
        id: "prea0_yesno",
        level: "PreA0",
        purposeTitleVi: "Câu hỏi Yes/No",
        purposeTitleEn: "Yes/No Questions",
        shortDescriptionVi: "Bạn có ổn không? Cô ấy có làm không?",
        sampleSentenceVi: "Are you okay?",
        sampleSentenceEn: "Are you okay?",
        explanationVi: "Đảo Am/Is/Are hoặc Do/Does lên đầu câu.",
        explanationEn: "Move Am/Is/Are or Do/Does to the front.",
        drills: [
          { id: "pa0_d11", type: "multiple_choice", question: "___ you ready?", options: ["Are", "Do", "Is"], answer: "Are" },
          { id: "pa0_d12", type: "reorder", question: "Tạo câu hỏi:", items: ["Do", "you", "like", "cats?"], answer: ["Do", "you", "like", "cats?"] }
        ]
      }
    ]
  },

  // === A0: SURVIVAL ===
  {
    level: "A0",
    titleVi: "Ngữ pháp sống sót",
    titleEn: "Survival Grammar",
    descriptionVi: "Nói về bản thân, người khác và đồ vật cơ bản.",
    lessons: [
      {
        id: "a0_self_intro",
        level: "A0",
        purposeTitleVi: "Nói về bản thân",
        purposeTitleEn: "Talking about yourself",
        shortDescriptionVi: "Giới thiệu tên, công việc, cảm xúc.",
        sampleSentenceVi: "Tôi là nhân viên mới.",
        sampleSentenceEn: "I am a new staff member.",
        explanationVi: "Sử dụng động từ 'to be' (am) để giới thiệu bản thân. Công thức: I + am + (tên/nghề nghiệp/tính từ).",
        explanationEn: "Use the verb 'to be' (am) to introduce yourself. Formula: I + am + (name/job/adjective).",
        drills: [
          { id: "a0_d1", type: "multiple_choice", question: "I ___ a student.", options: ["am", "is", "are"], answer: "am" },
          { id: "a0_d2", type: "multiple_choice", question: "I ___ happy.", options: ["am", "is", "are"], answer: "am" },
          { id: "a0_d3", type: "multiple_choice", question: "I ___ from Vietnam.", options: ["am", "is", "are"], answer: "am" }
        ]
      },
      {
        id: "a0_others",
        level: "A0",
        purposeTitleVi: "Nói về người khác",
        purposeTitleEn: "Talking about others",
        shortDescriptionVi: "Mô tả anh ấy, cô ấy, họ.",
        sampleSentenceVi: "Cô ấy là bạn tôi.",
        sampleSentenceEn: "She is my friend.",
        explanationVi: "Sử dụng 'is' cho He/She/It (số ít) và 'are' cho You/We/They (số nhiều).",
        explanationEn: "Use 'is' for He/She/It and 'are' for You/We/They.",
        drills: [
          { id: "a0_d4", type: "multiple_choice", question: "She ___ my teacher.", options: ["am", "is", "are"], answer: "is" },
          { id: "a0_d5", type: "multiple_choice", question: "They ___ busy.", options: ["am", "is", "are"], answer: "are" },
          { id: "a0_d6", type: "multiple_choice", question: "He ___ tall.", options: ["am", "is", "are"], answer: "is" }
        ]
      },
      {
        id: "a0_objects",
        level: "A0",
        purposeTitleVi: "Nói về đồ vật",
        purposeTitleEn: "Talking about objects",
        shortDescriptionVi: "Cái này là gì? Cái kia là gì?",
        sampleSentenceVi: "Đây là một quyển sách.",
        sampleSentenceEn: "This is a book.",
        explanationVi: "Dùng 'This is' cho vật ở gần, 'That is' cho vật ở xa (số ít).",
        explanationEn: "Use 'This is' for near objects, 'That is' for far objects (singular).",
        drills: [
          { id: "a0_d7", type: "multiple_choice", question: "___ is my pen (near).", options: ["This", "That", "These"], answer: "This" },
          { id: "a0_d8", type: "multiple_choice", question: "___ is a car (far).", options: ["This", "That", "Those"], answer: "That" }
        ]
      },
      {
        id: "a0_questions",
        level: "A0",
        purposeTitleVi: "Hỏi đáp đơn giản",
        purposeTitleEn: "Simple Q&A",
        shortDescriptionVi: "Câu hỏi Có/Không cơ bản.",
        sampleSentenceVi: "Bạn có ổn không?",
        sampleSentenceEn: "Are you okay?",
        explanationVi: "Đưa động từ 'to be' (Am/Is/Are) lên đầu câu để tạo câu hỏi.",
        explanationEn: "Move 'to be' (Am/Is/Are) to the front to make a question.",
        drills: [
          { id: "a0_d9", type: "multiple_choice", question: "___ you ready?", options: ["Am", "Is", "Are"], answer: "Are" },
          { id: "a0_d10", type: "multiple_choice", question: "___ he your brother?", options: ["Am", "Is", "Are"], answer: "Is" }
        ]
      }
    ]
  },

  // === A1: DAILY COMMUNICATION ===
  {
    level: "A1",
    titleVi: "Ngữ pháp giao tiếp",
    titleEn: "Daily Communication",
    descriptionVi: "Thói quen, khả năng và câu hỏi thông tin.",
    lessons: [
      {
        id: "a1_habits",
        level: "A1",
        purposeTitleVi: "Nói về thói quen",
        purposeTitleEn: "Talking about habits",
        shortDescriptionVi: "Tôi thường thức dậy lúc 6 giờ.",
        sampleSentenceVi: "Tôi uống cà phê mỗi ngày.",
        sampleSentenceEn: "I drink coffee every day.",
        explanationVi: "Thì Hiện tại đơn (Present Simple). Thêm 's/es' nếu chủ ngữ là He/She/It.",
        explanationEn: "Present Simple Tense. Add 's/es' for He/She/It.",
        drills: [
          { id: "a1_d1", type: "multiple_choice", question: "She ___ to work by bus.", options: ["go", "goes", "going"], answer: "goes" },
          { id: "a1_d2", type: "multiple_choice", question: "I ___ soccer on Sundays.", options: ["play", "plays", "playing"], answer: "play" },
          { id: "a1_d3", type: "multiple_choice", question: "He ___ not like tea.", options: ["do", "does", "is"], answer: "does" }
        ]
      },
      {
        id: "a1_ability",
        level: "A1",
        purposeTitleVi: "Nói về khả năng",
        purposeTitleEn: "Talking about ability",
        shortDescriptionVi: "Tôi có thể bơi. Tôi không thể lái xe.",
        sampleSentenceVi: "Tôi có thể nói tiếng Anh.",
        sampleSentenceEn: "I can speak English.",
        explanationVi: "Dùng 'can' + động từ nguyên mẫu để nói về khả năng.",
        explanationEn: "Use 'can' + base verb to talk about ability.",
        drills: [
          { id: "a1_d4", type: "multiple_choice", question: "I ___ swim very well.", options: ["can", "cans", "canning"], answer: "can" },
          { id: "a1_d5", type: "multiple_choice", question: "She can ___ the piano.", options: ["play", "plays", "playing"], answer: "play" }
        ]
      },
      {
        id: "a1_wh_questions",
        level: "A1",
        purposeTitleVi: "Hỏi thông tin (Wh-)",
        purposeTitleEn: "Wh- Questions",
        shortDescriptionVi: "Cái gì, Ở đâu, Khi nào?",
        sampleSentenceVi: "Bạn sống ở đâu?",
        sampleSentenceEn: "Where do you live?",
        explanationVi: "Dùng từ để hỏi (What, Where, When...) + trợ động từ (do/does/is/are).",
        explanationEn: "Use Wh- word + auxiliary verb.",
        drills: [
          { id: "a1_d6", type: "multiple_choice", question: "___ is your name?", options: ["What", "Where", "When"], answer: "What" },
          { id: "a1_d7", type: "multiple_choice", question: "___ do you live?", options: ["What", "Where", "Who"], answer: "Where" },
          { id: "a1_d8", type: "multiple_choice", question: "___ is that man?", options: ["Who", "Which", "What"], answer: "Who" }
        ]
      },
      {
        id: "a1_prepositions",
        level: "A1",
        purposeTitleVi: "Giới từ cơ bản",
        purposeTitleEn: "Basic Prepositions",
        shortDescriptionVi: "Ở trong, ở trên, tại...",
        sampleSentenceVi: "Cuộc họp diễn ra vào thứ Hai.",
        sampleSentenceEn: "The meeting is on Monday.",
        explanationVi: "In (tháng/năm/nơi lớn), On (ngày/đường), At (giờ/địa điểm cụ thể).",
        explanationEn: "In (months/years), On (days), At (time/specific places).",
        drills: [
          { id: "a1_d9", type: "multiple_choice", question: "The party is ___ Sunday.", options: ["in", "on", "at"], answer: "on" },
          { id: "a1_d10", type: "multiple_choice", question: "I live ___ Vietnam.", options: ["in", "on", "at"], answer: "in" },
          { id: "a1_d11", type: "multiple_choice", question: "See you ___ 5 PM.", options: ["in", "on", "at"], answer: "at" }
        ]
      }
    ]
  },

  // === A2: EXTENDED ===
  {
    level: "A2",
    titleVi: "Giao tiếp mở rộng",
    titleEn: "Extended Communication",
    descriptionVi: "Kế hoạch tương lai, quá khứ và so sánh.",
    lessons: [
      {
        id: "a2_future",
        level: "A2",
        purposeTitleVi: "Kế hoạch tương lai",
        purposeTitleEn: "Future Plans",
        shortDescriptionVi: "Tôi sẽ đi du lịch. Tôi dự định mua xe.",
        sampleSentenceVi: "Tôi sẽ gọi cho bạn sau.",
        sampleSentenceEn: "I will call you later.",
        explanationVi: "Dùng 'will' cho quyết định tức thì, 'going to' cho kế hoạch có sẵn.",
        explanationEn: "Use 'will' for instant decisions, 'going to' for plans.",
        drills: [
          { id: "a2_d1", type: "multiple_choice", question: "I ___ help you with that.", options: ["will", "am going", "go"], answer: "will" },
          { id: "a2_d2", type: "multiple_choice", question: "She is ___ to visit Paris.", options: ["will", "going", "go"], answer: "going" }
        ]
      },
      {
        id: "a2_past",
        level: "A2",
        purposeTitleVi: "Kể về quá khứ",
        purposeTitleEn: "Talking about the past",
        shortDescriptionVi: "Hôm qua tôi đã làm gì.",
        sampleSentenceVi: "Tôi đã đi làm hôm qua.",
        sampleSentenceEn: "I went to work yesterday.",
        explanationVi: "Thì Quá khứ đơn. Động từ thêm -ed hoặc bất quy tắc (go -> went).",
        explanationEn: "Past Simple. Add -ed or use irregular verbs.",
        drills: [
          { id: "a2_d3", type: "multiple_choice", question: "I ___ pizza last night.", options: ["eat", "eats", "ate"], answer: "ate" },
          { id: "a2_d4", type: "multiple_choice", question: "She ___ happy yesterday.", options: ["is", "was", "were"], answer: "was" },
          { id: "a2_d5", type: "multiple_choice", question: "They ___ soccer last weekend.", options: ["play", "played", "playing"], answer: "played" }
        ]
      },
      {
        id: "a2_comparison",
        level: "A2",
        purposeTitleVi: "So sánh",
        purposeTitleEn: "Comparisons",
        shortDescriptionVi: "Cái này tốt hơn cái kia.",
        sampleSentenceVi: "Anh ấy cao hơn tôi.",
        sampleSentenceEn: "He is taller than me.",
        explanationVi: "Thêm -er cho tính từ ngắn + than. Dùng 'more' cho tính từ dài + than.",
        explanationEn: "Add -er for short adj + than. Use 'more' for long adj + than.",
        drills: [
          { id: "a2_d6", type: "multiple_choice", question: "This car is ___ than that one.", options: ["fast", "faster", "fastest"], answer: "faster" },
          { id: "a2_d7", type: "multiple_choice", question: "She is ___ beautiful than me.", options: ["more", "most", "much"], answer: "more" }
        ]
      }
    ]
  }
];
