import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  HelpCircle,
  Lightbulb,
  Download,
  ExternalLink,
  Eye,
  FileCheck
} from 'lucide-react';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { MathView } from './MathView';
import { UserProfile } from '../types';

interface KnowledgeBaseProps {
  currentUser: UserProfile;
  initialChapterId?: number;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ currentUser, initialChapterId = 1 }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(initialChapterId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingPdfModal, setViewingPdfModal] = useState<string | null>(null);

  const currentChapter = CHAPTERS_DATA.find((c) => c.id === selectedChapterId) || CHAPTERS_DATA[0];

  const filteredSections = currentChapter.sections.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              KHO KIẾN THỨC 7 BÀI GIẢNG ĐẠI HỌC
            </span>
            <span className="text-xs text-emerald-300">Kèm Slide PDF chính thức</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[#D6A64F]" />
            KHO KIẾN THỨC XSTK
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Hệ thống hóa toàn bộ 7 bài giảng đại học: Xác suất, Biến ngẫu nhiên, Các phân phối thông dụng, Mẫu ngẫu nhiên, Ước lượng khoảng, Kiểm định giả thiết và So sánh các tham số.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công thức, định lý..."
            className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6A64F]"
          />
        </div>
      </div>

      {/* Chapters Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CHAPTERS_DATA.map((ch) => {
          const isActive = ch.id === selectedChapterId;
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChapterId(ch.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-[#1B3D2F] text-white shadow-xs ring-1 ring-[#D6A64F]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Bài {ch.id}: {ch.title.split(':')[1]?.trim() || ch.title}
            </button>
          );
        })}
      </div>

      {/* Chapter Overview & Attached University PDF Slide Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#5B6F2B] uppercase">Tài liệu học tập chính thức</span>
            <h3 className="text-xl font-bold text-[#1B3D2F] mt-0.5">{currentChapter.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{currentChapter.description}</p>
          </div>

          {/* PDF Action Bar */}
          {currentChapter.pdfPath && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewingPdfModal(currentChapter.pdfPath || null)}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-[#D6A64F]" />
                <span>Xem Slide bài giảng PDF</span>
              </button>
              <a
                href={currentChapter.pdfPath}
                download
                className="py-2.5 px-3 rounded-xl font-semibold text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                title="Tải tệp PDF về máy"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Section Cards */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5"
          >
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-[#1B3D2F] flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#5B6F2B]" />
                {section.title}
              </h4>
            </div>

            {/* Key Formulas */}
            <div className="p-4 rounded-xl bg-[#F4F3EC] border border-[#D6A64F]/50 space-y-2">
              <span className="text-xs font-bold text-[#1B3D2F] flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#D6A64F]" /> Công thức cốt lõi:
              </span>
              <div className="space-y-1.5">
                {section.keyFormulas.map((f, i) => (
                  <div key={i} className="text-xs md:text-sm font-medium text-slate-900 overflow-x-auto py-0.5">
                    <MathView content={`$$${f}$$`} displayMode={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Theory Explanation */}
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-900">Bản chất lý thuyết & Điều kiện áp dụng:</p>
              <MathView content={section.content} />
            </div>

            {/* Examples with step-by-step solutions */}
            {section.examples && section.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="font-bold text-xs text-[#5B6F2B] uppercase tracking-wide">
                  Bài tập mẫu trích từ bài giảng có lời giải:
                </p>

                {section.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5"
                  >
                    <p className="font-bold text-slate-800">
                      Ví dụ {exIdx + 1}: <MathView content={ex.problem} />
                    </p>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                      <p className="font-semibold text-emerald-800 mb-1">Lời giải chi tiết:</p>
                      <MathView content={ex.solution} />
                    </div>

                    {ex.tips && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><b>Ghi chú sư phạm:</b> {ex.tips}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Embedded PDF Slide Viewer Modal */}
      {viewingPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 md:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#1B3D2F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D6A64F]" />
                <h4 className="font-bold text-sm">Slide bài giảng gốc: {currentChapter.title}</h4>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={viewingPdfModal}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở tab mới
                </a>
                <button
                  onClick={() => setViewingPdfModal(null)}
                  className="p-1 rounded text-white hover:bg-emerald-900"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={viewingPdfModal}
                title="Bài giảng PDF"
                className="w-full h-full rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
