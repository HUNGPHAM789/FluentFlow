
import { VocabItem } from "../types";

// Unified Vocabulary Database
export const vocabData: VocabItem[] = [
  // === DAILY LIFE ===
  {
    word: "neighbor",
    ipa: "/ˈneɪ.bər/",
    definitionEn: "A person living next door to or very near to the speaker or person referred to.",
    definitionVi: "hàng xóm",
    examples: [
      { en: "My neighbor is very friendly.", vi: "Hàng xóm của tôi rất thân thiện." },
      { en: "I sometimes have coffee with my neighbor on Sundays.", vi: "Thỉnh thoảng tôi uống cà phê với hàng xóm vào Chủ nhật." },
      { en: "We should help our neighbors.", vi: "Chúng ta nên giúp đỡ hàng xóm của mình." }
    ],
    wordForms: { noun: "neighbor", adjective: "neighboring" },
    topic: "Daily Life"
  },
  {
    word: "laundry",
    ipa: "/ˈlɑːn.dri/",
    definitionEn: "Clothes and linens that need to be washed or that have been newly washed.",
    definitionVi: "việc giặt đồ; đồ giặt",
    examples: [
      { en: "I do my laundry every Sunday.", vi: "Tôi giặt đồ mỗi Chủ nhật." },
      { en: "There is a small laundry room in my building.", vi: "Có một phòng giặt nhỏ trong toà nhà của tôi." },
      { en: "Don't leave your laundry on the floor.", vi: "Đừng để đồ giặt của bạn trên sàn nhà." }
    ],
    wordForms: { noun: "laundry" },
    topic: "Daily Life"
  },
  {
    word: "appointment",
    ipa: "/əˈpɔɪnt.mənt/",
    definitionEn: "An arrangement to meet someone at a particular time and place.",
    definitionVi: "cuộc hẹn (thường với bác sĩ, công ty, v.v.)",
    examples: [
      { en: "I have a doctor’s appointment at 3 p.m.", vi: "Tôi có cuộc hẹn với bác sĩ lúc 3 giờ chiều." },
      { en: "Please arrive ten minutes before your appointment.", vi: "Vui lòng đến trước giờ hẹn mười phút." },
      { en: "She canceled her appointment.", vi: "Cô ấy đã hủy cuộc hẹn." }
    ],
    wordForms: { noun: "appointment", verb: "appoint", adjective: "appointed" },
    topic: "Daily Life"
  },
  {
    word: "grocery",
    ipa: "/ˈɡroʊ.sɚ.i/",
    definitionEn: "Items of food sold in a supermarket.",
    definitionVi: "đồ tạp hoá, thực phẩm mua ở siêu thị",
    examples: [
      { en: "I need to buy some groceries after work.", vi: "Tôi cần mua vài món tạp hoá sau giờ làm." },
      { en: "This store sells fresh groceries.", vi: "Cửa hàng này bán đồ tạp hoá tươi." },
      { en: "The grocery bill was expensive.", vi: "Hóa đơn tiền chợ rất đắt." }
    ],
    wordForms: { noun: "grocery / groceries" },
    topic: "Daily Life"
  },
  {
    word: "habit",
    ipa: "/ˈhæb.ɪt/",
    definitionEn: "A settled or regular tendency or practice, especially one that is hard to give up.",
    definitionVi: "thói quen",
    examples: [
      { en: "Drinking water in the morning is a good habit.", vi: "Uống nước buổi sáng là một thói quen tốt." },
      { en: "I’m trying to build a habit of reading every day.", vi: "Tôi đang cố tạo thói quen đọc sách mỗi ngày." },
      { en: "Old habits are hard to break.", vi: "Thói quen cũ rất khó bỏ." }
    ],
    wordForms: { noun: "habit", adjective: "habitual", adverb: "habitually" },
    topic: "Daily Life"
  },
  {
    word: "commute",
    ipa: "/kəˈmjuːt/",
    definitionEn: "A regular journey of some distance to and from one's place of work.",
    definitionVi: "đi lại hằng ngày giữa nhà và nơi làm",
    examples: [
      { en: "I commute to work by bus.", vi: "Tôi đi làm bằng xe buýt." },
      { en: "My commute takes about forty minutes.", vi: "Quãng đường đi làm của tôi mất khoảng bốn mươi phút." },
      { en: "He commutes from the suburbs.", vi: "Anh ấy đi làm từ vùng ngoại ô." }
    ],
    wordForms: { noun: "commute", verb: "commute", adjective: "commuter (n.)" },
    topic: "Daily Life"
  },
  {
    word: "bill",
    ipa: "/bɪl/",
    definitionEn: "A printed or written statement of the money owed for goods or services.",
    definitionVi: "hoá đơn (tiền điện, nước, ăn uống, v.v.)",
    examples: [
      { en: "I have to pay the electricity bill this week.", vi: "Tôi phải trả hoá đơn điện tuần này." },
      { en: "Could we get the bill, please?", vi: "Cho tôi xin hoá đơn được không?" },
      { en: "They billed me for the extra service.", vi: "Họ đã tính tiền tôi cho dịch vụ thêm." }
    ],
    wordForms: { noun: "bill", verb: "bill", adjective: "billed" },
    topic: "Daily Life"
  },
  {
    word: "schedule",
    ipa: "/ˈskedʒ.uːl/",
    definitionEn: "A plan for carrying out a process or procedure, giving lists of intended events and times.",
    definitionVi: "lịch trình, thời gian biểu",
    examples: [
      { en: "My schedule is very busy on weekdays.", vi: "Lịch làm việc của tôi rất bận vào các ngày trong tuần." },
      { en: "Let’s check the bus schedule.", vi: "Hãy kiểm tra lịch trình xe buýt." },
      { en: "The meeting is scheduled for Monday.", vi: "Cuộc họp được lên lịch vào thứ Hai." }
    ],
    wordForms: { noun: "schedule", verb: "schedule", adjective: "scheduled" },
    topic: "Daily Life"
  },
  {
    word: "relax",
    ipa: "/rɪˈlæks/",
    definitionEn: "Make or become less tense or anxious.",
    definitionVi: "thư giãn",
    examples: [
      { en: "I like to relax and watch TV after work.", vi: "Tôi thích thư giãn và xem TV sau giờ làm." },
      { en: "On Sunday, I just relax at home.", vi: "Vào Chủ nhật, tôi chỉ thư giãn ở nhà." },
      { en: "Relax, everything will be fine.", vi: "Thư giãn đi, mọi chuyện sẽ ổn thôi." }
    ],
    wordForms: { noun: "relaxation", verb: "relax", adjective: "relaxed / relaxing" },
    topic: "Daily Life"
  },
  {
    word: "tired",
    ipa: "/taɪrd/",
    definitionEn: "In need of sleep or rest; weary.",
    definitionVi: "mệt, mệt mỏi",
    examples: [
      { en: "I feel tired after a long shift.", vi: "Tôi thấy mệt sau một ca làm dài." },
      { en: "You look tired. You should take a break.", vi: "Bạn trông có vẻ mệt. Bạn nên nghỉ một chút." },
      { en: "I am tired of this weather.", vi: "Tôi mệt mỏi với thời tiết này." }
    ],
    wordForms: { noun: "tiredness", verb: "tire", adjective: "tired", adverb: "tiredly" },
    topic: "Daily Life"
  },

  // === IELTS ===
  {
    word: "abundant",
    ipa: "/əˈbʌn.dənt/",
    definitionEn: "Existing or available in large quantities; plentiful.",
    definitionVi: "phong phú, dồi dào",
    examples: [
      { en: "Natural resources are abundant in this region.", vi: "Tài nguyên thiên nhiên rất phong phú ở khu vực này." },
      { en: "There is abundant evidence to support this theory.", vi: "Có bằng chứng dồi dào để ủng hộ lý thuyết này." },
      { en: "We have an abundant supply of food.", vi: "Chúng tôi có nguồn cung cấp thực phẩm dồi dào." }
    ],
    wordForms: { noun: "abundance", adjective: "abundant", adverb: "abundantly" },
    topic: "IELTS"
  },
  {
    word: "accumulate",
    ipa: "/əˈkjuː.mjə.leɪt/",
    definitionEn: "Gather together or acquire an increasing number or quantity of.",
    definitionVi: "tích lũy",
    examples: [
      { en: "Dust tends to accumulate quickly.", vi: "Bụi thường tích tụ rất nhanh." }
    ],
    wordForms: { noun: "accumulation", verb: "accumulate" },
    topic: "IELTS"
  },
  {
    word: "accurate",
    ipa: "/ˈæk.jɚ.ət/",
    definitionEn: "Correct in all details; exact.",
    definitionVi: "chính xác",
    examples: [
      { en: "We need accurate measurements.", vi: "Chúng ta cần số đo chính xác." }
    ],
    wordForms: { noun: "accuracy", adjective: "accurate", adverb: "accurately" },
    topic: "IELTS"
  },
  {
    word: "analyze",
    ipa: "/ˈæn.əl.aɪz/",
    definitionEn: "Examine methodically and in detail the constitution or structure of something.",
    definitionVi: "phân tích",
    examples: [
      { en: "We need to analyze the data carefully.", vi: "Chúng ta cần phân tích dữ liệu một cách cẩn thận." },
      { en: "The scientist analyzed the water sample.", vi: "Nhà khoa học đã phân tích mẫu nước." },
      { en: "This report analyzes the market trends.", vi: "Báo cáo này phân tích các xu hướng thị trường." }
    ],
    wordForms: { noun: "analysis", verb: "analyze", adjective: "analytical", adverb: "analytically" },
    topic: "IELTS"
  },
  {
    word: "anticipate",
    ipa: "/ænˈtɪs.ə.peɪt/",
    definitionEn: "Regard as probable; expect or predict.",
    definitionVi: "dự đoán, lường trước",
    examples: [
      { en: "We anticipate a busy tourist season.", vi: "Chúng tôi dự đoán một mùa du lịch bận rộn." },
      { en: "I didn't anticipate this problem.", vi: "Tôi đã không lường trước được vấn đề này." },
      { en: "They anticipate that prices will rise.", vi: "Họ dự đoán rằng giá cả sẽ tăng." }
    ],
    wordForms: { noun: "anticipation", verb: "anticipate", adjective: "anticipated" },
    topic: "IELTS"
  },
  {
    word: "beneficial",
    ipa: "/ˌben.əˈfɪʃ.əl/",
    definitionEn: "Favorable or advantageous; resulting in good.",
    definitionVi: "có lợi, hữu ích",
    examples: [
      { en: "Regular exercise is beneficial for health.", vi: "Tập thể dục thường xuyên có lợi cho sức khỏe." },
      { en: "A good diet is beneficial to your body.", vi: "Một chế độ ăn uống tốt có lợi cho cơ thể của bạn." },
      { en: "The agreement was beneficial to both parties.", vi: "Thỏa thuận này có lợi cho cả hai bên." }
    ],
    wordForms: { noun: "benefit", verb: "benefit", adjective: "beneficial", adverb: "beneficially" },
    topic: "IELTS"
  },
  {
    word: "complex",
    ipa: "/ˈkɑːm.pleks/",
    definitionEn: "Consisting of many different and connected parts.",
    definitionVi: "phức tạp",
    examples: [
      { en: "The human brain is very complex.", vi: "Bộ não con người rất phức tạp." },
      { en: "It was a complex situation to deal with.", vi: "Đó là một tình huống phức tạp để giải quyết." },
      { en: "The instructions were too complex for me.", vi: "Các hướng dẫn quá phức tạp đối với tôi." }
    ],
    wordForms: { noun: "complexity", verb: "complicate", adjective: "complex" },
    topic: "IELTS"
  },
  {
    word: "concept",
    ipa: "/ˈkɑːn.sept/",
    definitionEn: "An abstract idea; a general notion.",
    definitionVi: "khái niệm, ý tưởng",
    examples: [
      { en: "The concept of time travel is fascinating.", vi: "Khái niệm du hành thời gian rất hấp dẫn." },
      { en: "She struggled to understand the basic concepts.", vi: "Cô ấy chật vật để hiểu các khái niệm cơ bản." },
      { en: "It is a simple concept to grasp.", vi: "Đó là một khái niệm đơn giản để nắm bắt." }
    ],
    wordForms: { noun: "concept / conception", verb: "conceptualize", adjective: "conceptual", adverb: "conceptually" },
    topic: "IELTS"
  },
  {
    word: "conduct",
    ipa: "/kənˈdʌkt/",
    definitionEn: "Organize and carry out.",
    definitionVi: "tiến hành, thực hiện",
    examples: [
      { en: "They conducted a survey of student opinions.", vi: "Họ đã tiến hành một cuộc khảo sát ý kiến sinh viên." },
      { en: "The experiment was conducted in a lab.", vi: "Thí nghiệm được thực hiện trong phòng thí nghiệm." },
      { en: "He conducted himself professionally.", vi: "Anh ấy cư xử (thực hiện bản thân) một cách chuyên nghiệp." }
    ],
    wordForms: { noun: "conduct / conductor", verb: "conduct" },
    topic: "IELTS"
  },
  {
    word: "consume",
    ipa: "/kənˈsuːm/",
    definitionEn: "Eat, drink, or ingest food or drink.",
    definitionVi: "tiêu thụ",
    examples: [
      { en: "This car consumes a lot of fuel.", vi: "Chiếc xe này tiêu thụ rất nhiều nhiên liệu." },
      { en: "People consume more sugar than they should.", vi: "Mọi người tiêu thụ nhiều đường hơn mức cần thiết." },
      { en: "The fire consumed the entire building.", vi: "Ngọn lửa đã thiêu rụi (tiêu thụ) toàn bộ tòa nhà." }
    ],
    wordForms: { noun: "consumption / consumer", verb: "consume", adjective: "consumable" },
    topic: "IELTS"
  },
  {
    word: "context",
    ipa: "/ˈkɑːn.tekst/",
    definitionEn: "The circumstances that form the setting for an event, statement, or idea.",
    definitionVi: "ngữ cảnh, bối cảnh",
    examples: [
      { en: "You need to look at the sentence in context.", vi: "Bạn cần xem xét câu trong ngữ cảnh của nó." },
      { en: "In this context, the word means 'happy'.", vi: "Trong ngữ cảnh này, từ này có nghĩa là 'vui vẻ'." },
      { en: "Historical context is important for understanding the novel.", vi: "Bối cảnh lịch sử rất quan trọng để hiểu cuốn tiểu thuyết." }
    ],
    wordForms: { noun: "context", verb: "contextualize", adjective: "contextual", adverb: "contextually" },
    topic: "IELTS"
  },
  {
    word: "contradict",
    ipa: "/ˌkɑːn.trəˈdɪkt/",
    definitionEn: "Deny the truth of a statement, especially by asserting the opposite.",
    definitionVi: "mâu thuẫn, trái ngược",
    examples: [
      { en: "His actions contradict his words.", vi: "Hành động của anh ấy mâu thuẫn với lời nói." },
      { en: "The evidence contradicts the witness statement.", vi: "Bằng chứng mâu thuẫn với lời khai của nhân chứng." },
      { en: "Don't contradict your boss in public.", vi: "Đừng nói trái ý (mâu thuẫn) sếp ở nơi công cộng." }
    ],
    wordForms: { noun: "contradiction", verb: "contradict", adjective: "contradictory" },
    topic: "IELTS"
  },
  {
    word: "adapt",
    definitionEn: "Make something suitable for a new use or purpose; modify.",
    definitionVi: "thích nghi",
    examples: [{ en: "Animals adapt to their environment.", vi: "Động vật thích nghi với môi trường của chúng." }],
    wordForms: { verb: "adapt", noun: "adaptation" },
    topic: "IELTS"
  },
  {
    word: "adequate",
    definitionEn: "Satisfactory or acceptable in quality or quantity.",
    definitionVi: "đầy đủ, thỏa đáng",
    examples: [{ en: "The room provides adequate space.", vi: "Căn phòng cung cấp không gian đầy đủ." }],
    wordForms: { adjective: "adequate", adverb: "adequately" },
    topic: "IELTS"
  },
  {
    word: "clarify",
    definitionEn: "Make a statement or situation less confused and more clearly comprehensible.",
    definitionVi: "làm rõ",
    examples: [{ en: "Could you clarify your point?", vi: "Bạn có thể làm rõ ý của mình không?" }],
    wordForms: { verb: "clarify", noun: "clarification" },
    topic: "IELTS"
  },

  // === WORK & BUSINESS ===
  {
    word: "agenda",
    ipa: "/əˈdʒen.də/",
    definitionEn: "A list of items to be discussed at a formal meeting.",
    definitionVi: "chương trình nghị sự, lịch trình",
    examples: [
      { en: "What is on the agenda for today's meeting?", vi: "Có gì trong chương trình nghị sự cho cuộc họp hôm nay?" },
      { en: "The first item on the agenda is the budget.", vi: "Mục đầu tiên trong chương trình nghị sự là ngân sách." },
      { en: "We need to stick to the agenda.", vi: "Chúng ta cần bám sát chương trình nghị sự." }
    ],
    wordForms: { noun: "agenda" },
    topic: "Work & Business"
  },
  {
    word: "budget",
    ipa: "/ˈbʌdʒ.ɪt/",
    definitionEn: "An estimate of income and expenditure for a set period of time.",
    definitionVi: "ngân sách",
    examples: [
      { en: "We are operating on a tight budget.", vi: "Chúng tôi đang hoạt động với ngân sách eo hẹp." },
      { en: "The project went over budget.", vi: "Dự án đã vượt quá ngân sách." },
      { en: "We need to budget for marketing expenses.", vi: "Chúng ta cần lập ngân sách cho chi phí tiếp thị." }
    ],
    wordForms: { noun: "budget", verb: "budget", adjective: "budgetary" },
    topic: "Work & Business"
  },
  {
    word: "deadline",
    ipa: "/ˈded.laɪn/",
    definitionEn: "The latest time or date by which something should be completed.",
    definitionVi: "hạn chót",
    examples: [
      { en: "The deadline for the report is Friday.", vi: "Hạn chót cho báo cáo là thứ Sáu." },
      { en: "We are working hard to meet the deadline.", vi: "Chúng tôi đang làm việc chăm chỉ để kịp hạn chót." },
      { en: "I missed the deadline for the application.", vi: "Tôi đã lỡ hạn chót nộp đơn." }
    ],
    wordForms: { noun: "deadline" },
    topic: "Work & Business"
  },
  {
    word: "negotiate",
    ipa: "/nəˈɡoʊ.ʃi.eɪt/",
    definitionEn: "Obtain or bring about by discussion.",
    definitionVi: "đàm phán, thương lượng",
    examples: [
      { en: "We need to negotiate a better deal.", vi: "Chúng ta cần đàm phán một thỏa thuận tốt hơn." },
      { en: "He is skilled at negotiating contracts.", vi: "Anh ấy rất giỏi đàm phán hợp đồng." },
      { en: "They are negotiating with the union.", vi: "Họ đang đàm phán với công đoàn." }
    ],
    wordForms: { noun: "negotiation / negotiator", verb: "negotiate", adjective: "negotiable" },
    topic: "Work & Business"
  },
  {
    word: "income",
    ipa: "/ˈɪn.kʌm/",
    definitionEn: "Money received, especially on a regular basis, for work or through investments.",
    definitionVi: "thu nhập",
    examples: [
      { en: "His annual income has increased.", vi: "Thu nhập hàng năm của anh ấy đã tăng." },
      { en: "They have two sources of income.", vi: "Họ có hai nguồn thu nhập." },
      { en: "Low-income families need support.", vi: "Các gia đình thu nhập thấp cần được hỗ trợ." }
    ],
    wordForms: { noun: "income" },
    topic: "Work & Business"
  },
  {
    word: "client",
    ipa: "/ˈklaɪ.ənt/",
    definitionEn: "A person or organization using the services of a lawyer or other professional person or company.",
    definitionVi: "khách hàng, đối tác",
    examples: [
      { en: "I have a meeting with a new client.", vi: "Tôi có cuộc họp với một khách hàng mới." },
      { en: "Our goal is to satisfy our clients.", vi: "Mục tiêu của chúng tôi là làm hài lòng khách hàng." },
      { en: "The client requested some changes.", vi: "Khách hàng đã yêu cầu một số thay đổi." }
    ],
    wordForms: { noun: "client / clientele" },
    topic: "Work & Business"
  },
  {
    word: "profit",
    ipa: "/ˈprɑː.fɪt/",
    definitionEn: "A financial gain, especially the difference between the amount earned and the amount spent.",
    definitionVi: "lợi nhuận",
    examples: [
      { en: "The company made a huge profit last year.", vi: "Công ty đã tạo ra lợi nhuận khổng lồ năm ngoái." },
      { en: "We sold the house at a profit.", vi: "Chúng tôi đã bán ngôi nhà có lời." },
      { en: "There is no profit in this business.", vi: "Không có lợi nhuận trong việc kinh doanh này." }
    ],
    wordForms: { noun: "profit", verb: "profit", adjective: "profitable", adverb: "profitably" },
    topic: "Work & Business"
  },
  {
    word: "recruit",
    ipa: "/rɪˈkruːt/",
    definitionEn: "Enlist someone in the armed forces or for a job.",
    definitionVi: "tuyển dụng",
    examples: [
      { en: "We are looking to recruit new staff.", vi: "Chúng tôi đang tìm cách tuyển dụng nhân viên mới." },
      { en: "The company recruits from top universities.", vi: "Công ty tuyển dụng từ các trường đại học hàng đầu." },
      { en: "He was recruited by a rival firm.", vi: "Anh ấy đã được một công ty đối thủ tuyển dụng." }
    ],
    wordForms: { noun: "recruit / recruitment", verb: "recruit" },
    topic: "Work & Business"
  },
  {
    word: "promotion",
    ipa: "/prəˈmoʊ.ʃən/",
    definitionEn: "Activity that supports or provides active encouragement for the furtherance of a cause, venture, or aim.",
    definitionVi: "thăng chức; khuyến mãi",
    examples: [
      { en: "Congratulations on your promotion!", vi: "Chúc mừng bạn được thăng chức!" },
      { en: "He hopes to get a promotion soon.", vi: "Anh ấy hy vọng sớm được thăng chức." },
      { en: "The store is having a sales promotion.", vi: "Cửa hàng đang có chương trình khuyến mãi bán hàng." }
    ],
    wordForms: { noun: "promotion / promoter", verb: "promote", adjective: "promotional" },
    topic: "Work & Business"
  },
  {
    word: "feedback",
    ipa: "/ˈfiːd.bæk/",
    definitionEn: "Information about reactions to a product, a person's performance of a task, etc.",
    definitionVi: "phản hồi, ý kiến đóng góp",
    examples: [
      { en: "I appreciate your positive feedback.", vi: "Tôi đánh giá cao phản hồi tích cực của bạn." },
      { en: "Please give me some feedback on my report.", vi: "Vui lòng cho tôi vài ý kiến về báo cáo của tôi." },
      { en: "Customer feedback is very important.", vi: "Phản hồi của khách hàng rất quan trọng." }
    ],
    wordForms: { noun: "feedback" },
    topic: "Work & Business"
  },
  {
    word: "asset",
    definitionEn: "A useful or valuable thing, person, or quality.",
    definitionVi: "tài sản",
    examples: [{ en: "She is a great asset to the team.", vi: "Cô ấy là tài sản lớn của đội." }],
    wordForms: { noun: "asset" },
    topic: "Work & Business"
  },
  {
    word: "career",
    definitionEn: "An occupation undertaken for a significant period of a person's life.",
    definitionVi: "sự nghiệp",
    examples: [{ en: "He has a successful career.", vi: "Anh ấy có một sự nghiệp thành công." }],
    wordForms: { noun: "career" },
    topic: "Work & Business"
  },

  // === SLANG ===
  {
    word: "lit",
    ipa: "/lɪt/",
    definitionEn: "Excellent, exciting, or fun.",
    definitionVi: "tuyệt vời, sôi động, 'cháy'",
    examples: [
      { en: "Last night's party was lit!", vi: "Bữa tiệc tối qua cháy quá!" },
      { en: "The concert was absolutely lit.", vi: "Buổi hòa nhạc thực sự rất tuyệt vời." },
      { en: "Everyone says the new club is lit.", vi: "Mọi người nói câu lạc bộ mới rất sôi động." }
    ],
    wordForms: { adjective: "lit" },
    topic: "Slang"
  },
  {
    word: "goat",
    ipa: "/ɡoʊt/",
    definitionEn: "Greatest of All Time.",
    definitionVi: "vĩ đại nhất mọi thời đại (viết tắt của G.O.A.T)",
    examples: [
      { en: "Messi is the GOAT of football.", vi: "Messi là huyền thoại vĩ đại nhất của bóng đá." },
      { en: "Who do you think is the GOAT rapper?", vi: "Bạn nghĩ ai là rapper vĩ đại nhất?" },
      { en: "She is the GOAT in tennis.", vi: "Cô ấy là huyền thoại trong quần vợt." }
    ],
    wordForms: { noun: "GOAT" },
    topic: "Slang"
  },
  {
    word: "salty",
    ipa: "/ˈsɑːl.ti/",
    definitionEn: "Being upset, angry, or bitter.",
    definitionVi: "cay cú, khó chịu, ghen tị",
    examples: [
      { en: "Don't be salty just because you lost.", vi: "Đừng cay cú chỉ vì bạn thua." },
      { en: "He was salty about not getting invited.", vi: "Anh ấy khó chịu vì không được mời." },
      { en: "Why are you so salty today?", vi: "Sao hôm nay bạn gắt gỏng thế?" }
    ],
    wordForms: { noun: "salt", adjective: "salty" },
    topic: "Slang"
  },
  {
    word: "ghost",
    ipa: "/ɡoʊst/",
    definitionEn: "To suddenly end communication with someone without explanation.",
    definitionVi: "ngó lơ, biến mất không lý do (trong hẹn hò/giao tiếp)",
    examples: [
      { en: "I think he is ghosting me.", vi: "Tôi nghĩ anh ta đang ngó lơ tôi." },
      { en: "She ghosted him after the first date.", vi: "Cô ấy đã lặn mất tăm sau buổi hẹn đầu tiên." },
      { en: "Don't ghost your friends.", vi: "Đừng có ngó lơ bạn bè của mình." }
    ],
    wordForms: { noun: "ghost", verb: "ghost", adjective: "ghosted" },
    topic: "Slang"
  },
  {
    word: "flex",
    ipa: "/fleks/",
    definitionEn: "To show off or boast.",
    definitionVi: "khoe khoang",
    examples: [
      { en: "Stop flexing your new watch.", vi: "Thôi khoe cái đồng hồ mới của bạn đi." },
      { en: "Weird flex but okay.", vi: "Khoe mẽ lạ đấy nhưng cũng được." },
      { en: "He likes to flex his muscles.", vi: "Anh ấy thích khoe cơ bắp." }
    ],
    wordForms: { noun: "flex", verb: "flex" },
    topic: "Slang"
  },
  {
    word: "slay",
    ipa: "/sleɪ/",
    definitionEn: "To do something exceptionally well.",
    definitionVi: "làm xuất sắc, 'đỉnh của chóp'",
    examples: [
      { en: "You slay that outfit!", vi: "Bạn mặc bộ đó đỉnh quá!" },
      { en: "She slays every performance.", vi: "Cô ấy diễn màn nào cũng xuất sắc." },
      { en: "Slay queen!", vi: "Đỉnh lắm nữ hoàng ơi!" }
    ],
    wordForms: { verb: "slay", adjective: "slaying" },
    topic: "Slang"
  },
  {
    word: "tea",
    ipa: "/tiː/",
    definitionEn: "Gossip or personal information.",
    definitionVi: "chuyện phiếm, tin đồn (drama)",
    examples: [
      { en: "What's the tea?", vi: "Có biến gì không?" },
      { en: "Spill the tea, I want to know everything.", vi: "Kể chuyện phiếm đi, tôi muốn biết mọi thứ." },
      { en: "That is some hot tea.", vi: "Tin đó sốt dẻo đấy." }
    ],
    wordForms: { noun: "tea" },
    topic: "Slang"
  },
  {
    word: "cap",
    ipa: "/kæp/",
    definitionEn: "Lie or exaggeration.",
    definitionVi: "nói dối, chém gió (thường dùng 'no cap' là nói thật)",
    examples: [
      { en: "That's cap.", vi: "Chém gió đấy." },
      { en: "No cap, I saw him there.", vi: "Nói thật đấy, tôi thấy anh ta ở đó." },
      { en: "Stop capping.", vi: "Thôi bốc phét đi." }
    ],
    wordForms: { noun: "cap", verb: "cap", adjective: "capping" },
    topic: "Slang"
  },
  {
    word: "sus",
    ipa: "/sʌs/",
    definitionEn: "Suspicious or shady.",
    definitionVi: "đáng ngờ (viết tắt của suspicious)",
    examples: [
      { en: "That guy looks sus.", vi: "Gã kia trông đáng ngờ lắm." },
      { en: "You're acting very sus.", vi: "Bạn đang hành động rất khả nghi." },
      { en: "The whole situation seems sus.", vi: "Cả tình huống này có vẻ mờ ám." }
    ],
    wordForms: { adjective: "sus" },
    topic: "Slang"
  },
  {
    word: "vibes",
    ipa: "/vaɪbz/",
    definitionEn: "Emotional atmosphere or feeling.",
    definitionVi: "tâm trạng, không khí, năng lượng",
    examples: [
      { en: "Good vibes only.", vi: "Chỉ nhận năng lượng tích cực." },
      { en: "I like the vibes of this cafe.", vi: "Tôi thích không khí của quán cà phê này." },
      { en: "He gives off bad vibes.", vi: "Anh ta tỏa ra năng lượng tiêu cực." }
    ],
    wordForms: { noun: "vibe", verb: "vibe", adjective: "vibing" },
    topic: "Slang"
  },
  {
    word: "shook",
    definitionEn: "Surprised, shocked, or scared.",
    definitionVi: "bàng hoàng, sốc",
    examples: [{ en: "I was shook by the news.", vi: "Tôi sốc trước tin tức đó." }],
    wordForms: { adjective: "shook" },
    topic: "Slang"
  }
];
