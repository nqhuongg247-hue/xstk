import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  BarChart3, 
  Plus, 
  Clock, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { AIReportTicket, UserProfile } from '../types';

interface ErrorStatsAndReportsProps {
  currentUser: UserProfile;
}

export const ErrorStatsAndReports: React.FC<ErrorStatsAndReportsProps> = ({ currentUser }) => {
  const [reports, setReports] = useState<AIReportTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [complaintText, setComplaintText] = useState<string>('');
  const [questionContext, setQuestionContext] = useState<string>('');
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [category, setCategory] = useState<'Sai công thức' | 'Sai tính toán' | 'Vi phạm 4 bước sư phạm' | 'Khác'>('Sai công thức');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          questionContext,
          aiResponse: aiResponseText,
          userComplaint: complaintText,
          reportCategory: category,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setComplaintText('');
        setQuestionContext('');
        setAiResponseText('');
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              KIỂM ĐỊNH CHẤT LƯỢNG HỌC TẬP
            </span>
            <span className="text-xs text-emerald-300">Minh bạch & Chuẩn mực</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-[#D6A64F]" />
            BÁO CÁO LỖI AI & THỐNG KÊ LỖI
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Hệ thống theo dõi phân loại sai sót của sinh viên và cơ chế tiếp nhận phản hồi câu trả lời nghi ngờ sai từ Gia sư AI với mã định danh máy chủ.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-3 px-5 rounded-xl font-bold text-xs md:text-sm bg-[#D6A64F] text-[#1B3D2F] hover:bg-amber-400 transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Gửi báo cáo lỗi AI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Student Mistakes Taxonomy (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base text-[#1B3D2F] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#5B6F2B]" />
              Phân loại sai sót của sinh viên
            </h3>
            <span className="text-xs font-semibold text-slate-500">Kỳ học 2026</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Category 1 */}
            <div className="p-4 rounded-xl bg-[#F4F3EC] border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold text-[#1B3D2F]">
                <span>1. Lỗi khái niệm & Điều kiện áp dụng</span>
                <span>42% trường hợp</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1B3D2F] w-[42%]" />
              </div>
              <p className="text-[11px] text-slate-600">
                Nhầm lẫn giữa <i>biến cố độc lập</i> và <i>biến cố xung khắc</i>; áp dụng phân phối Poisson khi $\lambda$ không cố định.
              </p>
            </div>

            {/* Category 2 */}
            <div className="p-4 rounded-xl bg-[#F4F3EC] border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold text-[#5B6F2B]">
                <span>2. Lỗi công thức ước lượng & kiểm định</span>
                <span>33% trường hợp</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#5B6F2B] w-[33%]" />
              </div>
              <p className="text-[11px] text-slate-600">
                Dùng $n$ thay vì $n-1$ cho phương sai mẫu $s^2$; chọn nhầm giá trị tới hạn 1 phía và 2 phía.
              </p>
            </div>

            {/* Category 3 */}
            <div className="p-4 rounded-xl bg-[#F4F3EC] border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold text-amber-800">
                <span>3. Lỗi tính toán & làm tròn số</span>
                <span>25% trường hợp</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 w-[25%]" />
              </div>
              <p className="text-[11px] text-slate-600">
                Làm tròn trung gian quá sớm dẫn đến lệch đáp án trắc nghiệm; nhầm dấu âm dương khi chuẩn hóa $Z$.
              </p>
            </div>
          </div>
        </div>

        {/* Right: AI Error Reports Tracking (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base text-[#1B3D2F] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D6A64F]" />
              Danh sách Báo cáo lỗi AI máy chủ
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{reports.length} phiếu</span>
          </div>

          <p className="text-xs text-slate-500">
            Mọi phiếu báo cáo đều được gắn mã ID và xác minh bởi hội đồng sư phạm trước khi công nhận.
          </p>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-center py-6 text-xs text-slate-400">Đang tải phiếu báo cáo...</p>
            ) : reports.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">Chưa có báo cáo nào.</p>
            ) : (
              reports.map((rep) => {
                const isVerifiedError = rep.status.includes('Lỗi AI');
                return (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#5B6F2B]" />
                        Mã: {rep.id}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isVerifiedError
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <b>Nội dung khiếu nại:</b> {rep.userComplaint}
                    </p>

                    {rep.reviewNote && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                        <b>Ghi chú xác minh của hội đồng:</b> {rep.reviewNote}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>Người gửi: {rep.userName}</span>
                      <span>{new Date(rep.submittedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Report Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1B3D2F]">Gửi phiếu phản hồi nghi ngờ lỗi AI</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Danh mục phát hiện lỗi</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Sai công thức">Sai công thức toán học</option>
                  <option value="Sai tính toán">Sai tính toán số học</option>
                  <option value="Vi phạm 4 bước sư phạm">Vi phạm quy trình 4 bước sư phạm</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đề bài hoặc Ngữ cảnh</label>
                <input
                  type="text"
                  value={questionContext}
                  onChange={(e) => setQuestionContext(e.target.value)}
                  placeholder="Ví dụ: Bài toán kiểm định giả thuyết tuổi thọ..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả cụ thể điểm chưa chính xác</label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={4}
                  placeholder="Chỉ rõ bước hoặc công thức bạn thấy AI làm sai để hội đồng đối chiếu..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-lg font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-lg font-bold bg-[#1B3D2F] text-white hover:bg-[#153125]"
                >
                  {isSubmitting ? 'Đang tạo mã phiếu...' : 'Gửi phiếu báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
