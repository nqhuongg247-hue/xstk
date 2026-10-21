import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Clock, 
  CheckCircle, 
  RotateCcw, 
  Flag, 
  Award, 
  ChevronRight, 
  AlertCircle,
  Play
} from 'lucide-react';
import { MathView } from './MathView';
import { UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface PracticeSelfTestProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
}

export const PracticeSelfTest: React.FC<PracticeSelfTestProps> = ({ currentUser, onActivityCompleted }) => {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(45 * 60);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [flags, setFlags] = useState<{ [qId: string]: boolean }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const mockQuestions = [
    {
      id: 'st-1',
      text: 'Gieo 3 đồng xu cân đối đồng chất. Xác suất xuất hiện ít nhất một mặt ngửa là:',
      options: ['A. 1/8', 'B. 3/8', 'C. 7/8', 'D. 1/2'],
      correctIndex: 2,
      explanation: 'Biến cố đối là cả 3 đồng đều sấp với P = (1/2)^3 = 1/8. Vậy P(ít nhất 1 ngửa) = 1 - 1/8 = 7/8.',
    },
    {
      id: 'st-2',
      text: 'Cho hai biến cố A và B độc lập với P(A) = 0.4 và P(B) = 0.5. Xác suất P(A + B) bằng:',
      options: ['A. 0.9', 'B. 0.7', 'C. 0.2', 'D. 0.8'],
      correctIndex: 1,
      explanation: 'P(A + B) = P(A) + P(B) - P(AB) = 0.4 + 0.5 - (0.4 * 0.5) = 0.9 - 0.2 = 0.7.',
    },
    {
      id: 'st-3',
      text: 'Tỷ lệ phế phẩm của một máy là 5%. Chọn ngẫu nhiên 20 sản phẩm. Số phế phẩm kỳ vọng E(X) và phương sai Var(X) là:',
      options: ['A. E=1, Var=0.95', 'B. E=1, Var=1', 'C. E=2, Var=1.9', 'D. E=0.05, Var=0.0475'],
      correctIndex: 0,
      explanation: 'X ~ B(20, 0.05). E(X) = np = 1. Var(X) = np(1-p) = 20 * 0.05 * 0.95 = 0.95.',
    },
    {
      id: 'st-4',
      text: 'Cho X có phân phối Poisson với Var(X) = 9. Xác suất P(X = 0) bằng:',
      options: ['A. e^{-3}', 'B. e^{-9}', 'C. 9 e^{-9}', 'D. 0'],
      correctIndex: 1,
      explanation: 'Với phân phối Poisson, Var(X) = λ = 9. P(X = 0) = (e^{-9} * 9^0) / 0! = e^{-9}.',
    },
    {
      id: 'st-5',
      text: 'Biến ngẫu nhiên liên tục X ~ N(μ = 50, σ² = 16). Giá trị Z chuẩn hóa ứng với X = 58 là:',
      options: ['A. Z = 0.5', 'B. Z = 2.0', 'C. Z = 1.5', 'D. Z = 4.0'],
      correctIndex: 1,
      explanation: 'Độ lệch chuẩn σ = √16 = 4. Z = (X - μ) / σ = (58 - 50) / 4 = 2.0.',
    },
    {
      id: 'st-6',
      text: 'Theo định lý giới hạn trung tâm (CLT), khi cỡ mẫu n lớn (n >= 30), trung bình mẫu x̄ có phân phối:',
      options: ['A. Poisson', 'B. Nhị thức', 'C. Xấp xỉ chuẩn N(μ, σ²/n)', 'D. Phân phối đều'],
      correctIndex: 2,
      explanation: 'CLT khẳng định trung bình mẫu x̄ hội tụ về phân phối chuẩn N(μ, σ²/n) khi n đủ lớn.',
    },
    {
      id: 'st-7',
      text: 'Mẫu n = 64 có trung bình x̄ = 12, độ lệch chuẩn mẫu s = 2. Khoảng tin cậy 95% cho μ (z_{0.025} = 1.96) là:',
      options: ['A. [11.51, 12.49]', 'B. [10.04, 13.96]', 'C. [11.80, 12.20]', 'D. [11.00, 13.00]'],
      correctIndex: 0,
      explanation: 'Sai số: ε = 1.96 * (2 / √64) = 1.96 * 0.25 = 0.49. Khoảng tin cậy: [12 - 0.49, 12 + 0.49] = [11.51, 12.49].',
    },
    {
      id: 'st-8',
      text: 'Trong kiểm định giả thuyết H0: μ = μ0 đối kháng H1: μ > μ0, đây là kiểm định:',
      options: ['A. Hai phía', 'B. Một phía bên phải', 'C. Một phía bên trái', 'D. Không xác định'],
      correctIndex: 1,
      explanation: 'Dấu > ở đối thuyết H1 xác định miền bác bỏ nằm ở phía bên phải.',
    },
  ];

  // Timer
  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isSubmitted]);

  const handleStart = () => {
    setIsStarted(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setFlags({});
    setCurrentIdx(0);
    setSecondsLeft(45 * 60);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correct = 0;
    mockQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });

    const score = Math.round((correct / mockQuestions.length) * 10);
    if (score > 0) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onActivityCompleted(score, 'Thi thử XSTK chuẩn 45 phút');
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const correctCount = mockQuestions.filter((q) => userAnswers[q.id] === q.correctIndex).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              ĐỀ THI ĐỊNH KỲ CHUẨN ĐẠI HỌC
            </span>
            <span className="text-xs text-emerald-300">Format 45 Phút</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Timer className="w-7 h-7 text-[#D6A64F]" />
            THI THỬ XSTK 45 PHÚT
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Mô phỏng kỳ thi giữa kỳ và kết thúc học phần môn Xác suất Thống kê với đồng hồ đếm ngược và chứng chỉ kết quả.
          </p>
        </div>
      </div>

      {!isStarted && !isSubmitted && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F4F3EC] flex items-center justify-center text-[#1B3D2F] mx-auto border border-slate-200">
            <Timer className="w-8 h-8 text-[#5B6F2B]" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Quy chế phòng thi thử nghiệm</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Thời gian làm bài: <b>45 phút</b> · Số câu: <b>{mockQuestions.length} câu trắc nghiệm 4 lựa chọn</b>.
              Điểm số sẽ được ghi nhận vào hồ sơ học tập và cộng chuỗi streak.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="py-3.5 px-8 rounded-xl font-bold text-sm bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
          >
            <Play className="w-4 h-4 text-[#D6A64F]" />
            <span>BẮT ĐẦU TÍNH GIỜ LÀM BÀI</span>
          </button>
        </div>
      )}

      {isStarted && !isSubmitted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 text-xs">
              <span className="font-bold text-[#5B6F2B] uppercase">
                Câu {currentIdx + 1} / {mockQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const qId = mockQuestions[currentIdx].id;
                  setFlags((prev) => ({ ...prev, [qId]: !prev[qId] }));
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
                  flags[mockQuestions[currentIdx].id] ? 'bg-amber-100 text-amber-900 border-amber-300' : 'border-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flags[mockQuestions[currentIdx].id] ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F3EC] text-sm text-slate-800 font-medium">
              <MathView content={mockQuestions[currentIdx].text} />
            </div>

            <div className="space-y-2.5 pt-2">
              {mockQuestions[currentIdx].options.map((opt, optIdx) => {
                const qId = mockQuestions[currentIdx].id;
                const isSelected = userAnswers[qId] === optIdx;
                return (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                      isSelected ? 'border-[#1B3D2F] bg-emerald-50/50 font-bold text-[#1B3D2F]' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`st-${qId}`}
                      checked={isSelected}
                      onChange={() => setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }))}
                      className="accent-[#1B3D2F]"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((p) => p - 1)}
                className="py-2 px-4 rounded-lg font-semibold text-xs border border-slate-200 disabled:opacity-40"
              >
                Câu trước
              </button>
              <button
                disabled={currentIdx === mockQuestions.length - 1}
                onClick={() => setCurrentIdx((p) => p + 1)}
                className="py-2 px-4 rounded-lg font-semibold text-xs bg-[#1B3D2F] text-white disabled:opacity-40"
              >
                Câu sau
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-1">
              <span className="text-xs text-red-700 font-semibold">Thời gian còn lại</span>
              <div className="text-2xl font-black text-red-600 tracking-wider">{formatTimer(secondsLeft)}</div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Mục lục câu hỏi:</span>
              <div className="grid grid-cols-4 gap-2">
                {mockQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flags[q.id];
                  const isCurrent = currentIdx === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all relative ${
                        isCurrent
                          ? 'ring-2 ring-[#D6A64F] bg-[#1B3D2F] text-white'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#5B6F2B] text-white hover:bg-[#4d5e24] transition-all shadow-sm"
            >
              NỘP BÀI THI 45 PHÚT
            </button>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
            <div>
              <span className="text-xs font-bold text-[#5B6F2B] uppercase">Báo cáo thi thử 45 phút</span>
              <h3 className="text-2xl font-black text-[#1B3D2F]">
                {Math.round((correctCount / mockQuestions.length) * 10)} / 10 Điểm
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Đúng {correctCount} / {mockQuestions.length} câu · Đã ghi nhận chuỗi ngày học thành công
              </p>
            </div>
            <button
              onClick={handleStart}
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#1B3D2F] text-white flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại bài thi
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Chi tiết lời giải:</h4>
            {mockQuestions.map((q, idx) => {
              const userChoice = userAnswers[q.id];
              const isCorrect = userChoice === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-800">Câu {idx + 1}: {q.text}</span>
                    <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                      {isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </span>
                  </div>
                  <p className="text-slate-600"><b>Đáp án đúng:</b> {q.options[q.correctIndex]}</p>
                  <p className="text-slate-600"><b>Giải thích:</b> {q.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
