// ─── 听力训练数据 ───────────────────────────────────────────────
export const listeningLessons = [
  {
    id: '1',
    title: 'Coffee Shop Order',
    level: 'Beginner',
    duration: '2:30',
    topic: 'Daily Life',
    speed: 0.85,
    transcript: [
      { time: 0, text: "Hi there! Welcome to Brew & Bean. What can I get for you today?" },
      { time: 4, text: "Um, I'd like a medium latte, please. Can I get oat milk instead of regular?" },
      { time: 9, text: "Of course! One medium oat milk latte. Would you like any flavor shots?" },
      { time: 14, text: "Yes, vanilla please. And can I also get a blueberry muffin?" },
      { time: 19, text: "Great choice! That'll be seven fifty. Name for the order?" },
    ],
    keywords: ['latte', 'oat milk', 'vanilla', 'muffin'],
    questions: [
      { q: "What drink did the customer order?", options: ["Cappuccino", "Latte", "Americano", "Espresso"], answer: 1 },
      { q: "What milk did they request?", options: ["Soy milk", "Almond milk", "Oat milk", "Skim milk"], answer: 2 },
    ],
  },
  {
    id: '2',
    title: 'Job Interview',
    level: 'Intermediate',
    duration: '3:45',
    topic: 'Workplace',
    speed: 1.0,
    transcript: [
      { time: 0, text: "Good morning! Please have a seat. I'm Sarah, the hiring manager." },
      { time: 5, text: "Good morning, Sarah. Thank you for having me. I'm really excited about this opportunity." },
      { time: 11, text: "Tell me a bit about yourself and why you're interested in this role." },
      { time: 16, text: "Sure! I've been working in product design for about five years, mostly in fintech startups." },
      { time: 22, text: "That's impressive. What would you say is your greatest strength?" },
    ],
    keywords: ['hiring manager', 'opportunity', 'product design', 'fintech', 'strength'],
    questions: [
      { q: "What is Sarah's role?", options: ["CEO", "Hiring Manager", "Team Lead", "Recruiter"], answer: 1 },
      { q: "How many years of experience does the candidate have?", options: ["3 years", "4 years", "5 years", "6 years"], answer: 2 },
    ],
  },
  {
    id: '3',
    title: 'Airport Check-in',
    level: 'Intermediate',
    duration: '3:10',
    topic: 'Travel',
    speed: 1.0,
    transcript: [
      { time: 0, text: "Next please! Good afternoon, may I see your passport and booking confirmation?" },
      { time: 6, text: "Here you go. I also have a checked bag, is that okay?" },
      { time: 10, text: "Absolutely. Could you place your bag on the scale? It's 23 kilos, which is within the limit." },
      { time: 16, text: "Great. Would you prefer a window or aisle seat?" },
      { time: 20, text: "Aisle please, I have a long flight ahead." },
    ],
    keywords: ['passport', 'checked bag', 'scale', 'window', 'aisle'],
    questions: [
      { q: "How heavy was the bag?", options: ["20 kg", "21 kg", "23 kg", "25 kg"], answer: 2 },
      { q: "What seat did the passenger choose?", options: ["Window", "Middle", "Aisle", "Exit row"], answer: 2 },
    ],
  },
  {
    id: '4',
    title: 'Tech Team Meeting',
    level: 'Advanced',
    duration: '4:20',
    topic: 'Workplace',
    speed: 1.1,
    transcript: [
      { time: 0, text: "Alright everyone, let's kick off. We need to discuss the Q3 roadmap priorities." },
      { time: 6, text: "I think we should push the API refactor to Q4. The user-facing features are more urgent." },
      { time: 12, text: "I'd push back on that. The tech debt is slowing down every sprint we run." },
      { time: 18, text: "Fair point. Can we allocate maybe 20% of sprint capacity to the refactor?" },
      { time: 24, text: "That sounds like a reasonable compromise. Let's put it to a vote." },
    ],
    keywords: ['roadmap', 'API refactor', 'tech debt', 'sprint', 'capacity'],
    questions: [
      { q: "What is being discussed?", options: ["Budget", "Q3 roadmap", "Hiring plan", "Product launch"], answer: 1 },
      { q: "What percentage was proposed for the refactor?", options: ["10%", "15%", "20%", "25%"], answer: 2 },
    ],
  },
];

// ─── 口语对话场景数据 ────────────────────────────────────────────
export const conversationScenarios = [
  {
    id: '1',
    title: 'Ordering Coffee',
    icon: '☕',
    difficulty: 'Easy',
    estimatedTime: '5 min',
    description: 'Practice ordering drinks and food at a café',
    color: '#F59E0B',
    messages: [
      { role: 'ai', text: "Hi! Welcome to Brew & Bean. What can I get for you today?" },
      { role: 'user_hint', text: "Try: I'd like a large cappuccino, please." },
      { role: 'ai', text: "Great choice! Would you like any extra shots or flavors?" },
      { role: 'user_hint', text: "Try: Could I get an extra shot of espresso?" },
      { role: 'ai', text: "Of course! Anything else? We have fresh pastries today." },
    ],
  },
  {
    id: '2',
    title: 'Job Interview',
    icon: '💼',
    difficulty: 'Medium',
    estimatedTime: '10 min',
    description: 'Practice common interview questions and answers',
    color: '#4F46E5',
    messages: [
      { role: 'ai', text: "Good morning! Please have a seat. Can you start by telling me about yourself?" },
      { role: 'user_hint', text: "Try: I have X years of experience in..." },
      { role: 'ai', text: "Interesting! What would you say is your biggest professional achievement?" },
      { role: 'user_hint', text: "Try: I'm most proud of when I..." },
      { role: 'ai', text: "That's impressive. Where do you see yourself in five years?" },
    ],
  },
  {
    id: '3',
    title: 'Hotel Check-in',
    icon: '🏨',
    difficulty: 'Easy',
    estimatedTime: '5 min',
    description: 'Check in to a hotel and ask about amenities',
    color: '#10B981',
    messages: [
      { role: 'ai', text: "Good evening! Welcome to the Grand Hotel. Do you have a reservation?" },
      { role: 'user_hint', text: "Try: Yes, I have a booking under the name..." },
      { role: 'ai', text: "Perfect! I have your room ready. Would you prefer a high floor?" },
      { role: 'user_hint', text: "Try: Yes please, and does the room have a city view?" },
      { role: 'ai', text: "Absolutely! Breakfast is served from 7 to 10 AM. Is there anything else?" },
    ],
  },
  {
    id: '4',
    title: 'Doctor Appointment',
    icon: '🏥',
    difficulty: 'Medium',
    estimatedTime: '8 min',
    description: 'Describe symptoms and understand medical advice',
    color: '#EF4444',
    messages: [
      { role: 'ai', text: "Hello! I'm Dr. Chen. What brings you in today?" },
      { role: 'user_hint', text: "Try: I've been having a headache for the past few days..." },
      { role: 'ai', text: "I see. On a scale of 1 to 10, how would you rate the pain?" },
      { role: 'user_hint', text: "Try: I'd say about a 6. It gets worse in the evening." },
      { role: 'ai', text: "Have you taken any medication for it?" },
    ],
  },
  {
    id: '5',
    title: 'Team Standup',
    icon: '📊',
    difficulty: 'Hard',
    estimatedTime: '10 min',
    description: 'Report your work progress in a team meeting',
    color: '#7C3AED',
    messages: [
      { role: 'ai', text: "Good morning team! Let's start the standup. What did you work on yesterday?" },
      { role: 'user_hint', text: "Try: Yesterday I finished the user authentication module..." },
      { role: 'ai', text: "Nice progress! Any blockers or dependencies you need help with?" },
      { role: 'user_hint', text: "Try: I'm waiting on the API spec from the backend team." },
      { role: 'ai', text: "Got it. What's your plan for today?" },
    ],
  },
];

// ─── 发音练习数据 ────────────────────────────────────────────────
export const pronunciationExercises = [
  {
    id: '1',
    category: 'Consonants',
    title: 'TH Sound',
    icon: '👅',
    description: 'Master the tricky "th" sound',
    tip: 'Place your tongue lightly between your teeth and blow air through.',
    words: [
      { word: 'think', phonetic: '/θɪŋk/', difficulty: 1 },
      { word: 'this', phonetic: '/ðɪs/', difficulty: 1 },
      { word: 'three', phonetic: '/θriː/', difficulty: 2 },
      { word: 'breathe', phonetic: '/briːð/', difficulty: 2 },
      { word: 'throughout', phonetic: '/θruːˈaʊt/', difficulty: 3 },
    ],
    sentences: [
      "I think this is the right thing to do.",
      "Three thousand people gathered there.",
      "She breathes through her nose throughout the night.",
    ],
  },
  {
    id: '2',
    category: 'Vowels',
    title: 'Short vs Long Vowels',
    icon: '🔤',
    description: 'Distinguish short and long vowel sounds',
    tip: 'Long vowels "say their name" — hold them slightly longer.',
    words: [
      { word: 'bit / beat', phonetic: '/bɪt/ vs /biːt/', difficulty: 1 },
      { word: 'sit / seat', phonetic: '/sɪt/ vs /siːt/', difficulty: 1 },
      { word: 'full / fool', phonetic: '/fʊl/ vs /fuːl/', difficulty: 2 },
      { word: 'pull / pool', phonetic: '/pʊl/ vs /puːl/', difficulty: 2 },
    ],
    sentences: [
      "Please take a seat, I'll be back in a bit.",
      "The fool tried to pull the full cart.",
    ],
  },
  {
    id: '3',
    category: 'Connected Speech',
    title: 'Linking & Reduction',
    icon: '🔗',
    description: 'Sound natural with connected speech patterns',
    tip: 'In natural speech, words blend together. "want to" becomes "wanna".',
    words: [
      { word: 'want to → wanna', phonetic: '/ˈwɒnə/', difficulty: 2 },
      { word: 'going to → gonna', phonetic: '/ˈɡɒnə/', difficulty: 2 },
      { word: 'have to → hafta', phonetic: '/ˈhæftə/', difficulty: 2 },
      { word: 'kind of → kinda', phonetic: '/ˈkaɪndə/', difficulty: 3 },
      { word: 'out of → outta', phonetic: '/ˈaʊtə/', difficulty: 3 },
    ],
    sentences: [
      "I wanna go, but I hafta finish this first.",
      "She's gonna be kinda late, I think.",
      "We're outta time, let's wrap up.",
    ],
  },
  {
    id: '4',
    category: 'Stress & Rhythm',
    title: 'Word Stress',
    icon: '🎵',
    description: 'Put stress on the right syllable',
    tip: 'Stressed syllables are louder, longer, and higher in pitch.',
    words: [
      { word: 'phoTOgraphy', phonetic: '/fəˈtɒɡrəfi/', difficulty: 2 },
      { word: 'PHOtograph', phonetic: '/ˈfəʊtəɡrɑːf/', difficulty: 2 },
      { word: 'ecoNOmy', phonetic: '/ɪˈkɒnəmi/', difficulty: 3 },
      { word: 'EConomic', phonetic: '/ˌiːkəˈnɒmɪk/', difficulty: 3 },
    ],
    sentences: [
      "The PHOtograph shows her phoTOgraphy skills.",
      "The EConomic impact on the ecoNOmy was huge.",
    ],
  },
];

// ─── 用户进度数据（Mock）────────────────────────────────────────
export const userProgress = {
  name: 'Alex',
  level: 'Intermediate',
  streak: 7,
  totalMinutes: 342,
  weeklyGoal: 5, // days per week
  weeklyCompleted: 4,
  stats: {
    listeningScore: 68,
    speakingScore: 54,
    pronunciationScore: 72,
    vocabularyScore: 81,
  },
  recentActivity: [
    { date: '2026-05-06', minutes: 18, type: 'speaking' },
    { date: '2026-05-05', minutes: 22, type: 'listening' },
    { date: '2026-05-04', minutes: 15, type: 'pronunciation' },
    { date: '2026-05-03', minutes: 20, type: 'speaking' },
    { date: '2026-05-02', minutes: 0, type: 'none' },
    { date: '2026-05-01', minutes: 25, type: 'listening' },
    { date: '2026-04-30', minutes: 19, type: 'pronunciation' },
  ],
  badges: [
    { id: '1', name: '7-Day Streak', icon: '🔥', earned: true },
    { id: '2', name: 'First Conversation', icon: '💬', earned: true },
    { id: '3', name: 'Pronunciation Pro', icon: '🎤', earned: false },
    { id: '4', name: '10 Hours Listened', icon: '🎧', earned: true },
    { id: '5', name: 'Speed Demon', icon: '⚡', earned: false },
    { id: '6', name: '30-Day Streak', icon: '🏆', earned: false },
  ],
};

// ─── 每日任务 ────────────────────────────────────────────────────
export const dailyTasks = [
  { id: '1', type: 'listening', title: 'Listen & Comprehend', subtitle: 'Coffee Shop Order', duration: 5, completed: true, icon: '🎧' },
  { id: '2', type: 'speaking', title: 'AI Conversation', subtitle: 'Job Interview Practice', duration: 7, completed: false, icon: '💬' },
  { id: '3', type: 'pronunciation', title: 'Pronunciation Drill', subtitle: 'TH Sound Mastery', duration: 3, completed: false, icon: '🎤' },
];
