import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  RotateCcw,
  Medal,
  ChevronRight,
  Check
} from 'lucide-react';
import { LeaderboardEntry, UserProfile } from '../types';
import { MathView } from './MathView';
import confetti from 'canvas-confetti';

interface WeeklyChallengeProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
}

export const WeeklyChallenge: React.FC<WeeklyChallengeProps> = ({ currentUser, onActivityCompleted }) => {
  const [challenge, setChallenge] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Exam flow states
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 mins
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  const fetchChallengeData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/weekly-challenge');
      const data = await res.json();
      setChallenge(data.challenge);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeData();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isSubmitted, userAnswers]);

  const handleStartChallenge = () => {
    setIsStarted(true);
    setSecondsRemaining(15 * 60);
    setUserAnswers({});
    setIsSubmitted(false);
    setSubmitResult(null);
  };

  const handleSubmitAnswers = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const elapsedSeconds = 900 - secondsRemaining;
    try {
      const res = await fetch('/api/weekly-challenge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          displayName: currentUser.name,
          avatar: currentUser.avatar,
          answers: userAnswers,
          durationSeconds: elapsedSeconds,
        }),
      });

      const data = await res.json();
      setSubmitResult(data);
      setLeaderboard(data.leaderboard || []);

      if (data.score > 0) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        onActivityCompleted(data.score, `Hoàn thành Thử thách Tuần ${challenge.weekNumber}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !challenge) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-[#1B3D2F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Đang tải thử thách tuần & bảng xếp hạng thời gian thực...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              TUẦN {challenge.weekNumber} · MÚI GIỜ ASIA/HO_CHI_MINH
            </span>
            <span className="text-xs text-emerald-300">Độ khó: {challenge.difficulty}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-[#D6A64F]" />
            THỬ THÁCH XSTK TUẦN NÀY
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            {challenge.title}
          </p>
        </div>

        {/* Challenge Timing info */}
        <div className="bg-[#142d22] p-4 rounded-xl border border-emerald-800/80 min-w-[200px] text-xs text-emerald-200 space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#D6A64F]" />
            <span>Hạn nộp: 26/10/2026 23:59</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#D6A64F]" />
            <span>Thời lượng: 15 phút</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Challenge Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Business Scenario Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1B3D2F]">Tình huống ứng dụng thực tế</h3>
              {isStarted && !isSubmitted && (
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                  <Clock className="w-4 h-4" />
                  <span>Thời gian còn: {formatTimer(secondsRemaining)}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#F4F3EC] border border-slate-200 text-xs text-slate-800 leading-relaxed">
              <p className="font-semibold text-[#1B3D2F] mb-1">Bối cảnh doanh nghiệp:</p>
              <p>{challenge.businessScenario}</p>
            </div>

            {/* If Not Started */}
            {!isStarted && !isSubmitted && (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Đề thi gồm 3 câu hỏi liên hoàn vận dụng công thức Bayes, xác suất đầy đủ và phân phối nhị thức. Điểm số và thời gian làm bài sẽ được cập nhật thẳng vào <b>Bảng xếp hạng thời gian thực</b>.
                </p>
                <button
                  onClick={handleStartChallenge}
                  className="py-3 px-8 rounded-xl font-bold text-sm bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
                >
                  <Play className="w-4 h-4 text-[#D6A64F]" />
                  <span>BẮT ĐẦU LÀM BÀI (15 PHÚT)</span>
                </button>
              </div>
            )}

            {/* Questions List (During Test) */}
            {isStarted && !isSubmitted && (
              <div className="space-y-6 pt-2">
                {challenge.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-[#1B3D2F]">
                      Câu {idx + 1}: {q.text}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                            userAnswers[q.id] === optIdx
                              ? 'border-[#1B3D2F] bg-[#F4F3EC] font-semibold text-[#1B3D2F]'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={userAnswers[q.id] === optIdx}
                            onChange={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className="accent-[#1B3D2F]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmitAnswers}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#5B6F2B] text-white hover:bg-[#4d5e24] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-[#D6A64F]" />
                  <span>NỘP BÀI & CẬP NHẬT BẢNG XẾP HẠNG</span>
                </button>
              </div>
            )}

            {/* Results Review (After Submit) */}
            {isSubmitted && submitResult && (
              <div className="space-y-5 pt-2">
                <div className="p-5 rounded-2xl bg-[#F4F3EC] border border-[#D6A64F] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#5B6F2B] uppercase">Kết quả tuần này</span>
                    <h4 className="text-2xl font-extrabold text-[#1B3D2F]">
                      {submitResult.score} / 100 điểm
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Đúng {submitResult.correctCount} / {submitResult.totalQuestions} câu · Thời gian làm: {900 - secondsRemaining} giây
                    </p>
                  </div>
                  <button
                    onClick={handleStartChallenge}
                    className="py-2 px-3 rounded-lg text-xs font-semibold border border-[#1B3D2F] text-[#1B3D2F] hover:bg-emerald-50 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Làm lại
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Chi tiết đáp án & Lời giải:
                  </h4>
                  {submitResult.reviewDetails?.map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        item.isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Câu {idx + 1}: {item.text}</span>
                        <span className={item.isCorrect ? 'text-emerald-700' : 'text-red-600'}>
                          {item.isCorrect ? '✓ Đúng' : '✗ Sai'}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <b>Giải thích sư phạm:</b> {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Real Shared Leaderboard (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base text-[#1B3D2F] flex items-center gap-2">
              <Medal className="w-4 h-4 text-[#D6A64F]" />
              Bảng xếp hạng thật
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
              Live Server
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Quy tắc: Điểm cao hơn xếp trên; nếu bằng điểm thì thời gian hoàn thành ngắn hơn xếp trên.
          </p>

          <div className="space-y-2.5">
            {leaderboard.map((entry, idx) => {
              const isMe = entry.userId === currentUser.id;
              return (
                <div
                  key={entry.userId}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isMe
                      ? 'border-[#D6A64F] bg-[#F4F3EC] shadow-xs'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-[#D6A64F] text-[#1B3D2F]'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <img
                      src={entry.avatar}
                      alt={entry.displayName}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {entry.displayName} {isMe && '(Bạn)'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {Math.floor(entry.durationSeconds / 60)}p {entry.durationSeconds % 60}s
                      </p>
                    </div>
                  </div>

                  <span className="font-extrabold text-sm text-[#1B3D2F] shrink-0">
                    {entry.score}đ
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
