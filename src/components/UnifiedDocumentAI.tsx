import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  Eye, 
  Trash2, 
  PenTool, 
  Eraser, 
  AlertCircle,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Check,
  ChevronDown
} from 'lucide-react';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { MathView } from './MathView';
import { UserProfile } from '../types';

interface UnifiedDocumentAIProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
}

export const UnifiedDocumentAI: React.FC<UnifiedDocumentAIProps> = ({
  currentUser,
  onActivityCompleted,
}) => {
  // Mode switcher: 'generate' (Tải tài liệu tạo bài tập) or 'grade' (Tải bài làm chấm sửa sai)
  const [activeMode, setActiveMode] = useState<'generate' | 'grade'>('generate');

  // --- STATE FOR MODE 1: GENERATE PRACTICE ---
  const [docFile, setDocFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedTopic, setSelectedTopic] = useState<string>('Quy tắc xác suất & Công thức Bayes');
  const [difficulty, setDifficulty] = useState<'Cơ bản' | 'Trung bình' | 'Nâng cao'>('Trung bình');
  const [questionFormat, setQuestionFormat] = useState<'essay' | 'mcq'>('essay');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [activeProblemIdx, setActiveProblemIdx] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [studentAnswer, setStudentAnswer] = useState<string>('');

  // --- STATE FOR MODE 2: GRADE & ANALYZE SOLUTION ---
  const [solutionFile, setSolutionFile] = useState<{ name: string; previewUrl: string } | null>(null);
  const [problemNotes, setProblemNotes] = useState<string>('Giải bài toán kiểm định giả thuyết trung bình tuổi thọ thiết bị với n = 36, x̄ = 980h, s = 60h, μ0 = 1000h, mức ý nghĩa α = 0.05.');
  const [studentNotes, setStudentNotes] = useState<string>('Em đặt H0: μ = 1000, H1: μ < 1000. Tính Zqs = (980 - 1000) / (60 / √36) = -20 / 10 = -2.0. Tra z_0.05 = -1.645. Vì -2.0 < -1.645 nên bác bỏ H0.');
  const [suggestRevision, setSuggestRevision] = useState<boolean>(true);
  const [useWhiteboard, setUseWhiteboard] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<any | null>(null);

  // Whiteboard Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#1B3D2F');
  const [penSize, setPenSize] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Handle canvas drawing
  useEffect(() => {
    if (useWhiteboard && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [useWhiteboard]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    ctx.strokeStyle = isEraser ? '#ffffff' : penColor;
    ctx.lineWidth = isEraser ? 16 : penSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Mock file reader for documents
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setDocFile({
          name: file.name,
          size: sizeStr,
          content: text || `Tài liệu: ${file.name}. Nội dung giảng dạy Xác suất & Thống kê đại học.`,
        });
      };
      reader.readAsText(file);
    }
  };

  // Mock file reader for solutions
  const handleSolutionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSolutionFile({
          name: file.name,
          previewUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Action 1: Generate Practice Problems
  const handleGenerateProblems = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);
    setShowHint(false);
    setShowSolution(false);
    setActiveProblemIdx(0);

    try {
      const res = await fetch('/api/gemini/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: docFile?.content || '',
          fileName: docFile?.name || '',
          chapterId: selectedChapter,
          topic: selectedTopic,
          difficulty,
          format: questionFormat,
          count: questionCount,
        }),
      });

      const data = await res.json();
      setGeneratedResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Action 2: Grade and Analyze Solution
  const handleAnalyzeSolution = async () => {
    setIsGrading(true);
    setGradingResult(null);

    let drawingDataUrl = '';
    if (useWhiteboard && canvasRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL('image/png');
    }

    try {
      const res = await fetch('/api/gemini/analyze-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: problemNotes,
          studentNotes,
          solutionImage: solutionFile?.previewUrl || drawingDataUrl || '',
          suggestRevision,
        }),
      });

      const data = await res.json();
      setGradingResult(data);
      // Trigger study activity score to update streak
      onActivityCompleted(8.5, 'Chấm và sửa bài tập cùng AI');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Mandatory Single Unified Frame */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Frame Header */}
        <div className="bg-gradient-to-r from-[#1B3D2F] via-[#234d3c] to-[#1B3D2F] text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
                  GỘP CHỨC NĂNG DUY NHẤT
                </span>
                <span className="text-xs text-emerald-300">Chuẩn Study Studio</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                TÀI LIỆU & TRỢ LÝ AI XSTK
              </h2>
              <p className="mt-1.5 text-sm md:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
                Tải tài liệu để tạo bài tập hoặc tải bài làm để được AI nhận xét, phát hiện lỗi và gợi ý kiến thức cần ôn tập.
              </p>
            </div>

            {/* Mode Switcher Buttons inside the single frame */}
            <div className="flex bg-[#122a20] p-1.5 rounded-xl border border-emerald-700/50 shrink-0">
              <button
                onClick={() => setActiveMode('generate')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeMode === 'generate'
                    ? 'bg-[#D6A64F] text-[#1B3D2F] shadow-md ring-1 ring-white/20'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>1. Tải tài liệu tạo bài tập</span>
              </button>
              <button
                onClick={() => setActiveMode('grade')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeMode === 'grade'
                    ? 'bg-[#5B6F2B] text-white shadow-md ring-1 ring-[#D6A64F]/50'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>2. Tải bài làm chấm sửa sai</span>
              </button>
            </div>
          </div>
        </div>

        {/* Frame Body based on active mode */}
        <div className="p-6 md:p-8 space-y-6">
          {/* ============================================================== */}
          {/* MODE 1: TẢI TÀI LIỆU ĐỂ TẠO BÀI TẬP */}
          {/* ============================================================== */}
          {activeMode === 'generate' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Upload & Options Form (Left 5 cols) */}
                <div className="lg:col-span-5 space-y-5 bg-[#F4F3EC]/50 p-5 rounded-xl border border-slate-200">
                  <h3 className="text-base font-bold text-[#1B3D2F] flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-[#5B6F2B]" />
                    Nút 1 — Tải tài liệu & Cấu hình bài tập
                  </h3>
                  <p className="text-xs text-slate-600 leading-normal">
                    Tải bài giảng hoặc tài liệu XSTK để AI đọc nội dung thực tế và tạo đề luyện tập theo nội dung bạn đang học.
                  </p>

                  {/* File Upload Box */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tệp bài giảng (PDF, DOCX, PPTX, TXT, Ảnh)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#1B3D2F] transition-colors bg-white relative">
                      <input
                        type="file"
                        onChange={handleDocFileUpload}
                        accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {docFile ? (
                        <div className="flex items-center justify-between text-left">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#1B3D2F] truncate">{docFile.name}</p>
                            <p className="text-[11px] text-slate-500">Dung lượng: {docFile.size} · Đã đọc nội dung</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocFile(null);
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <FileUp className="w-7 h-7 mx-auto text-[#5B6F2B]" />
                          <p className="text-xs font-medium text-slate-700">Kéo thả tệp hoặc bấm để chọn tệp</p>
                          <p className="text-[11px] text-slate-400">PDF, DOCX, TXT, JPG, PNG (tối đa 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chapter & Topic Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chương kiến thức
                      </label>
                      <select
                        value={selectedChapter}
                        onChange={(e) => {
                          const cid = Number(e.target.value);
                          setSelectedChapter(cid);
                          const chap = CHAPTERS_DATA.find((c) => c.id === cid);
                          if (chap && chap.sections[0]) {
                            setSelectedTopic(chap.sections[0].title);
                          }
                        }}
                        className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                      >
                        {CHAPTERS_DATA.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            Chương {ch.id}: {ch.title.split(':')[1]?.trim() || ch.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Độ khó đề bài
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e: any) => setDifficulty(e.target.value)}
                        className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                      >
                        <option value="Cơ bản">Cơ bản (Nhận biết)</option>
                        <option value="Trung bình">Trung bình (Thông hiểu)</option>
                        <option value="Nâng cao">Nâng cao (Vận dụng cao)</option>
                      </select>
                    </div>
                  </div>

                  {/* Format & Count */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hình thức câu hỏi
                      </label>
                      <div className="flex gap-1.5 p-1 bg-white rounded-lg border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setQuestionFormat('essay')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                            questionFormat === 'essay'
                              ? 'bg-[#1B3D2F] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tự luận (5 bài)
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionFormat('mcq')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                            questionFormat === 'mcq'
                              ? 'bg-[#1B3D2F] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Trắc nghiệm
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số lượng câu hỏi
                      </label>
                      <select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                      >
                        <option value={3}>3 câu</option>
                        <option value={5}>5 câu (Mặc định chuẩn)</option>
                        <option value={10}>10 câu</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleGenerateProblems}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI đang phân tích tài liệu & tạo đề...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D6A64F]" />
                        <span>TẠO BÀI TẬP TỪ TÀI LIỆU</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Practice Workspace (Right 7 cols) */}
                <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-xl p-5 min-h-[460px]">
                  {generatedResult ? (
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-bold text-base text-[#1B3D2F]">
                            {generatedResult.title || 'Bộ đề luyện tập XSTK'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Độ khó: {difficulty} · Hình thức: {questionFormat === 'essay' ? 'Tự luận giải bước' : 'Trắc nghiệm 4 lựa chọn'}
                          </p>
                        </div>
                        {/* Question selector tabs */}
                        <div className="flex items-center gap-1.5">
                          {generatedResult.problems?.map((_: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveProblemIdx(idx);
                                setShowHint(false);
                                setShowSolution(false);
                                setStudentAnswer('');
                              }}
                              className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                                activeProblemIdx === idx
                                  ? 'bg-[#1B3D2F] text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Problem Display */}
                      {generatedResult.problems?.[activeProblemIdx] && (
                        <div className="space-y-4 flex-1">
                          <div className="bg-[#F4F3EC]/70 p-4 rounded-xl border border-[#D6A64F]/30">
                            <span className="text-[11px] font-bold text-[#5B6F2B] uppercase tracking-wide">
                              Câu {activeProblemIdx + 1} / {generatedResult.problems.length}
                            </span>
                            <div className="mt-2 text-sm text-slate-800 font-medium">
                              <MathView content={generatedResult.problems[activeProblemIdx].text} />
                            </div>

                            {/* Options if MCQ */}
                            {generatedResult.problems[activeProblemIdx].options && (
                              <div className="mt-3 space-y-2">
                                {generatedResult.problems[activeProblemIdx].options.map((opt: string, optIdx: number) => (
                                  <label
                                    key={optIdx}
                                    className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
                                  >
                                    <input type="radio" name={`mcq-${activeProblemIdx}`} className="accent-[#1B3D2F]" />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Student Answer Box (For Essay) */}
                          {questionFormat === 'essay' && (
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-700">
                                Bài làm / Nháp lời giải của bạn:
                              </label>
                              <textarea
                                value={studentAnswer}
                                onChange={(e) => setStudentAnswer(e.target.value)}
                                rows={4}
                                placeholder="Trình bày các bước: 1. Gọi biến cố, 2. Chọn công thức, 3. Thế số..."
                                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                              />
                            </div>
                          )}

                          {/* Hints and Solutions Toggle buttons */}
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowHint(!showHint)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý / Chiến lược giải'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setShowSolution(!showSolution);
                                if (!showSolution) {
                                  onActivityCompleted(10, 'Hoàn thành bài tập tự luyện từ tài liệu');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{showSolution ? 'Ẩn đáp số chi tiết' : 'Hiện lời giải chi tiết'}</span>
                            </button>
                          </div>

                          {/* Hint Box */}
                          {showHint && (
                            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1">
                              <p className="font-bold flex items-center gap-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Chiến lược tiếp cận:
                              </p>
                              <p className="leading-relaxed">
                                {generatedResult.problems[activeProblemIdx].hint || generatedResult.problems[activeProblemIdx].solutionStrategy}
                              </p>
                            </div>
                          )}

                          {/* Full Solution Box */}
                          {showSolution && (
                            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 text-xs text-emerald-950 space-y-2">
                              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                                <Check className="w-4 h-4 text-emerald-600" /> Lời giải mẫu & Đáp số:
                              </p>
                              <div className="leading-relaxed">
                                <MathView content={generatedResult.problems[activeProblemIdx].fullSolution} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-[#F4F3EC] flex items-center justify-center text-[#5B6F2B] border border-slate-200">
                        <FileUp className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Khu vực đề bài & Làm bài</h4>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        Hãy chọn tệp bài giảng ở khung bên trái hoặc chọn chương học và bấm <b>TẠO BÀI TẬP TỪ TÀI LIỆU</b> để bắt đầu luyện tập.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE 2: TẢI BÀI LÀM ĐỂ CHẤM VÀ SỬA SAI */}
          {/* ============================================================== */}
          {activeMode === 'grade' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Upload & Whiteboard (Left 6 cols) */}
                <div className="lg:col-span-6 space-y-5 bg-[#F4F3EC]/50 p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#1B3D2F] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#5B6F2B]" />
                        Nút 2 — Tải bài làm & Bảng viết trực tiếp
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Tải ảnh/PDF bài làm hoặc vẽ trực tiếp trên bảng viết để AI phân tích từng bước.
                      </p>
                    </div>

                    {/* Whiteboard / File Toggle */}
                    <div className="flex bg-white p-1 rounded-lg border border-slate-300">
                      <button
                        type="button"
                        onClick={() => setUseWhiteboard(false)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded ${
                          !useWhiteboard ? 'bg-[#1B3D2F] text-white' : 'text-slate-600'
                        }`}
                      >
                        Tải tệp ảnh/PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseWhiteboard(true)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 ${
                          useWhiteboard ? 'bg-[#1B3D2F] text-white' : 'text-slate-600'
                        }`}
                      >
                        <PenTool className="w-3 h-3" /> Bảng viết tay
                      </button>
                    </div>
                  </div>

                  {/* Mode A: Upload File */}
                  {!useWhiteboard ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Ảnh chụp bài làm hoặc PDF bài tập
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#1B3D2F] transition-colors bg-white relative">
                        <input
                          type="file"
                          onChange={handleSolutionFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {solutionFile ? (
                          <div className="space-y-2">
                            <img
                              src={solutionFile.previewUrl}
                              alt="Bài làm"
                              className="max-h-40 mx-auto rounded-lg object-contain border border-slate-200"
                            />
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700 truncate">{solutionFile.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSolutionFile(null);
                                }}
                                className="text-red-500 font-bold hover:underline"
                              >
                                Tải lại / Xóa
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <CheckCircle2 className="w-7 h-7 mx-auto text-[#5B6F2B]" />
                            <p className="text-xs font-medium text-slate-700">Chọn ảnh bài làm viết tay hoặc PDF</p>
                            <p className="text-[11px] text-slate-400">JPG, PNG, WebP hoặc PDF bài tập</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode B: Canvas Whiteboard */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEraser(false)}
                            className={`p-1.5 rounded ${!isEraser ? 'bg-[#1B3D2F] text-white' : 'text-slate-600'}`}
                            title="Bút vẽ"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEraser(true)}
                            className={`p-1.5 rounded ${isEraser ? 'bg-[#1B3D2F] text-white' : 'text-slate-600'}`}
                            title="Tẩy"
                          >
                            <Eraser className="w-3.5 h-3.5" />
                          </button>

                          {/* Color choices */}
                          <div className="flex items-center gap-1 ml-2">
                            {['#1B3D2F', '#0284c7', '#dc2626', '#16a34a'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setPenColor(c);
                                  setIsEraser(false);
                                }}
                                className={`w-4 h-4 rounded-full border ${penColor === c && !isEraser ? 'ring-2 ring-slate-400' : ''}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Xóa bảng
                        </button>
                      </div>

                      <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
                        <canvas
                          ref={canvasRef}
                          width={480}
                          height={220}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full cursor-crosshair bg-white touch-none"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Dùng chuột hoặc bút cảm ứng để viết công thức toán học trực tiếp lên bảng.
                      </p>
                    </div>
                  )}

                  {/* Problem & Solution Text Notes */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ghi chú đề bài (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={problemNotes}
                        onChange={(e) => setProblemNotes(e.target.value)}
                        placeholder="Nhập ngắn gọn đề bài hoặc yêu cầu bài toán..."
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Lời giải / Ghi chú bước làm của bạn
                      </label>
                      <textarea
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        rows={3}
                        placeholder="Mô tả các bước bạn đã giải hoặc ghi chú thêm cho AI..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                      />
                    </div>
                  </div>

                  {/* Mandatory Toggle: Gợi ý phần kiến thức nên ôn kỹ */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={suggestRevision}
                      onChange={(e) => setSuggestRevision(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1B3D2F] accent-[#1B3D2F] focus:ring-0"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#1B3D2F]">
                        ☑ Gợi ý những phần kiến thức tôi nên ôn kỹ
                      </span>
                      <p className="text-[11px] text-slate-500">
                        AI sẽ chỉ ra chương, công thức liên quan đến lỗi và gợi ý bài tập củng cố ưu tiên.
                      </p>
                    </div>
                  </label>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyzeSolution}
                    disabled={isGrading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#5B6F2B] text-white hover:bg-[#4d5e24] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isGrading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI đang kiểm tra từng bước giải...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#D6A64F]" />
                        <span>PHÂN TÍCH BÀI LÀM</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Analysis Results Display (Right 6 cols) */}
                <div className="lg:col-span-6 flex flex-col bg-white border border-slate-200 rounded-xl p-5 min-h-[460px]">
                  {gradingResult ? (
                    <div className="space-y-4 flex-1">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-base text-[#1B3D2F] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#D6A64F]" /> Kết quả Chấm & Nhận xét sư phạm
                          </h4>
                          <p className="text-xs text-slate-500">
                            {gradingResult.source === 'gemini' ? 'Phân tích bởi Gemini 3.8 Flash' : 'Phân tích từ mô hình chuẩn sư phạm'}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Đã hoàn thành
                        </span>
                      </div>

                      {/* If text returned directly */}
                      {gradingResult.analysisText ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-[420px] overflow-y-auto">
                          <MathView content={gradingResult.analysisText} />
                        </div>
                      ) : (
                        /* Structured review */
                        <div className="space-y-4 text-xs text-slate-800">
                          {/* Correct Steps */}
                          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                            <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Các bước làm đúng:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {gradingResult.correctSteps?.map((st: string, i: number) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Detected Errors & Causes */}
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                            <p className="font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-600" /> Lỗi phát hiện & Nguyên nhân:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {gradingResult.detectedErrors?.map((err: string, i: number) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                            <p className="pt-1 text-[11px] text-amber-800 font-medium">
                              <b>Nguyên nhân:</b> {gradingResult.possibleCauses}
                            </p>
                          </div>

                          {/* 4-step pedagogy review */}
                          {gradingResult.pedagogyStepsReview && (
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                              <p className="font-bold text-[#1B3D2F]">Đánh giá theo 4 bước sư phạm:</p>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 bg-white rounded border border-slate-200">
                                  <b>Bước 1 (Hiểu đề):</b> {gradingResult.pedagogyStepsReview.step1}
                                </div>
                                <div className="p-2 bg-white rounded border border-slate-200">
                                  <b>Bước 2 (Chiến lược):</b> {gradingResult.pedagogyStepsReview.step2}
                                </div>
                                <div className="p-2 bg-white rounded border border-slate-200">
                                  <b>Bước 3 (Trình bày):</b> {gradingResult.pedagogyStepsReview.step3}
                                </div>
                                <div className="p-2 bg-white rounded border border-slate-200">
                                  <b>Bước 4 (Đánh giá):</b> {gradingResult.pedagogyStepsReview.step4}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Recommended Revision Task (if enabled) */}
                          {gradingResult.recommendedRevision && (
                            <div className="p-4 rounded-xl bg-[#F4F3EC] border border-[#D6A64F] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#1B3D2F] flex items-center gap-1.5 text-xs">
                                  <BookOpen className="w-4 h-4 text-[#5B6F2B]" /> Kế hoạch ôn tập đề xuất:
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D6A64F] text-[#1B3D2F]">
                                  {gradingResult.recommendedRevision.priority}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800">
                                {gradingResult.recommendedRevision.chapterTitle} — {gradingResult.recommendedRevision.topicTitle}
                              </p>
                              <p className="text-[11px] text-slate-600">
                                <b>Lý do:</b> {gradingResult.recommendedRevision.reason}
                              </p>
                              <p className="text-[11px] text-[#5B6F2B] font-medium">
                                <b>Bài tập rèn luyện:</b> {gradingResult.recommendedRevision.practiceSuggestion}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-[#F4F3EC] flex items-center justify-center text-[#5B6F2B] border border-slate-200">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Khu vực Nhận xét & Sửa lỗi AI</h4>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        Tải ảnh bài làm hoặc vẽ lên bảng viết tay, sau đó nhấn <b>PHÂN TÍCH BÀI LÀM</b> để xem chi tiết nhận xét từng bước và kế hoạch củng cố kiến thức.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
