import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle, 
  RotateCcw, 
  Flag, 
  Play, 
  Award, 
  BookOpen, 
  AlertCircle,
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { MathView } from './MathView';
import { UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface PersonalizedExamProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
}

export const PersonalizedExam: React.FC<PersonalizedExamProps> = ({ currentUser, onActivityCompleted }) => {
  // Config states
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1, 2, 3]);
  const [difficulty, setDifficulty] = useState<'Cơ bản' | 'Trung bình' | 'Nâng cao' | 'Hỗn hợp'>('Trung bình');
  const [examTime, setExamTime] = useState<number>(20);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [prioritizeWeakAreas, setPrioritizeWeakAreas] = useState<boolean>(true);

  // Exam taking states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [examData, setExamData] = useState<any | null>(null);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [qId: string]: boolean }>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(1200);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Timer
  useEffect(() => {
    if (!isExamActive || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExamActive, isSubmitted]);

  const toggleChapter = (id: number) => {
    setSelectedChapters((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  };

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/custom-exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapters: selectedChapters,
          difficulty,
          count: questionCount,
          timeMinutes: examTime,
          prioritizeWeakAreas,
        }),
      });

      const data = await res.json();
      setExamData(data);
      setIsExamActive(true);
      setIsSubmitted(false);
      setUserAnswers({});
      setFlaggedQuestions({});
      setCurrentQIndex(0);
      setSecondsLeft(examTime * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitExam = () => {
    if (isSubmitted || !examData) return;
    setIsSubmitted(true);
    setIsExamActive(false);

    // Calculate score
    let correct = 0;
    examData.questions?.forEach((q: any) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / examData.questions.length) * 10);
    if (finalScore > 0) {
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
      onActivityCompleted(finalScore, 'Hoàn thành Đề thi cá nhân hóa AI');
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Review statistics
  const totalQuestions = examData?.questions?.length || 0;
  const correctCount = examData?.questions?.filter((q: any) => userAnswers[q.id] === q.correctIndex).length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              AI THÍCH ỨNG THEO NĂNG LỰC
            </span>
            <span className="text-xs text-emerald-300">Khác biệt với Thi thử 45 phút</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-[#D6A64F]" />
            TẠO ĐỀ THI THEO NĂNG LỰC CỦA TÔI
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Tự chọn phạm vi chương học, mức độ câu hỏi và bật ưu tiên các dạng bài bạn thường tính toán sai để luyện tập chuẩn xác.
          </p>
        </div>
      </div>

      {/* Screen 1: Configuration Generator (If not active & not submitted) */}
      {!isExamActive && !isSubmitted && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-[#1B3D2F]">Cấu hình bộ đề thi theo yêu cầu</h3>

          {/* Chapter Selector (Multi-select) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Chọn các chương đưa vào đề thi:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {CHAPTERS_DATA.map((ch) => {
                const isSelected = selectedChapters.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChapter(ch.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'border-[#1B3D2F] bg-[#F4F3EC] font-semibold text-[#1B3D2F] ring-1 ring-[#1B3D2F]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-[10px] ${
                      isSelected ? 'bg-[#1B3D2F] text-white border-[#1B3D2F]' : 'border-slate-300'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="line-clamp-2">
                      Chương {ch.id}: {ch.title.split(':')[1]?.trim() || ch.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mức độ yêu cầu
              </label>
              <select
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
              >
                <option value="Cơ bản">Cơ bản (Trắc nghiệm nhận biết)</option>
                <option value="Trung bình">Trung bình (Thông hiểu & Áp dụng)</option>
                <option value="Nâng cao">Nâng cao (Vận dụng cao)</option>
                <option value="Hỗn hợp">Hỗn hợp (Phân loại theo tỷ lệ chuẩn)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thời gian làm bài
              </label>
              <select
                value={examTime}
                onChange={(e) => setExamTime(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
              >
                <option value={15}>15 phút</option>
                <option value={20}>20 phút (Tiêu chuẩn)</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số lượng câu hỏi
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
              >
                <option value={5}>5 câu</option>
                <option value={10}>10 câu (Khuyến nghị)</option>
              </select>
            </div>
          </div>

          {/* Toggle: Prioritize weak areas */}
          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F4F3EC] border border-slate-200 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={prioritizeWeakAreas}
              onChange={(e) => setPrioritizeWeakAreas(e.target.checked)}
              className="w-4 h-4 rounded text-[#1B3D2F] accent-[#1B3D2F]"
            />
            <div>
              <span className="font-bold text-[#1B3D2F]">
                ☑ Ưu tiên các chủ đề tôi thường sai hoặc điểm còn thấp
              </span>
              <p className="text-slate-500 text-[11px]">
                AI sẽ trích xuất lịch sử lỗi của bạn (ví dụ: công thức Bayes, phân phối Poisson) để tăng mật độ câu hỏi tương ứng.
              </p>
            </div>
          </label>

          {/* Start Exam Button */}
          <button
            onClick={handleGenerateExam}
            disabled={isGenerating}
            className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI đang tổng hợp và sinh đề thi cá nhân hóa...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-[#D6A64F]" />
                <span>BẮT ĐẦU LÀM BÀI THI CÁ NHÂN HÓA</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Screen 2: Active Exam Taking */}
      {isExamActive && examData && !isSubmitted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Area (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 text-xs">
              <span className="font-bold text-[#5B6F2B] uppercase">
                Câu hỏi {currentQIndex + 1} / {examData.questions.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const qId = examData.questions[currentQIndex].id;
                  setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  flaggedQuestions[examData.questions[currentQIndex].id]
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions[examData.questions[currentQIndex].id] ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-xl bg-[#F4F3EC] text-sm text-slate-800 font-medium">
              <MathView content={examData.questions[currentQIndex].question} />
            </div>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {examData.questions[currentQIndex].options.map((opt: string, optIdx: number) => {
                const qId = examData.questions[currentQIndex].id;
                const isSelected = userAnswers[qId] === optIdx;

                return (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? 'border-[#1B3D2F] bg-emerald-50/50 font-bold text-[#1B3D2F]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`exam-opt-${qId}`}
                      checked={isSelected}
                      onChange={() => setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }))}
                      className="accent-[#1B3D2F]"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>

            {/* Prev / Next controls */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => prev - 1)}
                className="py-2 px-4 rounded-lg font-semibold text-xs border border-slate-200 disabled:opacity-40"
              >
                Câu trước
              </button>
              <button
                disabled={currentQIndex === examData.questions.length - 1}
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="py-2 px-4 rounded-lg font-semibold text-xs bg-[#1B3D2F] text-white disabled:opacity-40"
              >
                Câu tiếp theo
              </button>
            </div>
          </div>

          {/* Exam Navigator & Timer (4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            {/* Countdown */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-1">
              <span className="text-xs text-red-700 font-semibold">Thời gian còn lại</span>
              <div className="text-2xl font-black text-red-600 tracking-wider">
                {formatTimer(secondsLeft)}
              </div>
            </div>

            {/* Question matrix */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Mục lục câu hỏi:</span>
              <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((q: any, idx: number) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions[q.id];
                  const isCurrent = currentQIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all relative ${
                        isCurrent
                          ? 'ring-2 ring-[#D6A64F] bg-[#1B3D2F] text-white'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitExam}
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#5B6F2B] text-white hover:bg-[#4d5e24] transition-all shadow-sm"
            >
              NỘP BÀI THI NGAY
            </button>
          </div>
        </div>
      )}

      {/* Screen 3: Post-Exam Analytics & Detailed Solutions */}
      {isSubmitted && examData && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
              <div>
                <span className="text-xs font-bold text-[#5B6F2B] uppercase">Báo cáo kết quả bài thi</span>
                <h3 className="text-2xl font-black text-[#1B3D2F]">
                  {Math.round((correctCount / totalQuestions) * 10)} / 10 Điểm
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Đúng {correctCount} / {totalQuestions} câu · Thời gian làm: {examTime * 60 - secondsLeft} giây
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsExamActive(false);
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#1B3D2F] text-white hover:bg-[#153125] flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Tạo đề thi mới
              </button>
            </div>

            {/* Mistake analysis & detailed solution */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Chi tiết câu hỏi & Lời giải tham chiếu:
              </h4>

              {examData.questions.map((q: any, idx: number) => {
                const userChoice = userAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-3 ${
                      isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-800">
                        Câu {idx + 1}: <MathView content={q.question} />
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] shrink-0 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? '✓ Đúng' : '✗ Sai'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <b>Bạn chọn:</b> {userChoice !== undefined ? q.options[userChoice] : 'Chưa trả lời'}
                      </div>
                      <div className="p-2 bg-white rounded border border-emerald-300 font-semibold text-emerald-800">
                        <b>Đáp án đúng:</b> {q.options[q.correctIndex]}
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-lg text-slate-700 leading-relaxed border border-slate-200">
                      <p className="font-bold text-[#1B3D2F] mb-1">Lời giải chi tiết:</p>
                      <MathView content={q.explanation} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
