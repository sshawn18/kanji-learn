export interface AssessmentQuestion {
  id: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  kanjiId: string;
  character: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 3 N5 questions
  {
    id: "aq-n5-1",
    level: "N5",
    kanjiId: "n5-000",
    character: "日",
    question: "What does 日 mean?",
    options: ["day / sun", "moon / month", "fire", "water"],
    correctIndex: 0,
  },
  {
    id: "aq-n5-2",
    level: "N5",
    kanjiId: "n5-006",
    character: "山",
    question: "What does 山 mean?",
    options: ["river", "mountain", "forest", "sea"],
    correctIndex: 1,
  },
  {
    id: "aq-n5-3",
    level: "N5",
    kanjiId: "n5-003",
    character: "人",
    question: "What does 人 mean?",
    options: ["animal", "tree", "person", "house"],
    correctIndex: 2,
  },
  // 3 N4 questions
  {
    id: "aq-n4-1",
    level: "N4",
    kanjiId: "n4-000",
    character: "悪",
    question: "What does 悪 mean?",
    options: ["good", "bad / evil", "strange", "busy"],
    correctIndex: 1,
  },
  {
    id: "aq-n4-2",
    level: "N4",
    kanjiId: "n4-025",
    character: "急",
    question: "What does 急 mean?",
    options: ["slow", "happy", "urgent / sudden", "quiet"],
    correctIndex: 2,
  },
  {
    id: "aq-n4-3",
    level: "N4",
    kanjiId: "n4-100",
    character: "病",
    question: "What does 病 mean?",
    options: ["healthy", "doctor", "illness / disease", "medicine"],
    correctIndex: 2,
  },
  // 3 N3 questions
  {
    id: "aq-n3-1",
    level: "N3",
    kanjiId: "n3-000",
    character: "愛",
    question: "What does 愛 mean?",
    options: ["hate", "love / affection", "friend", "enemy"],
    correctIndex: 1,
  },
  {
    id: "aq-n3-2",
    level: "N3",
    kanjiId: "n3-028",
    character: "危",
    question: "What does 危 mean?",
    options: ["safe", "fast", "dangerous", "weak"],
    correctIndex: 2,
  },
  {
    id: "aq-n3-3",
    level: "N3",
    kanjiId: "n3-045",
    character: "権",
    question: "What does 権 mean?",
    options: ["duty", "rights / authority", "knowledge", "skill"],
    correctIndex: 1,
  },
  // 3 N2 questions
  {
    id: "aq-n2-1",
    level: "N2",
    kanjiId: "n2-000",
    character: "監",
    question: "What does 監 mean?",
    options: ["observe", "supervise / oversee", "hide", "ignore"],
    correctIndex: 1,
  },
  {
    id: "aq-n2-2",
    level: "N2",
    kanjiId: "n2-045",
    character: "緊",
    question: "What does 緊 mean?",
    options: ["loose", "tense / tight", "smooth", "broken"],
    correctIndex: 1,
  },
  {
    id: "aq-n2-3",
    level: "N2",
    kanjiId: "n2-051",
    character: "謙",
    question: "What does 謙 mean?",
    options: ["arrogant", "modest / humble", "angry", "proud"],
    correctIndex: 1,
  },
  // 3 N1 questions
  {
    id: "aq-n1-1",
    level: "N1",
    kanjiId: "n1-001",
    character: "哀",
    question: "What does 哀 mean?",
    options: ["joy", "anger", "sorrow / grief", "surprise"],
    correctIndex: 2,
  },
  {
    id: "aq-n1-2",
    level: "N1",
    kanjiId: "n1-108",
    character: "藩",
    question: "What does 藩 mean?",
    options: ["temple", "feudal domain / clan", "castle", "market"],
    correctIndex: 1,
  },
  {
    id: "aq-n1-3",
    level: "N1",
    kanjiId: "n1-121",
    character: "羅",
    question: "What does 羅 mean?",
    options: ["silk / gauze / arrange", "stone", "iron", "wood"],
    correctIndex: 0,
  },
];
