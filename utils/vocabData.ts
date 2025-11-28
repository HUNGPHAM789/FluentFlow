// --- utils/vocabData.ts ---

// Pre-generated vocabulary lists (approx 50 words per topic) to ensure variety
// and prevent the AI from defaulting to generic "Vocabulary Word" definitions.

export const TOPIC_VOCAB_LISTS: Record<string, string[]> = {
  "Daily Life": [
    "Groceries", "Commute", "Chore", "Budget", "Recipe", "Wardrobe", "Appliance", "Maintenance", "Schedule", "Errand",
    "Leisure", "Hobbies", "Neighbor", "District", "Utility", "Subscription", "Refund", "Delivery", "Parcel", "Appointment",
    "Reservation", "Leftovers", "Ingredient", "Nutrition", "Diet", "Exercise", "Routine", "Alarm", "Snooze", "Insomnia",
    "Nap", "Shower", "Hygiene", "Grooming", "Outfit", "Accessory", "Umbrella", "Raincoat", "Commuter", "Traffic",
    "Detour", "Shortcut", "Landmark", "Pedestrian", "Sidewalk", "Crosswalk", "Intersection", "Roundabout", "Parking", "Ticket"
  ],
  "Work & Business": [
    "Agenda", "Deadline", "Proposal", "Negotiation", "Stakeholder", "Revenue", "Profit", "Margin", "Forecast", "Budget",
    "Audit", "Invoice", "Receipt", "Transaction", "Client", "Customer", "Vendor", "Supplier", "Partner", "Colleague",
    "Supervisor", "Manager", "Executive", "CEO", "Strategy", "Tactic", "Objective", "Key Result", "Performance", "Evaluation",
    "Promotion", "Raise", "Bonus", "Salary", "Wages", "Benefits", "Insurance", "Policy", "Regulation", "Compliance",
    "Contract", "Clause", "Agreement", "Signature", "Merger", "Acquisition", "Bankruptcy", "Insolvency", "Investment", "Dividend"
  ],
  "Travel": [
    "Itinerary", "Passport", "Visa", "Embassy", "Consulate", "Customs", "Immigration", "Boarding", "Departure", "Arrival",
    "Terminal", "Gate", "Luggage", "Baggage", "Carousel", "Carry-on", "Check-in", "Upgrade", "Economy", "Business Class",
    "Aisle", "Window Seat", "Turbulence", "Cockpit", "Crew", "Stewardess", "Pilot", "Layover", "Stopover", "Jetlag",
    "Accommodation", "Hostel", "Hotel", "Resort", "Suite", "Reservation", "Booking", "Cancellation", "Refund", "Excursion",
    "Tour", "Guide", "Souvenir", "Currency", "Exchange Rate", "ATM", "Map", "Navigation", "Delay", "Shuttle"
  ],
  "Academic": [
    "Thesis", "Dissertation", "Hypothesis", "Theory", "Methodology", "Analysis", "Synthesis", "Abstract", "Introduction", "Conclusion",
    "Bibliography", "Citation", "Reference", "Plagiarism", "Peer Review", "Journal", "Article", "Publication", "Research", "Experiment",
    "Lab", "Data", "Statistics", "Variable", "Correlation", "Causation", "Survey", "Questionnaire", "Interview", "Observation",
    "Lecture", "Seminar", "Workshop", "Symposium", "Conference", "Campus", "Faculty", "Department", "Dean", "Professor",
    "Scholarship", "Tuition", "Grant", "Funding", "Enrollment", "Syllabus", "Curriculum", "Prerequisite", "Transcript", "Degree"
  ],
  "Technology": [
    "Algorithm", "Database", "Server", "Cloud", "Network", "Bandwidth", "Latency", "Encryption", "Decryption", "Firewall",
    "Malware", "Virus", "Phishing", "Hacker", "Cybersecurity", "Artificial Intelligence", "Machine Learning", "Neural Network", "Blockchain", "Cryptocurrency",
    "Bitcoin", "Ethereum", "Wallet", "Interface", "User Experience", "User Interface", "Frontend", "Backend", "Fullstack", "API",
    "SDK", "Framework", "Library", "Repository", "Commit", "Push", "Pull", "Merge", "Branch", "Debug",
    "Compiler", "Interpreter", "Syntax", "Variable", "Function", "Class", "Object", "Inheritance", "Polymorphism", "Encapsulation"
  ],
  "Socializing": [
    "Acquaintance", "Friend", "Bestie", "Colleague", "Peer", "Mentor", "Mentee", "Networking", "Event", "Party",
    "Gathering", "Reunion", "Celebration", "Anniversary", "Birthday", "Wedding", "Funeral", "Ceremony", "Ritual", "Tradition",
    "Custom", "Etiquette", "Manners", "Politeness", "Rudeness", "Gossip", "Rumor", "Scandal", "Conflict", "Resolution",
    "Compromise", "Negotiation", "Agreement", "Disagreement", "Argument", "Debate", "Discussion", "Conversation", "Chat", "Small Talk",
    "Icebreaker", "Introvert", "Extrovert", "Ambivert", "Personality", "Character", "Trait", "Behavior", "Attitude", "Emotion"
  ],
  "Health": [
    "Symptom", "Diagnosis", "Prognosis", "Prescription", "Medication", "Dosage", "Side Effect", "Therapy", "Treatment", "Cure",
    "Vaccine", "Immunity", "Infection", "Virus", "Bacteria", "Disease", "Illness", "Sickness", "Ailment", "Condition",
    "Disorder", "Syndrome", "Injury", "Wound", "Fracture", "Sprain", "Strain", "Bruise", "Scar", "Surgery",
    "Operation", "Anesthesia", "Recovery", "Rehab", "Physiotherapy", "Checkup", "Examination", "Screening", "Test", "X-ray",
    "MRI", "CT Scan", "Ultrasound", "Blood Pressure", "Pulse", "Heart Rate", "Cholesterol", "Diabetes", "Obesity", "Nutrition"
  ],
  "Art & Culture": [
    "Aesthetic", "Abstract", "Surrealism", "Realism", "Impressionism", "Expressionism", "Cubism", "Renaissance", "Baroque", "Rococo",
    "Gothic", "Modernism", "Postmodernism", "Contemporary", "Medium", "Canvas", "Palette", "Brush", "Stroke", "Texture",
    "Composition", "Perspective", "Foreground", "Background", "Subject", "Portrait", "Landscape", "Still Life", "Sculpture", "Statue",
    "Monument", "Architecture", "Design", "Fashion", "Trend", "Style", "Genre", "Literature", "Poetry", "Prose",
    "Novel", "Fiction", "Non-fiction", "Biography", "Autobiography", "Memoir", "Cinema", "Film", "Movie", "Director"
  ],
  "Slang": [
    "Lit", "Fam", "Goat", "Tea", "Shade", "Flex", "Simp", "Stan", "Cap", "No Cap",
    "Bet", "Yeet", "Mood", "Vibe", "Slay", "Woke", "Salty", "Shook", "Extra", "Basic",
    "Karen", "Boomer", "Zoomer", "Ghosting", "Catfishing", "Clout", "Drip", "Fire", "Gucci", "Highkey",
    "Lowkey", "Periodt", "Receipts", "Savage", "Shipping", "Snatch", "Squad", "Sus", "Thirsty", "W",
    "L", "Yolo", "FOMO", "JOMO", "Banger", "Slaps", "Cringe", "Ratio", "Based", "Mid"
  ],
  "IELTS": [
    "Ameliorate", "Ambiguous", "Anomaly", "Antithesis", "Arbitrary", "Arduous", "Articulate", "Assiduous", "Astute", "Attenuate",
    "Audacious", "Augment", "Austere", "Authentic", "Autonomy", "Aversion", "Banal", "Benign", "Bias", "Brevity",
    "Candid", "Capricious", "Catalyst", "Caustic", "Censure", "Chronic", "Circumspect", "Clandestine", "Coalesce", "Coerce",
    "Cognizant", "Coherent", "Colloquial", "Commensurate", "Compelling", "Complacent", "Compliant", "Comprehensive", "Conciliatory", "Concise",
    "Condone", "Conducive", "Confluence", "Congenial", "Conjecture", "Consensus", "Conspicuous", "Constrain", "Contemplate", "Contend"
  ],
  "IELTS Speaking Part 2": [
    "Memorable", "Achievement", "Adventure", "Challenge", "Influence", "Inspiration", "Journey", "Skill", "Habit", "Tradition",
    "Festival", "Occasion", "Gift", "Possession", "Device", "Application", "Website", "Book", "Movie", "Song",
    "Artist", "Leader", "Teacher", "Friend", "Family", "Neighbor", "Celebrity", "Place", "City", "Country",
    "Building", "Park", "Garden", "Restaurant", "Cafe", "Shop", "Market", "Event", "Concert", "Match",
    "Competition", "Game", "Hobby", "Sport", "Activity", "Experience", "Memory", "Childhood", "Education", "Job"
  ],
  "Role Play": [
    "Apologize", "Suggest", "Recommend", "Insist", "Refuse", "Accept", "Decline", "Invite", "Request", "Offer",
    "Complain", "Explain", "Describe", "Clarify", "Confirm", "Deny", "Admit", "Agree", "Disagree", "Negotiate",
    "Persuade", "Convince", "Encourage", "Discourage", "Warn", "Advise", "Consult", "Discuss", "Debate", "Argue",
    "Interrupt", "Resume", "Conclude", "Summarize", "Repeat", "Rephrase", "Elaborate", "Mention", "State", "Claim",
    "Question", "Answer", "Reply", "Respond", "Comment", "Remark", "Observe", "Notice", "Ignore", "Acknowledge"
  ],
  "Fun": [
    "Bamboozle", "Flabbergasted", "Discombobulated", "Shenanigans", "Malarkey", "Kerfuffle", "Skedaddle", "Canoodle", "Lollygag", "Hoodwink",
    "Gobbledygook", "Hullabaloo", "Ruckus", "Brouhaha", "Nincompoop", "Doohickey", "Thingamajig", "Whatchamacallit", "Gizmo", "Gadget",
    "Contraption", "Conundrum", "Dilemma", "Paradox", "Enigma", "Mystery", "Puzzle", "Riddle", "Joke", "Pun",
    "Sarcasm", "Irony", "Satire", "Parody", "Comedy", "Humor", "Laughter", "Giggle", "Chuckle", "Guffaw",
    "Smirk", "Grin", "Smile", "Joy", "Happiness", "Delight", "Bliss", "Euphoria", "Ecstasy", "Serendipity"
  ]
};