export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone?: string;
  provider?: 'google' | 'phone' | 'email' | 'guest';
  role: 'student' | 'lecturer' | 'moderator' | 'guest';
  university?: string;
  isGuest?: boolean;
}

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Khách truy cập',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  email: '',
  role: 'guest',
  provider: 'guest',
  university: 'Chưa đăng nhập',
  isGuest: true,
};

export interface ChapterInfo {
  id: number;
  title: string;
  pdfPath?: string;
  description: string;
  sections: {
    id: string;
    title: string;
    keyFormulas: string[];
    content: string;
    examples: {
      problem: string;
      solution: string;
      tips?: string;
    }[];
  }[];
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'student' | 'lecturer' | 'moderator';
  chapterId?: number;
  chapterTitle?: string;
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  reactions: { [key: string]: number }; // e.g. { 'like': 4, 'helpful': 2 }
  userReactions: { [userId: string]: string }; // userId -> reactionType
  commentsCount: number;
  isVerifiedAnswer?: boolean;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'student' | 'lecturer' | 'moderator';
  content: string;
  createdAt: string;
  isLecturerVerified?: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  history: string[]; // List of YYYY-MM-DD
}

export interface StudyActivity {
  id: string;
  userId: string;
  type: 'quiz' | 'exam' | 'challenge' | 'lab_task' | 'ai_tutor_session' | 'assignment';
  title: string;
  score: number;
  maxScore: number;
  completedAt: string; // ISO string
}

export interface RoadmapTask {
  id: string;
  chapterId: number;
  title: string;
  reason: string;
  expectedOutcome: string;
  estimatedMinutes: number;
  suggestedAction: 'review_concept' | 'practice_formula' | 'solve_problems' | 'lab_experiment';
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface WeeklyChallengeItem {
  id: string;
  weekNumber: number;
  title: string;
  businessScenario: string;
  startDate: string;
  endDate: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  durationMinutes: number;
  questions: {
    id: string;
    text: string;
    options: string[];
    explanation: string;
  }[];
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  durationSeconds: number;
  completedAt: string;
}

export interface AIReportTicket {
  id: string;
  userId: string;
  userName: string;
  questionContext: string;
  aiResponse: string;
  userComplaint: string;
  reportCategory: 'Sai công thức' | 'Sai tính toán' | 'Vi phạm 4 bước sư phạm' | 'Khác';
  submittedAt: string;
  status: 'Đã tiếp nhận — Đang chờ máy chủ xác minh' | 'Đã xác minh (Đúng)' | 'Đã xác minh (Lỗi AI)';
  reviewNote?: string;
}
