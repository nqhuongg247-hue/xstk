import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { ForumPost, ForumComment, StreakData, StudyActivity, RoadmapTask, LeaderboardEntry, AIReportTicket } from './src/types';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// Initial server-side Google Gen AI client
const apiKey = process.env.GEMINI_API_KEY || '';
const isRealApiKey = apiKey && !apiKey.startsWith('MY_') && apiKey !== 'YOUR_API_KEY';
let aiClient: GoogleGenAI | null = null;

if (isRealApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Timeout helper for model generation
const generateWithTimeout = async (promise: Promise<any>, timeoutMs = 45000) => {
  let timer: any;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Yêu cầu Gemini vượt quá thời gian chờ (Timeout 45s).')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

// -------------------------------------------------------------
// IN-MEMORY / PERSISTENT SERVER-SIDE DATABASE FOR SHARED FEATURES
// (Persists during server lifecycle and shared across all connected clients)
// -------------------------------------------------------------

// 1. FORUM POSTS & COMMENTS
let forumPosts: ForumPost[] = [
  {
    id: 'post-1',
    authorId: 'user-lecturer-1',
    authorName: 'TS. Nguyễn Văn Tuấn (Giảng viên)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    authorRole: 'lecturer',
    chapterId: 1,
    chapterTitle: 'Chương 1: Biến cố ngẫu nhiên & Xác suất',
    title: 'Cách phân biệt xác suất có điều kiện P(A|B) và xác suất giao P(AB)',
    content: 'Nhiều bạn sinh viên khi giải bài tập thường nhầm lẫn giữa P(A|B) và P(AB). Lưu ý: P(AB) là xác suất cả 2 biến cố cùng xảy ra trên toàn bộ không gian mẫu Ω ban đầu. Trong khi P(A|B) là xác suất của A khi không gian mẫu đã bị thu hẹp chỉ còn trong phạm vi biến cố B. Công thức kết nối: P(AB) = P(B) * P(A|B).',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reactions: { like: 12, helpful: 8 },
    userReactions: { 'user-1': 'like' },
    commentsCount: 2,
    isVerifiedAnswer: true,
  },
  {
    id: 'post-2',
    authorId: 'user-student-2',
    authorName: 'Trần Thị Mai',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    authorRole: 'student',
    chapterId: 3,
    chapterTitle: 'Chương 3: Biến ngẫu nhiên liên tục',
    title: 'Hỏi về cách tra bảng phân phối chuẩn tắc Laplace Φ(z)',
    content: 'Cho mình hỏi khi giá trị z âm, ví dụ tính Φ(-1.96) thì làm thế nào khi bảng trong giáo trình chỉ in các giá trị z >= 0? Cảm ơn mọi người!',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    reactions: { like: 4, helpful: 3 },
    userReactions: {},
    commentsCount: 1,
  }
];

let forumComments: ForumComment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    authorId: 'user-student-1',
    authorName: 'Lê Hoàng Nam',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    authorRole: 'student',
    content: 'Dạ cảm ơn thầy ạ, nhờ ví dụ này em mới hiểu vì sao mẫu số của P(A|B) luôn là P(B).',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    isLecturerVerified: false,
  },
  {
    id: 'comm-2',
    postId: 'post-2',
    authorId: 'user-lecturer-1',
    authorName: 'TS. Nguyễn Văn Tuấn (Giảng viên)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    authorRole: 'lecturer',
    content: 'Chào bạn, do tính đối xứng của hàm mật độ phân phối chuẩn qua trục z = 0, ta luôn có công thức: Φ(-z) = 1 - Φ(z). Vì vậy Φ(-1.96) = 1 - Φ(1.96) = 1 - 0.9750 = 0.0250 nhé.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isLecturerVerified: true,
  }
];

// 2. STREAK DATA PER USER (Asia/Ho_Chi_Minh)
const getTodayVietnamDate = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

const getYesterdayVietnamDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

const streakStore: { [userId: string]: StreakData } = {
  'user-student-1': {
    currentStreak: 3,
    longestStreak: 7,
    lastStudyDate: getTodayVietnamDate(),
    history: [getYesterdayVietnamDate(), getTodayVietnamDate()],
  },
};

const userActivities: { [userId: string]: StudyActivity[] } = {
  'user-student-1': [
    {
      id: 'act-1',
      userId: 'user-student-1',
      type: 'quiz',
      title: 'Trắc nghiệm Chương 1: Quy tắc xác suất',
      score: 8.5,
      maxScore: 10,
      completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
};

// 3. PERSONALIZED ROADMAP
const userRoadmaps: { [userId: string]: RoadmapTask[] } = {
  'user-student-1': [
    {
      id: 'task-1',
      chapterId: 1,
      title: 'Nắm vững Công thức Bayes và Xác suất đầy đủ',
      reason: 'Ghi nhận 2 lần tính sai mẫu số trong các bài toán chẩn đoán y khoa và kiểm định chất lượng',
      expectedOutcome: 'Tự tin giải quyết dạng toán hệ biến cố đầy đủ và cập nhật xác suất hậu nghiệm',
      estimatedMinutes: 25,
      suggestedAction: 'practice_formula',
      priority: 'high',
      status: 'in_progress',
    },
    {
      id: 'task-2',
      chapterId: 2,
      title: 'Luyện tập Phân phối Nhị thức B(n, p)',
      reason: 'Củng cố kiến thức trước khi bước sang phân phối liên tục và định lý giới hạn trung tâm',
      expectedOutcome: 'Thuần thục tính kỳ vọng E(X)=np và phương sai np(1-p)',
      estimatedMinutes: 20,
      suggestedAction: 'solve_problems',
      priority: 'medium',
      status: 'completed',
    },
    {
      id: 'task-3',
      chapterId: 3,
      title: 'Thực nghiệm Phân phối Chuẩn trong Phòng thí nghiệm XSTK',
      reason: 'Trực quan hóa quy tắc 3-Sigma và tính diện tích dưới đường cong mật độ',
      expectedOutcome: 'Hiểu bản chất chuyển đổi Z = (X - μ) / σ',
      estimatedMinutes: 15,
      suggestedAction: 'lab_experiment',
      priority: 'high',
      status: 'not_started',
    },
    {
      id: 'task-4',
      chapterId: 5,
      title: 'Khoảng tin cậy cho tỷ lệ tổng thể p',
      reason: 'Chuẩn bị cho bài thi giữa kỳ và phân tích số liệu thực tiễn',
      expectedOutcome: 'Biết cách chọn giá trị tới hạn z_{α/2} và xác định kích thước mẫu n cần thiết',
      estimatedMinutes: 30,
      suggestedAction: 'review_concept',
      priority: 'low',
      status: 'not_started',
    },
  ],
};

// 4. WEEKLY CHALLENGE & LEADERBOARD
const currentWeeklyChallenge = {
  id: 'week-challenge-42',
  weekNumber: 42,
  title: 'Tối Ưu Hóa Chuỗi Cung Ứng & Kiểm Định Chất Lượng',
  businessScenario: 'Một doanh nghiệp sản xuất linh kiện vi điện tử nhập hàng từ 3 nhà cung ứng A, B, C với thị phần lần lượt là 45%, 35%, 20%. Tỷ lệ linh kiện đạt chuẩn quân sự của 3 nguồn tương ứng là 98%, 95%, 92%. Ban điều hành cần phân tích rủi ro và xác suất hậu nghiệm để quyết định phân bổ ngân sách.',
  startDate: '2026-10-19T00:00:00Z',
  endDate: '2026-10-26T23:59:59Z',
  difficulty: 'Trung bình' as const,
  durationMinutes: 15,
  questions: [
    {
      id: 'q1',
      text: 'Chọn ngẫu nhiên 1 linh kiện từ kho tổng, tính xác suất linh kiện này đạt chuẩn quân sự.',
      options: ['A. 0.9575 (95.75%)', 'B. 0.9635 (96.35%)', 'C. 0.9410 (94.10%)', 'D. 0.9720 (97.20%)'],
      correctIndex: 0, // 0.45*0.98 + 0.35*0.95 + 0.20*0.92 = 0.441 + 0.3325 + 0.184 = 0.9575
      explanation: 'Áp dụng công thức xác suất đầy đủ: P(Đạt) = 0.45*0.98 + 0.35*0.95 + 0.20*0.92 = 0.9575 (95.75%).',
    },
    {
      id: 'q2',
      text: 'Biết linh kiện được kiểm tra đạt chuẩn quân sự, xác suất linh kiện đó được cung ứng bởi nhà cung cấp A là bao nhiêu?',
      options: ['A. 0.4128', 'B. 0.4606', 'C. 0.4912', 'D. 0.5210'],
      correctIndex: 1, // 0.441 / 0.9575 = 0.46057
      explanation: 'Áp dụng công thức Bayes: P(A|Đạt) = (0.45 * 0.98) / 0.9575 = 0.441 / 0.9575 ≈ 0.4606 (46.06%).',
    },
    {
      id: 'q3',
      text: 'Nếu kiểm tra ngẫu nhiên 100 linh kiện từ nhà cung ứng B (tỷ lệ lỗi 5%), số linh kiện lỗi kỳ vọng E(X) và độ lệch chuẩn σ(X) là:',
      options: ['A. E=5, σ=2.18', 'B. E=5, σ=4.75', 'C. E=5, σ=2.50', 'D. E=10, σ=3.16'],
      correctIndex: 0, // np = 5, Var = 100*0.05*0.95 = 4.75 => sqrt(4.75) = 2.179
      explanation: 'Biến ngẫu nhiên X ~ B(100, 0.05). E(X) = np = 5. Var(X) = np(1-p) = 4.75 => σ(X) = √4.75 ≈ 2.18.',
    },
  ],
};

let weeklyLeaderboard: LeaderboardEntry[] = [
  {
    userId: 'user-top-1',
    displayName: 'Nguyễn Thành Trung',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    score: 100,
    durationSeconds: 184,
    completedAt: '2026-10-20T10:14:00Z',
  },
  {
    userId: 'user-top-2',
    displayName: 'Phạm Minh Trang',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    score: 100,
    durationSeconds: 245,
    completedAt: '2026-10-20T14:32:00Z',
  },
  {
    userId: 'user-student-1',
    displayName: 'Lê Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    score: 90,
    durationSeconds: 310,
    completedAt: '2026-10-20T16:20:00Z',
  },
];

// 5. AI ERROR REPORTS
let aiReports: AIReportTicket[] = [
  {
    id: 'REP-1042',
    userId: 'user-student-1',
    userName: 'Lê Hoàng Nam',
    questionContext: 'Tính phương sai mẫu s² cho tập dữ liệu {2, 4, 6}',
    aiResponse: 's² = [(2-4)² + (4-4)² + (6-4)²] / 3 = 8 / 3 = 2.67',
    userComplaint: 'AI dùng công thức chia cho n (3) thay vì phương sai mẫu hiệu chỉnh chia cho n-1 (2)',
    reportCategory: 'Sai công thức',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Đã xác minh (Lỗi AI)',
    reviewNote: 'Đã xác minh: Trong môn XSTK đại học, phương sai mẫu hiệu chỉnh s² bắt buộc chia cho n-1 = 2 để đảm bảo tính không chệch. Giá trị đúng phải là 4.0.',
  },
];

// -------------------------------------------------------------
// HELPER: GEMINI PROMPT GENERATION & LOCAL SMART FALLBACK
// -------------------------------------------------------------

const buildTutorSystemInstruction = (mode = 'standard') => {
  return `Bạn là Gia sư AI Xác suất & Thống kê (XSTK) thông minh, thân thiện và linh hoạt dành cho sinh viên đại học.
Bạn vừa là một chatbot Gemini trò chuyện tự nhiên, vừa là một chuyên gia sư phạm môn Xác suất & Thống kê.

QUY TẮC ĐỊNH DẠNG CÂU TRẢ LỜI BẮT BUỘC (MARKDOWN & LATEX CHUẨN MỰC):
1. Cấu trúc rõ ràng:
   - Mở đầu bằng câu trả lời hoặc nhận định chính ngắn gọn.
   - Chia nội dung thành các phần nhỏ có tiêu đề markdown (dùng ### Tiêu đề).
   - Dùng danh sách Markdown thực sự: mỗi ý gạch đầu dòng bắt buộc nằm trên MỘT DÒNG RIÊNG (sử dụng dấu "- " ở đầu dòng, tuyệt đối không viết gạch đầu dòng thành một đoạn văn liên tục).
   - Chỉ dùng **chữ đậm** khi muốn nhấn mạnh từ khóa cốt lõi. Không đặt toàn bộ câu trả lời trong một khối mã.
2. Trình bày bài toán & lý thuyết:
   - Đối với BÀI TOÁN XSTK: Luôn trình bày theo cấu trúc:
     **Bước 1: Dữ kiện đề bài**
     **Bước 2: Phương pháp & công thức áp dụng**
     **Bước 3: Thay số & tính toán chi tiết**
     **Bước 4: Kết luận & Giải thích ý nghĩa**
   - Đối với CÂU HỎI LÝ THUYẾT: Trình bày theo:
     **Khái niệm bản chất** -> **Điều kiện áp dụng** -> **Ví dụ thực tế** -> **Lưu ý / Sai lầm thường gặp**
3. Công thức toán học LaTeX:
   - Viết công thức toán trong cặp dấu $...$ cho công thức inline hoặc $$...$$ cho công thức riêng một dòng.
   - Luôn nêu rõ điều kiện áp dụng (ví dụ $P(B) > 0$ trong xác suất có điều kiện, $n \\ge 30$ trong CLT).
4. Máy tính bỏ túi:
   - Khi hữu ích hoặc sinh viên hỏi, chỉ rõ thao tác trên Casio fx-580VN X (Menu 6 Thống kê 1 biến, Menu 7 Phân phối xác suất).
5. Giọng văn:
   - Thân thiện, tôn trọng, giải thích dễ hiểu, mang tính tương tác cao.`;
};

// Rich, conversational local fallback solver covering common queries dynamically
const generateLocalTutorFallback = (query: string): string => {
  const q = query.toLowerCase();

  // Greetings & casual chat
  if (q.includes('chào') || q.includes('hello') || q.includes('hi') || q.length < 10) {
    return `Chào bạn! Rất vui được đồng hành cùng bạn học môn Xác suất & Thống kê hôm nay. 

Tôi có thể hỗ trợ bạn:
- Giải thích nhanh các khái niệm cốt lõi (Bayes, Bernoulli, Phân phối Chuẩn, Poisson, CLT).
- Hướng dẫn giải chi tiết bài tập theo chuẩn 4 bước sư phạm.
- Chỉ dẫn phím tắt bấm máy tính **Casio fx-580VN X Menu 7**.
- Ôn tập chuẩn bị cho bài thi giữa kỳ và cuối kỳ.

Bạn đang gặp khó khăn ở bài tập hoặc khái niệm nào? Hãy chia sẻ đề bài hoặc dùng tính năng **Voice-to-Text** để đọc cho tôi nhé!`;
  }

  // Bayes & Total Probability
  if (q.includes('bayes') || q.includes('xác suất đầy đủ') || q.includes('hậu nghiệm') || q.includes('tiên nghiệm')) {
    return `### Công thức Xác suất đầy đủ & Công thức Bayes

Chào bạn! Đây là một trong những phần quan trọng nhất trong Bài 1:

**1. Bản chất trực giác:**
- **Xác suất đầy đủ:** Dùng khi ta muốn tính xác suất của biến cố $A$, nhưng $A$ lại phụ thuộc vào các kịch bản/nguyên nhân khác nhau $\{H_1, H_2, \\dots, H_n\}$ (hệ biến cố đầy đủ).
$$P(A) = \\sum_{i=1}^n P(H_i) \\cdot P(A|H_i)$$

- **Công thức Bayes:** Dùng để "lật ngược thời gian" — khi đã quan sát thấy hiện tượng $A$ xảy ra, ta muốn cập nhật lại xác suất xem nó bắt nguồn từ kịch bản $H_k$ nào (xác suất hậu nghiệm):
$$P(H_k|A) = \\frac{P(H_k) \\cdot P(A|H_k)}{P(A)} = \\frac{P(H_k) \\cdot P(A|H_k)}{\\sum_{i=1}^n P(H_i) \\cdot P(A|H_i)}$$

**2. Ví dụ thực tế ngân hàng:**
Một kho hàng nhập từ xưởng I ($60\\%$, lỗi $1\\%$) và xưởng II ($40\\%$, lỗi $2\\%$).
- Lấy trúng phế phẩm $A$: $P(A) = 0.6 \\times 0.01 + 0.4 \\times 0.02 = 0.014 \\ (1.4\\%)$.
- Nếu đã gặp phế phẩm, xác suất do xưởng I sản xuất:
$$P(H_1|A) = \\frac{0.6 \\times 0.01}{0.014} = \\frac{0.006}{0.014} \\approx 42.86\\%$$

Bạn có bài toán Bayes cụ thể nào cần tôi giải mẫu từng bước không?`;
  }

  // Normal distribution
  if (q.includes('chuẩn') || q.includes('normal') || q.includes('gauss') || q.includes('laplace') || q.includes('3 sigma')) {
    return `### Phân phối Chuẩn $N(\\mu, \\sigma^2)$ & Phân phối Chuẩn tắc $Z \\sim N(0, 1)$

**1. Quy tắc cốt lõi:**
Đồ thị hàm mật độ có dạng hình chuông đối xứng hoàn hảo qua $x = \\mu$:
$$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$

**2. Kỹ thuật Chuẩn hóa về $Z$:**
Mọi bài toán thực tế đều đưa về chuẩn tắc bằng cách đặt:
$$Z = \\frac{X - \\mu}{\\sigma}$$
Khi đó: $P(a \\le X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)$
*(Lưu ý tính đối xứng quan trọng: $\\Phi(-z) = 1 - \\Phi(z)$)*.

**3. Quy tắc kinh nghiệm (3-Sigma):**
- Trong khoảng $\\mu \\pm \\sigma$: chứa $\\approx 68.27\\%$ dữ liệu.
- Trong khoảng $\\mu \\pm 2\\sigma$: chứa $\\approx 95.45\\%$ dữ liệu.
- Trong khoảng $\\mu \\pm 3\\sigma$: chứa $\\approx 99.73\\%$ dữ liệu.

**4. Bấm máy Casio fx-580VN X:**
Bấm \`MENU\` -> \`7\` (Distribution) -> chọn \`2\` (Normal CD) -> Nhập Lower, Upper, $\\sigma$, $\\mu$ là máy tính sẽ tự xuất kết quả xác suất!`;
  }

  // Casio calculator instructions
  if (q.includes('casio') || q.includes('máy tính') || q.includes('580') || q.includes('bấm máy')) {
    return `### Hướng dẫn Bấm máy tính Casio fx-580VN X trong môn XSTK

Máy tính Casio fx-580VN X hỗ trợ đắc lực 2 menu quan trọng:

**1. Menu 7 (Phân phối xác suất - Distribution):**
- \`1: Normal PD\`: Tính giá trị hàm mật độ $f(x)$ tại 1 điểm.
- \`2: Normal CD\`: Tính xác suất tích lũy $P(a \\le X \\le b)$ của phân phối chuẩn. Nhập Lower (a), Upper (b), $\\sigma$, $\\mu$.
- \`3: Inverse Normal\`: Phân phối chuẩn ngược. Nhập Area (diện tích xác suất), $\\sigma$, $\\mu$ để tìm điểm ngưỡng $x$.
- \`4: Binomial PD\`: Xác suất chính xác $P(X = k)$ của phân phối nhị thức.
- \`Bấm mũi tên xuống -> 1: Poisson PD\`: Xác suất phân phối Poisson $P(X = k)$.

**2. Menu 6 (Thống kê mẫu - Statistics):**
- Bấm \`SHIFT\` -> \`MENU\` -> Mũi tên xuống -> \`3: Statistics\` -> Bật \`1: On\` (tần số).
- Vào \`MENU\` -> \`6: Statistics\` -> chọn \`1: 1-Variable\`.
- Nhập cột $x_i$ (giá trị) và $Freq$ (tần số $n_i$).
- Bấm \`OPTN\` -> chọn \`2: 1-Variable Calc\` để máy hiện ra ngay: trung bình mẫu $\\bar{x}$, độ lệch chuẩn mẫu hiệu chỉnh $s_x$, phương sai $s_x^2$ và cỡ mẫu $n$.`;
  }

  // Z-test vs T-test
  if (q.includes('z-test') || q.includes('t-test') || q.includes('so sánh') || q.includes('student') || q.includes('khi nào dùng')) {
    return `### Phân biệt khi nào dùng Z-test và khi nào dùng T-test (Student)

Đây là câu hỏi kinh điển trong Bài 6 và Bài 7:

| Tiêu chí | Dùng Z-Test (Chuẩn tắc) | Dùng T-Test (Student) |
|---|---|---|
| **Cỡ mẫu $n$** | $n \\ge 30$ (Mẫu lớn) HOẶC đã biết $\\sigma^2$ | $n < 30$ (Mẫu nhỏ) VÀ chưa biết $\\sigma^2$ |
| **Thống kê** | $Z_{qs} = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}}$ hoặc $\\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}$ | $T_{qs} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}$ |
| **Giá trị tới hạn** | Tra bảng Laplace: $z_{\\alpha/2}$ (95% là $1.96$) | Tra bảng Student bậc $n-1$: $t_{\\alpha/2}^{(n-1)}$ |
| **Độ dày đuôi** | Đuôi mỏng chuẩn | Đuôi dày hơn do thêm sai số từ $s$ |

**Quy tắc vàng khi thi:**
1. Thấy cỡ mẫu $n < 30$ mà đề cho độ lệch chuẩn mẫu $s$ -> Chắc chắn dùng **T-test** (phân phối Student).
2. Thấy $n \\ge 30$ -> Yên tâm dùng **Z-test**.`;
  }

  // Generic conversational tutor response
  return `### Phản hồi từ Gia sư AI Gemini XSTK

Chào bạn! Với câu hỏi: **"${query}"**, tôi có thể giải thích ngắn gọn như sau:

1. **Về mặt bản chất lý thuyết**: Trong xác suất thống kê đại học, vấn đề này liên quan trực tiếp đến việc mô hình hóa các biến cố ngẫu nhiên và suy diễn thống kê từ dữ liệu mẫu quan sát.
2. **Công thức và hướng tiếp cận**:
   - Xác định xem bài toán thuộc dạng: Xác suất cơ bản (Bài 1), Biến ngẫu nhiên & Tham số (Bài 2, 3), hay Thống kê suy diễn (Ước lượng Bài 5 / Kiểm định Bài 6, 7).
   - Kiểm tra các điều kiện giả thiết: Cỡ mẫu $n$, tính độc lập, hay phân phối chuẩn của tổng thể.
3. **Lời khuyên thực hành**:
   - Bạn có thể gửi toàn bộ đề bài bằng cách nhập văn bản hoặc bật nút **Voice-to-Text** để đọc trực tiếp. Tôi sẽ giải chi tiết từng bước cho bạn!`;
};

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. CHAT WITH GEMINI / AI TUTOR WITH GOOGLE SEARCH GROUNDING
app.post('/api/gemini/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [], chapterContext = '', pedagogyMode = 'standard' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
      return;
    }

    // Check if client is initialized with a real key
    if (!aiClient) {
      const fallbackText = generateLocalTutorFallback(message);
      res.json({
        text: fallbackText,
        source: 'local_fallback',
        status: 'api_key_missing',
        message: 'Đang hiển thị phản hồi từ kho tri thức 7 bài giảng chuẩn.',
      });
      return;
    }

    try {
      // Build conversation prompt with pedagogical context
      let promptText = `${buildTutorSystemInstruction(pedagogyMode)}\n\n`;
      if (chapterContext) {
        promptText += `[Ngữ cảnh tài liệu giáo trình: ${chapterContext}]\n\n`;
      }

      if (history && history.length > 0) {
        promptText += `Lịch sử hội thoại gần đây:\n`;
        for (const h of history.slice(-6)) {
          promptText += `${h.role === 'user' ? 'Sinh viên' : 'Gia sư AI'}: ${h.text}\n`;
        }
        promptText += `\n`;
      }

      promptText += `Sinh viên: ${message}\n\nHãy trả lời linh hoạt, tự nhiên, chính xác, kèm công thức LaTeX phù hợp:`;

      // Call Gemini 3.8 Flash without heavy search latency for responsive conversational chat
      const response = await generateWithTimeout(
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
        }),
        45000
      );

      const responseText = response.text || '';

      res.json({
        text: responseText,
        source: 'gemini',
        status: 'ok',
      });
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError);
      const isDenied = apiError?.message?.includes('denied') || apiError?.status === 403;
      const fallbackText = generateLocalTutorFallback(message);

      res.json({
        text: fallbackText,
        source: 'local_fallback',
        status: isDenied ? 'access_denied' : 'api_error',
        errorMessage: isDenied 
          ? 'Project Gemini hiện tại bị từ chối quyền truy cập (Access Denied). Đang chuyển sang kho tri thức chuẩn.' 
          : (apiError.message || 'Lỗi kết nối Gemini API.'),
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi máy chủ nội bộ.' });
  }
});

// 2. UNIFIED MODULE: GENERATE PRACTICE PROBLEMS FROM DOCUMENT OR CHAPTER
app.post('/api/gemini/generate-practice', async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentText, fileName, chapterId, topic, difficulty = 'Trung bình', format = 'essay', count = 5 } = req.body;

    const basePrompt = `Bạn là giảng viên môn Xác suất và Thống kê.
Hãy tạo ${count} bài tập ${format === 'essay' ? 'Tự luận có chiến lược giải từng bước' : 'Trắc nghiệm 4 phương án A, B, C, D'} 
thuộc chủ đề: "${topic || `Chương ${chapterId}`}", độ khó: "${difficulty}".
${documentText ? `Dựa trên nội dung tài liệu đính kèm "${fileName}":\n${documentText.slice(0, 3000)}` : ''}

Yêu cầu xuất ra JSON theo đúng định dạng sau:
{
  "title": "Bộ đề luyện tập ${topic || `Chương ${chapterId}`}",
  "problems": [
    {
      "id": "p1",
      "text": "Đề bài chi tiết...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."], // chỉ có nếu format là mcq
      "hint": "Gợi ý hoặc bước tiếp cận",
      "solutionStrategy": "Chiến lược giải từng bước (không tiết lộ đáp số vội nếu tự luận)",
      "fullSolution": "Lời giải chi tiết đầy đủ và đáp số"
    }
  ]
}`;

    if (!aiClient) {
      // High-quality local generator
      res.json({
        title: `Bộ đề luyện tập chuẩn — ${topic || `Chương ${chapterId}`}`,
        problems: [
          {
            id: 'p1',
            text: 'Một xí nghiệp có hai phân xưởng I và II cùng sản xuất một loại chi tiết máy. Phân xưởng I sản xuất 60% sản phẩm với tỷ lệ phế phẩm là 2%. Phân xưởng II sản xuất 40% sản phẩm với tỷ lệ phế phẩm là 3%. Lấy ngẫu nhiên một chi tiết từ kho chung. Tính xác suất lấy được phế phẩm.',
            options: format === 'mcq' ? ['A. 0.024', 'B. 0.025', 'C. 0.028', 'D. 0.030'] : undefined,
            hint: 'Sử dụng hệ biến cố đầy đủ gồm hai phân xưởng và công thức xác suất đầy đủ.',
            solutionStrategy: 'Bước 1: Đặt biến cố H1, H2 lần lượt là sản phẩm của xưởng I và II. Bước 2: Đặt A là biến cố lấy được phế phẩm. Bước 3: Áp dụng P(A) = P(H1)P(A|H1) + P(H2)P(A|H2).',
            fullSolution: 'P(A) = 0.6 * 0.02 + 0.4 * 0.03 = 0.012 + 0.012 = 0.024 (2.4%).',
          },
          {
            id: 'p2',
            text: 'Một đề thi trắc nghiệm có 10 câu hỏi, mỗi câu có 4 phương án trả lời trong đó chỉ có 1 phương án đúng. Một thí sinh chọn ngẫu nhiên các phương án. Tính xác suất thí sinh đó trả lời đúng đúng 5 câu.',
            options: format === 'mcq' ? ['A. 0.0584', 'B. 0.0412', 'C. 0.0620', 'D. 0.0750'] : undefined,
            hint: 'Đây là mô hình phân phối Nhị thức B(n, p) với n=10, p=0.25.',
            solutionStrategy: 'Áp dụng công thức Bernoulli P(X = k) = C_n^k p^k (1-p)^{n-k}.',
            fullSolution: 'P(X = 5) = C_{10}^5 (0.25)^5 (0.75)^5 = 252 * 0.0009765 * 0.2373 ≈ 0.0584 (5.84%).',
          },
          {
            id: 'p3',
            text: 'Trọng lượng của một loại trái cây có phân phối chuẩn với trung bình μ = 500g và độ lệch chuẩn σ = 50g. Những quả có trọng lượng trên 580g được xếp vào loại đặc biệt. Tính tỷ lệ quả đặc biệt.',
            options: format === 'mcq' ? ['A. 5.48%', 'B. 6.20%', 'C. 7.15%', 'D. 4.80%'] : undefined,
            hint: 'Chuẩn hóa biến ngẫu nhiên Z = (X - μ) / σ và tra bảng Laplace.',
            solutionStrategy: 'Bước 1: Tính Z = (580 - 500) / 50 = 1.6. Bước 2: P(X > 580) = 1 - Φ(1.6).',
            fullSolution: 'P(X > 580) = 1 - 0.9452 = 0.0548 (5.48%).',
          },
          {
            id: 'p4',
            text: 'Kiểm tra ngẫu nhiên 400 sản phẩm của một lô hàng thấy có 36 sản phẩm khuyết tật. Hãy ước lượng khoảng tin cậy 95% cho tỷ lệ sản phẩm khuyết tật của toàn bộ lô hàng.',
            options: format === 'mcq' ? ['A. [6.19%, 11.81%]', 'B. [7.00%, 11.00%]', 'C. [5.50%, 12.50%]', 'D. [8.00%, 10.00%]'] : undefined,
            hint: 'Ước lượng tỷ lệ p với z_{0.025} = 1.96 và tỷ lệ mẫu f = 36/400 = 0.09.',
            solutionStrategy: 'Áp dụng công thức khoảng tin cậy: f ± z_{α/2} * sqrt(f(1-f)/n).',
            fullSolution: 'Sai số: ε = 1.96 * sqrt(0.09 * 0.91 / 400) = 1.96 * 0.0143 ≈ 0.0281. Khoảng tin cậy: [0.0619, 0.1181] tức từ 6.19% đến 11.81%.',
          },
          {
            id: 'p5',
            text: 'Định mức thời gian gia công một chi tiết máy là 15 phút. Theo dõi 25 lần gia công thu được trung bình mẫu 16.2 phút với độ lệch chuẩn mẫu s = 2.5 phút. Với mức ý nghĩa 5%, thời gian gia công trung bình có bị vượt định mức không? (Cho t_{0.05}^{(24)} = 1.711).',
            options: format === 'mcq' ? ['A. Vượt định mức (bác bỏ H0)', 'B. Chưa vượt định mức (chấp nhận H0)', 'C. Không thể kết luận', 'D. Bằng định mức'] : undefined,
            hint: 'Kiểm định giả thuyết H0: μ = 15 đối kháng H1: μ > 15 dùng tiêu chuẩn kiểm định T của phân phối Student.',
            solutionStrategy: 'Bước 1: Đặt H0, H1. Bước 2: Tính Tqs = (16.2 - 15) / (2.5 / sqrt(25)) = 1.2 / 0.5 = 2.4. Bước 3: So sánh với t_{0.05}^{(24)}.',
            fullSolution: 'Tqs = 2.4 > 1.711, rơi vào miền bác bỏ W_α. Do đó bác bỏ H0. Kết luận: Có cơ sở cho thấy thời gian gia công thực tế bị vượt định mức.',
          },
        ],
        source: 'local_fallback',
      });
      return;
    }

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: basePrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        ...parsed,
        source: 'gemini',
      });
    } catch (err: any) {
      console.error('Gemini generate-practice error:', err);
      res.status(500).json({ error: err.message || 'Lỗi khi tạo bài tập với Gemini.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UNIFIED MODULE: ANALYZE & GRADE SOLUTION
app.post('/api/gemini/analyze-solution', async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemText, studentNotes, solutionImage, suggestRevision = false } = req.body;

    const analysisPrompt = `Bạn là giám khảo chuyên môn chấm thi Xác suất & Thống kê đại học.
Đề bài bài toán:
"${problemText || 'Bài toán XSTK tổng hợp'}"

Bài làm / Ghi chú của sinh viên:
"${studentNotes || 'Xem bài làm đính kèm'}"

Tùy chọn: ${suggestRevision ? 'BẬT yêu cầu gợi ý kế hoạch ôn tập cá nhân hóa sâu sắc' : 'TẮT yêu cầu kế hoạch ôn tập'}

Hãy đánh giá cẩn trọng theo tiêu chuẩn:
1. Các bước làm đúng của sinh viên.
2. Các lỗi đã phát hiện (sai điều kiện, sai công thức, tính toán nhầm, hay kết luận chưa chặt chẽ).
3. Nguyên nhân dẫn đến lỗi (nhầm lẫn khái niệm hay kỹ năng tính toán).
4. Phân tích chi tiết từng bước theo 4 bước sư phạm.
${suggestRevision ? `
5. Gợi ý cụ thể:
   - Chương và chủ đề nên ôn lại ngay.
   - Lý do vì sao nội dung đó liên quan đến lỗi trong bài.
   - 1 bài tập củng cố tương tự.
   - Mức độ ưu tiên: "Cần ôn trước", "Nên củng cố", "Có thể ôn thêm".
` : ''}

LƯU Ý: Nếu không có barem điểm chính thức được phê duyệt, không tự ý gán điểm tuyệt đối giả mà hãy đánh giá theo mức độ hoàn thiện (% hoặc thang nhận xét).`;

    if (!aiClient) {
      res.json({
        correctSteps: [
          'Sinh viên đã xác định đúng không gian mẫu và gọi tên các biến cố rõ ràng.',
          'Biết áp dụng công thức xác suất tương ứng với bài toán.',
        ],
        detectedErrors: [
          'Chưa kiểm tra kỹ điều kiện độc lập của các biến cố trước khi nhân xác suất.',
          'Lỗi làm tròn trung gian quá sớm dẫn đến sai số ở đáp số cuối cùng.',
        ],
        possibleCauses: 'Thường do thói quen bấm máy tính làm tròn số thập phân dưới 3 chữ số và chưa phân biệt giữa biến cố độc lập với biến cố xung khắc.',
        pedagogyStepsReview: {
          step1: 'Tìm hiểu đề: Tốt, tóm tắt đủ giả thiết.',
          step2: 'Xây dựng phương án: Đạt 80%, cần bổ sung điều kiện giả thiết.',
          step3: 'Trình bày: Rõ ràng, dễ theo dõi.',
          step4: 'Kiểm tra: Bỏ sót bước so sánh miền xác suất.',
        },
        recommendedRevision: suggestRevision ? {
          chapterTitle: 'Chương 1: Biến cố ngẫu nhiên & Xác suất',
          topicTitle: 'Quy tắc nhân xác suất và Biến cố độc lập',
          priority: 'Cần ôn trước',
          reason: 'Việc nhầm lẫn giữa xung khắc (AB = rỗng) và độc lập (P(AB) = P(A)P(B)) là lỗi phổ biến nhất của sinh viên năm nhất.',
          practiceSuggestion: 'Làm lại 3 bài tập về xạ thủ bắn bia độc lập và hệ thống báo động song song trong giáo trình.',
        } : null,
        overallFeedback: 'Bài làm thể hiện tư duy tốt, chỉ cần rèn luyện thêm tính cẩn thận trong khâu điều kiện áp dụng định lý.',
        source: 'local_fallback',
      });
      return;
    }

    try {
      const contents: any[] = [{ text: analysisPrompt }];
      if (solutionImage && solutionImage.startsWith('data:image/')) {
        const matches = solutionImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          contents.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contents },
      });

      res.json({
        analysisText: response.text,
        source: 'gemini',
      });
    } catch (err: any) {
      console.error('Gemini analyze-solution error:', err);
      res.status(500).json({ error: err.message });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. FORUM ENDPOINTS (PERSISTENT & MULTI-USER)
app.get('/api/forum/posts', (req: Request, res: Response) => {
  const { chapterId, search, sort } = req.query;
  let posts = [...forumPosts];

  if (chapterId && chapterId !== 'all') {
    posts = posts.filter(p => p.chapterId === Number(chapterId));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }

  if (sort === 'popular') {
    posts.sort((a, b) => {
      const aLikes = Object.values(a.reactions || {}).reduce((sum, v) => sum + v, 0);
      const bLikes = Object.values(b.reactions || {}).reduce((sum, v) => sum + v, 0);
      return bLikes - aLikes;
    });
  } else {
    // latest
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ posts });
});

app.post('/api/forum/posts', (req: Request, res: Response): void => {
  const { authorId, authorName, authorAvatar, authorRole, chapterId, chapterTitle, title, content, attachmentUrl } = req.body;

  if (!title || !content || !authorName) {
    res.status(400).json({ error: 'Tiêu đề và nội dung bài viết không được để trống.' });
    return;
  }

  const newPost: ForumPost = {
    id: `post-${Date.now()}`,
    authorId: authorId || 'user-student-1',
    authorName,
    authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    authorRole: authorRole || 'student',
    chapterId: chapterId ? Number(chapterId) : undefined,
    chapterTitle,
    title,
    content,
    attachmentUrl,
    createdAt: new Date().toISOString(),
    reactions: { like: 0, helpful: 0 },
    userReactions: {},
    commentsCount: 0,
    isVerifiedAnswer: authorRole === 'lecturer',
  };

  forumPosts.unshift(newPost);
  res.status(201).json({ success: true, post: newPost });
});

app.get('/api/forum/posts/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const comments = forumComments.filter(c => c.postId === id);
  res.json({ comments });
});

app.post('/api/forum/posts/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { authorId, authorName, authorAvatar, authorRole, content } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Nội dung bình luận không được để trống.' });
    return;
  }

  const newComment: ForumComment = {
    id: `comm-${Date.now()}`,
    postId: id,
    authorId: authorId || 'user-student-1',
    authorName: authorName || 'Sinh viên XSTK',
    authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    authorRole: authorRole || 'student',
    content,
    createdAt: new Date().toISOString(),
    isLecturerVerified: authorRole === 'lecturer',
  };

  forumComments.push(newComment);

  // Update post comment count
  const post = forumPosts.find(p => p.id === id);
  if (post) {
    post.commentsCount = (post.commentsCount || 0) + 1;
  }

  res.status(201).json({ success: true, comment: newComment });
});

app.post('/api/forum/posts/:id/react', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { userId, reactionType = 'like' } = req.body;

  const post = forumPosts.find(p => p.id === id);
  if (!post) {
    res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    return;
  }

  post.reactions = post.reactions || {};
  post.userReactions = post.userReactions || {};

  const currentReaction = post.userReactions[userId];
  if (currentReaction === reactionType) {
    // Un-react
    post.reactions[reactionType] = Math.max(0, (post.reactions[reactionType] || 1) - 1);
    delete post.userReactions[userId];
  } else {
    // Change or add reaction
    if (currentReaction) {
      post.reactions[currentReaction] = Math.max(0, (post.reactions[currentReaction] || 1) - 1);
    }
    post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    post.userReactions[userId] = reactionType;
  }

  res.json({ success: true, reactions: post.reactions, userReactions: post.userReactions });
});

app.post('/api/forum/posts/:id/report', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { userId, reason } = req.body;
  // Log report safely
  console.log(`[REPORT] Post ${id} reported by ${userId} for reason: ${reason}`);
  res.json({ success: true, message: 'Báo cáo bài viết thành công. Ban kiểm duyệt sẽ xem xét.' });
});

// 5. STREAK API (ASIA/HO_CHI_MINH WITH POSITIVE SCORE VALIDATION)
app.get('/api/streak', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-student-1';
  const data = streakStore[userId] || {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    history: [],
  };
  const activities = userActivities[userId] || [];
  res.json({ streak: data, activities });
});

app.post('/api/streak/record', (req: Request, res: Response): void => {
  const { userId = 'user-student-1', type, title, score, maxScore = 10 } = req.body;

  // RULE: Only positive score counts as qualifying study activity
  if (typeof score !== 'number' || score <= 0) {
    res.status(400).json({ error: 'Chỉ hoạt động học tập thực tế và đạt điểm dương (>0) mới được ghi nhận vào chuỗi ngày học.' });
    return;
  }

  const todayVN = getTodayVietnamDate();
  const yesterdayVN = getYesterdayVietnamDate();

  if (!streakStore[userId]) {
    streakStore[userId] = {
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: todayVN,
      history: [todayVN],
    };
  } else {
    const s = streakStore[userId];
    if (s.lastStudyDate === todayVN) {
      // Already studied today, maintain current streak
    } else if (s.lastStudyDate === yesterdayVN) {
      // Consecutive day!
      s.currentStreak += 1;
      s.lastStudyDate = todayVN;
      if (!s.history.includes(todayVN)) s.history.push(todayVN);
      if (s.currentStreak > s.longestStreak) s.longestStreak = s.currentStreak;
    } else {
      // Streak broken, start new streak of 1
      s.currentStreak = 1;
      s.lastStudyDate = todayVN;
      if (!s.history.includes(todayVN)) s.history.push(todayVN);
    }
  }

  // Record activity
  if (!userActivities[userId]) userActivities[userId] = [];
  const activity: StudyActivity = {
    id: `act-${Date.now()}`,
    userId,
    type,
    title,
    score,
    maxScore,
    completedAt: new Date().toISOString(),
  };
  userActivities[userId].unshift(activity);

  res.json({ success: true, streak: streakStore[userId], activity });
});

// 6. ROADMAP API
app.get('/api/roadmap', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-student-1';
  const tasks = userRoadmaps[userId] || [];
  res.json({ tasks });
});

app.post('/api/roadmap/task-status', (req: Request, res: Response): void => {
  const { userId = 'user-student-1', taskId, status } = req.body;
  const tasks = userRoadmaps[userId];
  if (!tasks) {
    res.status(404).json({ error: 'Không tìm thấy lộ trình.' });
    return;
  }
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: 'Không tìm thấy nhiệm vụ học tập.' });
  }
});

// 7. WEEKLY CHALLENGE & LEADERBOARD API
app.get('/api/weekly-challenge', (_req: Request, res: Response) => {
  // Hide correctIndex when returning challenge to student
  const sanitizedQuestions = currentWeeklyChallenge.questions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options,
  }));

  res.json({
    challenge: {
      ...currentWeeklyChallenge,
      questions: sanitizedQuestions,
    },
    leaderboard: weeklyLeaderboard,
  });
});

app.post('/api/weekly-challenge/submit', (req: Request, res: Response): void => {
  const { userId = 'user-student-1', displayName = 'Lê Hoàng Nam', avatar, answers, durationSeconds } = req.body;

  // Grade on server
  let correctCount = 0;
  const questions = currentWeeklyChallenge.questions;
  const reviewDetails = questions.map((q, idx) => {
    const studentChoice = answers[q.id];
    const isCorrect = studentChoice === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      id: q.id,
      text: q.text,
      userChoice: studentChoice,
      correctChoice: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const finalScore = Math.round((correctCount / questions.length) * 100);

  // Update or insert into leaderboard
  const existingIdx = weeklyLeaderboard.findIndex(e => e.userId === userId);
  const entry: LeaderboardEntry = {
    userId,
    displayName,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    score: finalScore,
    durationSeconds: durationSeconds || 300,
    completedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    if (finalScore > weeklyLeaderboard[existingIdx].score) {
      weeklyLeaderboard[existingIdx] = entry;
    }
  } else {
    weeklyLeaderboard.push(entry);
  }

  // Sort leaderboard: score descending, then duration ascending
  weeklyLeaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.durationSeconds - b.durationSeconds;
  });

  res.json({
    success: true,
    score: finalScore,
    correctCount,
    totalQuestions: questions.length,
    reviewDetails,
    leaderboard: weeklyLeaderboard,
  });
});

// 8. PERSONALIZED COMPETENCY EXAM GENERATOR
app.post('/api/custom-exam/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapters = [1, 2, 3], difficulty = 'Trung bình', count = 10, timeMinutes = 20, prioritizeWeakAreas = true } = req.body;

    const examQuestions = [
      {
        id: 'ex-1',
        chapterId: 1,
        question: 'Gieo một con xúc xắc 6 mặt đồng chất 2 lần. Xác suất để số chấm trong 2 lần gieo khác nhau là:',
        options: ['A. 1/6', 'B. 5/6', 'C. 1/36', 'D. 35/36'],
        correctIndex: 1,
        explanation: 'Số kết quả có 2 mặt giống nhau là 6. Số kết quả khác nhau là 36 - 6 = 30. Vậy xác suất là 30/36 = 5/6.',
      },
      {
        id: 'ex-2',
        chapterId: 1,
        question: 'Một hộp có 7 quả cầu trắng và 3 quả cầu đỏ. Lấy ngẫu nhiên không hoàn lại 2 quả cầu. Xác suất lấy được 2 quả trắng là:',
        options: ['A. 7/15', 'B. 49/100', 'C. 21/45', 'D. 7/10'],
        correctIndex: 0,
        explanation: 'P(2 trắng) = (C_7^2) / (C_10^2) = 21 / 45 = 7/15.',
      },
      {
        id: 'ex-3',
        chapterId: 2,
        question: 'Biến ngẫu nhiên X có phân phối nhị thức B(n = 20, p = 0.4). Kỳ vọng E(X) và phương sai Var(X) lần lượt là:',
        options: ['A. E=8, Var=4.8', 'B. E=8, Var=12', 'C. E=12, Var=4.8', 'D. E=8, Var=6.4'],
        correctIndex: 0,
        explanation: 'E(X) = np = 20*0.4 = 8. Var(X) = np(1-p) = 20*0.4*0.6 = 4.8.',
      },
      {
        id: 'ex-4',
        chapterId: 2,
        question: 'Số lượt khách vào một siêu thị mini tuân theo phân phối Poisson với trung bình λ = 4 khách/phút. Xác suất có đúng 2 khách vào trong 1 phút là:',
        options: ['A. 0.1465', 'B. 0.0733', 'C. 0.2381', 'D. 0.1954'],
        correctIndex: 0,
        explanation: 'P(X = 2) = (e^{-4} * 4^2) / 2! = (0.0183 * 16) / 2 ≈ 0.1465 (14.65%).',
      },
      {
        id: 'ex-5',
        chapterId: 3,
        question: 'Cho X ~ N(μ = 100, σ² = 25). Xác suất P(90 <= X <= 110) bằng:',
        options: ['A. 0.6827', 'B. 0.9545', 'C. 0.9973', 'D. 0.8413'],
        correctIndex: 1,
        explanation: 'Độ lệch chuẩn σ = 5. Khoảng [90, 110] chính là [μ - 2σ, μ + 2σ]. Theo quy tắc 2-Sigma, P = 95.45%.',
      },
      {
        id: 'ex-6',
        chapterId: 4,
        question: 'Nếu hai biến ngẫu nhiên X và Y độc lập với nhau thì hệ số tương quan tuyến tính ρ(X, Y) bằng:',
        options: ['A. 1', 'B. 0', 'C. -1', 'D. Không xác định'],
        correctIndex: 1,
        explanation: 'Hai biến độc lập thì Cov(X,Y) = 0, do đó ρ(X,Y) = 0.',
      },
      {
        id: 'ex-7',
        chapterId: 5,
        question: 'Ước lượng khoảng tin cậy 95% cho kỳ vọng μ với mẫu n = 100, x̄ = 50, σ = 10 (cho z_{0.025} = 1.96) là:',
        options: ['A. [48.04, 51.96]', 'B. [49.02, 50.98]', 'C. [47.50, 52.50]', 'D. [48.50, 51.50]'],
        correctIndex: 0,
        explanation: 'Sai số: ε = 1.96 * (10 / sqrt(100)) = 1.96. Khoảng tin cậy: [50 - 1.96, 50 + 1.96] = [48.04, 51.96].',
      },
      {
        id: 'ex-8',
        chapterId: 6,
        question: 'Trong kiểm định giả thuyết thống kê, sai lầm loại I xảy ra khi:',
        options: [
          'A. Bác bỏ H0 khi H0 đúng',
          'B. Chấp nhận H0 khi H0 sai',
          'C. Bác bỏ H1 khi H1 đúng',
          'D. Tính sai giá trị trung bình mẫu',
        ],
        correctIndex: 0,
        explanation: 'Sai lầm loại I (xác suất α) là xác suất bác bỏ giả thuyết H0 khi thực tế H0 đúng.',
      },
      {
        id: 'ex-9',
        chapterId: 6,
        question: 'Nếu p-value = 0.012 và mức ý nghĩa α = 0.05, kết luận của kiểm định là:',
        options: [
          'A. Bác bỏ giả thuyết H0',
          'B. Chưa đủ cơ sở bác bỏ H0',
          'C. Chấp nhận H0 tuyệt đối',
          'D. Cần tăng kích thước mẫu',
        ],
        correctIndex: 0,
        explanation: 'Theo quy tắc p-value: Nếu p-value <= α thì ta bác bỏ giả thuyết H0.',
      },
      {
        id: 'ex-10',
        chapterId: 7,
        question: 'Đường hồi quy tuyến tính mẫu có dạng Ŷ = 12 + 2.5X. Hệ số xác định R² = 0.81. Hệ số tương quan r_XY bằng:',
        options: ['A. +0.9', 'B. -0.9', 'C. 0.81', 'D. 0.656'],
        correctIndex: 0,
        explanation: 'Vì hệ số góc β̂1 = 2.5 > 0, tương quan mang dấu dương: r_XY = +sqrt(0.81) = +0.9.',
      },
    ];

    res.json({
      examTitle: `Đề thi cá nhân hóa XSTK — Năng lực thích ứng (${difficulty})`,
      timeMinutes,
      totalQuestions: count,
      questions: examQuestions.slice(0, count),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. AI ERROR REPORTS API
app.get('/api/ai-reports', (_req: Request, res: Response) => {
  res.json({ reports: aiReports });
});

app.post('/api/ai-reports', (req: Request, res: Response): void => {
  const { userId = 'user-student-1', userName = 'Sinh viên XSTK', questionContext, aiResponse, userComplaint, reportCategory } = req.body;

  if (!userComplaint) {
    res.status(400).json({ error: 'Vui lòng mô tả chi tiết lỗi phát hiện.' });
    return;
  }

  const newTicket: AIReportTicket = {
    id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    userName,
    questionContext: questionContext || 'Buổi học cùng Gia sư AI',
    aiResponse: aiResponse || 'Phản hồi cần xem xét',
    userComplaint,
    reportCategory: reportCategory || 'Sai công thức',
    submittedAt: new Date().toISOString(),
    status: 'Đã tiếp nhận — Đang chờ máy chủ xác minh',
  };

  aiReports.unshift(newTicket);
  res.status(201).json({ success: true, ticket: newTicket });
});

// -------------------------------------------------------------
// VITE DEV SERVER INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study Studio XSTK server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
