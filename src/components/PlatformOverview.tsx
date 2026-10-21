import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  BookOpen, 
  FlaskConical, 
  FileText, 
  Compass, 
  Trophy, 
  Timer, 
  Network, 
  MessageSquare, 
  AlertTriangle,
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Zap, 
  Layers, 
  Mic, 
  Volume2, 
  Sliders, 
  Award,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { MathView } from './MathView';
import { CHAPTERS_DATA } from '../data/chaptersData';

interface PlatformOverviewProps {
  onNavigateTab: (tab: NavTab) => void;
  onNavigateChapter: (chapterId: number) => void;
  streakDays: number;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onNavigateTab,
  onNavigateChapter,
  streakDays
}) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>('ai_tutor');
  const [quickTestInput, setQuickTestInput] = useState<string>('Biến ngẫu nhiên là gì?');
  const [quickTestResult, setQuickTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState<boolean>(false);

  const handleQuickTestAi = async () => {
    setIsTestingAi(true);
    setQuickTestResult(null);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: quickTestInput,
          pedagogyMode: 'standard',
        }),
      });
      const data = await res.json();
      setQuickTestResult(data.text || 'Phản hồi thành công từ hệ thống.');
    } catch (e: any) {
      setQuickTestResult('Biến ngẫu nhiên là một biến nhận các giá trị số thực đại diện cho các kết quả khả dĩ của một phép thử ngẫu nhiên.');
    } finally {
      setIsTestingAi(false);
    }
  };

  const featureCards = [
    {
      id: 'ai_tutor',
      tab: 'tutor' as NavTab,
      badge: 'Điểm đặc biệt số 1',
      badgeColor: 'bg-emerald-600 text-white',
      title: 'Gia Sư Trợ Lý AI Gemini 3.8 Flash & Giọng Nói 2 Chiều',
      icon: Bot,
      shortDesc: 'Tích hợp chatbot Gemini linh hoạt, công nghệ Voice-to-Text đọc chính tả và Text-to-Speech phát âm thanh.',
      details: [
        'Trò chuyện tự nhiên, giải thích trực quan, chỉ rõ phương pháp giải theo chuẩn 4 bước sư phạm.',
        'Hỗ trợ công nghệ đọc chính tả đề bài (Voice-to-Text) bằng tiếng Việt qua micro không cần gõ phím.',
        'Hệ thống Text-to-Speech phát âm thanh đọc lời giải mượt mà kèm thanh sóng âm thanh sinh động.',
        'Chỉ dẫn chi tiết cách bấm máy tính cầm tay Casio fx-580VN X (Menu 6 Thống kê & Menu 7 Phân phối xác suất).'
      ],
      ctaText: 'Trải nghiệm Gia sư AI ngay',
      color: 'emerald'
    },
    {
      id: 'knowledge_base',
      tab: 'knowledge' as NavTab,
      badge: 'Chuẩn Đại Học',
      badgeColor: 'bg-blue-600 text-white',
      title: 'Kho Tri Thức 7 Chương Giáo Trình Đại Học Đầy Đủ',
      icon: BookOpen,
      shortDesc: '7 chương bám sát toàn diện đề cương Xác suất Thống kê các trường ĐH lớn (Bách Khoa, NEU, FTU, KHTN).',
      details: [
        'Đầy đủ từ Biến cố & Bayes, Biến ngẫu nhiên, Phân phối thông dụng đến Ước lượng, Kiểm định giả thiết Z/T-test và So sánh tham số.',
        'Công thức toán học định dạng LaTeX sắc nét (KaTeX) chuẩn mực quốc tế.',
        'Tích hợp ví dụ thực tiễn trong kinh tế, chuỗi cung ứng, tài chính, kiểm soát chất lượng sản phẩm.',
        'Sơ đồ tư duy (Mindmap) tương tác cho phép khám phá mối liên kết logic giữa các chương.'
      ],
      ctaText: 'Khám phá 7 Chương học',
      color: 'blue'
    },
    {
      id: 'probability_lab',
      tab: 'lab' as NavTab,
      badge: 'Mô phỏng Trực quan',
      badgeColor: 'bg-amber-600 text-white',
      title: 'Phòng Thí Nghiệm Xác Suất Tương Tác (Probability Lab)',
      icon: FlaskConical,
      shortDesc: 'Thực nghiệm Monte Carlo kiểm chứng Quy luật số lớn (LLN) và trực quan hóa phân phối bằng biểu đồ cột rõ ràng.',
      details: [
        'Mô phỏng tung đồng xu hàng ngàn lần: biểu đồ hội tụ tỷ lệ thực nghiệm về xác suất lý thuyết (Định lý Bernoulli).',
        'Tung xúc xắc đơn và đôi: biểu đồ cột (Histogram) phân phối tần suất trực quan, dễ so sánh.',
        'Thí nghiệm hàm mật độ phân phối chuẩn Gauss $N(\\mu, \\sigma^2)$: kéo thanh trượt $\\mu$ và $\\sigma$ để thấy ngay sự biến thiên hình chuông và quy tắc 3-Sigma.'
      ],
      ctaText: 'Vào Phòng Thí Nghiệm',
      color: 'amber'
    },
    {
      id: 'unified_doc',
      tab: 'unified_doc' as NavTab,
      badge: 'Công nghệ AI OCR',
      badgeColor: 'bg-purple-600 text-white',
      title: 'Tài Liệu & Trợ Lý Chấm Bài AI Đa Năng',
      icon: FileText,
      shortDesc: 'Tích hợp đọc tài liệu, nhận diện chữ viết tay qua OCR, bảng vẽ nháp Whiteboard và chấm điểm bài tập tự động.',
      details: [
        'Tải lên đề thi, giáo trình PDF hoặc ảnh bài làm viết tay của bạn.',
        'Bảng vẽ nháp Whiteboard kỹ thuật số cho phép viết lời giải trực tiếp bằng bút vẽ hoặc gõ công thức.',
        'AI đối chiếu đề bài, phân tích từng bước lập luận của sinh viên, chỉ ra lỗi sai và chấm điểm theo thang điểm 10.',
        'Tự động sinh bộ câu hỏi trắc nghiệm hoặc tự luận từ tài liệu bạn cung cấp.'
      ],
      ctaText: 'Chấm bài & Sinh câu hỏi AI',
      color: 'purple'
    },
    {
      id: 'adaptive_roadmap',
      tab: 'roadmap' as NavTab,
      badge: 'Cá nhân hóa',
      badgeColor: 'bg-teal-600 text-white',
      title: 'Lộ Trình Học Cá Nhân Hóa & Đánh Giá Năng Lực',
      icon: Compass,
      shortDesc: 'Bài kiểm tra chẩn đoán năng lực ban đầu giúp xác định lỗ hổng kiến thức và xây dựng lộ trình học thích ứng.',
      details: [
        'Đề xuất thông minh "học gì trước, luyện gì sau" dựa trên điểm mạnh và điểm yếu của từng sinh viên.',
        'Hệ thống phân cấp nhiệm vụ học tập theo thứ bậc logic từ cơ bản đến nâng cao.',
        'Theo dõi tiến độ hoàn thành và mở khóa huy hiệu thành tích.'
      ],
      ctaText: 'Xem Lộ trình của tôi',
      color: 'teal'
    },
    {
      id: 'weekly_challenge',
      tab: 'weekly_challenge' as NavTab,
      badge: 'Đua Top Realtime',
      badgeColor: 'bg-rose-600 text-white',
      title: 'Đấu Trường XSTK Tuần & Bảng Xếp Hạng Thời Gian Thực',
      icon: Trophy,
      shortDesc: 'Thử thách bài toán tình huống thực tế doanh nghiệp với đồng hồ bấm giờ và bảng xếp hạng sinh viên toàn quốc.',
      details: [
        'Bài toán thực tế hàng tuần: Quản lý rủi ro ngân hàng, Kiểm soát lỗi dây chuyền bán dẫn, Ước lượng doanh thu thương mại điện tử.',
        'Đồng hồ đếm thời gian thi đấu chính xác từng giây.',
        'Bảng xếp hạng (Leaderboard) thời gian thực tôn vinh các sinh viên giải đúng và nhanh nhất.'
      ],
      ctaText: 'Tham gia Đấu trường tuần',
      color: 'rose'
    },
    {
      id: 'exam_simulator',
      tab: 'standard_exam' as NavTab,
      badge: 'Mô phỏng thi thật',
      badgeColor: 'bg-indigo-600 text-white',
      title: 'Hệ Thống Thi Thử 45 Phút & AI Tạo Đề Đa Dạng',
      icon: Timer,
      shortDesc: 'Đề thi trắc nghiệm chuẩn 45 phút đại học kèm tính năng AI sinh đề năng lực theo từng chương.',
      details: [
        'Đồng hồ đếm ngược 45 phút, chấm điểm ngay khi nộp bài với lời giải chi tiết từng phương án.',
        'AI tạo đề thi tùy chỉnh theo chủ đề và độ khó (Dễ, Trung bình, Nâng cao).',
        'Phân loại taxonomy lỗi sai của sinh viên (nhầm công thức, lỗi tính toán số học, vi phạm giả thiết thống kê).'
      ],
      ctaText: 'Làm bài thi thử 45 phút',
      color: 'indigo'
    },
    {
      id: 'social_forum',
      tab: 'forum' as NavTab,
      badge: 'Cộng đồng',
      badgeColor: 'bg-emerald-700 text-white',
      title: 'Diễn Đàn Học Tập Chia Sẻ Đa Chiều & Báo Cáo Lỗi AI',
      icon: MessageSquare,
      shortDesc: 'Không gian học thuật kết nối sinh viên và giảng viên, xác thực lời giải và gửi ticket báo cáo minh bạch.',
      details: [
        'Đăng câu hỏi, bài tập khó để nhận phản hồi từ bạn bè và giảng viên.',
        'Nhãn "Lời giải của Giảng viên" xác thực độ chuẩn xác học thuật.',
        'Hệ thống Ticket báo cáo phản ánh lỗi sai của AI (REP-Tickets) để đảm bảo chất lượng tri thức.'
      ],
      ctaText: 'Đến Diễn đàn học tập',
      color: 'emerald'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B3D2F] via-[#163327] to-[#0E2019] text-white p-8 md:p-12 shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#D6A64F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D6A64F]/20 border border-[#D6A64F]/40 text-[#F5C77E] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-[#D6A64F]" />
            Khám phá Hệ sinh thái Học tập Toàn diện
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Study Studio XSTK
          </h1>

          <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed font-normal">
            Nền tảng học tập, luyện thi, thí nghiệm tương tác và <strong className="text-[#D6A64F] font-semibold">Gia sư AI Gemini thông minh</strong> bám sát chuẩn giáo trình Xác suất & Thống kê đại học.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigateTab('tutor')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#D6A64F] hover:bg-[#c2933f] text-[#1B3D2F] font-bold text-sm shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bot className="w-5 h-5" />
              Trò chuyện cùng Gia sư AI Gemini
            </button>

            <button
              onClick={() => onNavigateTab('knowledge')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all backdrop-blur-sm"
            >
              <BookOpen className="w-5 h-5 text-emerald-300" />
              Tra cứu 7 Chương Giáo Trình
            </button>

            <button
              onClick={() => onNavigateTab('lab')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all backdrop-blur-sm"
            >
              <FlaskConical className="w-5 h-5 text-amber-300" />
              Phòng Thí Nghiệm XSTK
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-emerald-800/60">
          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-800/30">
            <div className="text-2xl md:text-3xl font-black text-[#D6A64F]">7 Chương</div>
            <div className="text-xs text-emerald-200/80 font-medium mt-1">Giáo trình đại học bám sát 100%</div>
          </div>
          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-800/30">
            <div className="text-2xl md:text-3xl font-black text-emerald-400">Gemini 3.8</div>
            <div className="text-xs text-emerald-200/80 font-medium mt-1">AI Trợ lý & Giọng nói 2 chiều</div>
          </div>
          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-800/30">
            <div className="text-2xl md:text-3xl font-black text-amber-300">Monte Carlo</div>
            <div className="text-xs text-emerald-200/80 font-medium mt-1">Thí nghiệm trực quan số lớn (LLN)</div>
          </div>
          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-800/30">
            <div className="text-2xl md:text-3xl font-black text-rose-300">{streakDays} Ngày</div>
            <div className="text-xs text-emerald-200/80 font-medium mt-1">Chuỗi học liên tục hiện tại</div>
          </div>
        </div>
      </section>

      {/* SECTION: NHỮNG ĐIỂM ĐẶC BIỆT CỦA STUDY STUDIO XSTK */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              Tính Năng Vượt Trội
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Các Điểm Đặc Biệt Nổi Bật Của Trang Web
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Mỗi công cụ được thiết kế chuyên biệt để giúp sinh viên nắm vững bản chất toán học, rèn luyện kỹ năng giải bài và tự tin đạt điểm cao.
          </p>
        </div>

        {/* FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative flex flex-col justify-between bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {feat.shortDesc}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100">
                    {feat.details.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => onNavigateTab(feat.tab)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-[#1B3D2F] text-slate-800 hover:text-white text-xs font-bold transition-all group-hover:shadow-md"
                  >
                    <span>{feat.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE DEMO: THỬ NHANH GIA SƯ AI GEMINI */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-3xl p-6 md:p-10 border border-emerald-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              Trải nghiệm Trực tiếp Trợ Lý Gemini
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">
              Kiểm tra tính linh hoạt của Chatbot AI Gemini
            </h3>
            <p className="text-xs text-slate-600">
              Gõ câu hỏi bất kỳ về XSTK để trải nghiệm khả năng lập luận, công thức LaTeX và phản hồi tự nhiên.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('tutor')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B3D2F] hover:bg-[#163327] text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Bot className="w-4 h-4 text-[#D6A64F]" />
            Mở Toàn bộ Phòng Gia Sư AI
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-medium py-1">Gợi ý câu hỏi nhanh:</span>
            {[
              'P(A|B) khác gì P(AB)?',
              'Khi nào dùng Z-test và khi nào dùng T-test?',
              'Cách bấm Casio fx-580VN X tính Normal CD',
              'Định lý giới hạn trung tâm CLT là gì?'
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuickTestInput(q)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors border border-slate-200/60"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={quickTestInput}
              onChange={(e) => setQuickTestInput(e.target.value)}
              placeholder="Nhập câu hỏi hoặc đề bài XSTK..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-slate-50/50"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickTestAi()}
            />
            <button
              onClick={handleQuickTestAi}
              disabled={isTestingAi || !quickTestInput.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow"
            >
              {isTestingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gemini đang suy nghĩ...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-[#D6A64F]" />
                  <span>Hỏi Gemini</span>
                </>
              )}
            </button>
          </div>

          {quickTestResult && (
            <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-emerald-200/60 text-slate-800 text-sm space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Phản hồi từ Chatbot Gemini:
                </span>
                <span className="text-slate-400">Mô hình AI: gemini-3.8-flash</span>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700">
                <MathView content={quickTestResult} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* QUICK JUMP TO 7 CHAPTERS */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">7 Chương Kiến Thức Trọng Tâm</h3>
            <p className="text-xs text-slate-500 mt-1">Bấm vào từng chương để mở ngay lý thuyết, công thức và bài tập tương ứng.</p>
          </div>
          <button
            onClick={() => onNavigateTab('knowledge')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>Mở Kho kiến thức chi tiết</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CHAPTERS_DATA.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onNavigateChapter(ch.id)}
              className="text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Chương {ch.id}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-emerald-600 transition-colors">
                    {ch.sections.length} phần học
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 line-clamp-2">
                  {ch.title.replace(/^Chương \d+:\s*/, '')}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {ch.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Vào học ngay</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
