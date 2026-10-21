import React, { useState } from 'react';
import { 
  Flame, 
  Calendar, 
  Award, 
  User, 
  ChevronDown, 
  Bell, 
  Info,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { UserProfile, StreakData, StudyActivity } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  streakData: StreakData;
  recentActivities: StudyActivity[];
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  streakData,
  recentActivities,
  onOpenProfile,
  onOpenAuth,
}) => {
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);

  // Generate days for past 14 days calendar tracker
  const pastDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const isoDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    const dayLabel = d.getDate();
    const hasStudied = streakData.history?.includes(isoDate);

    return { isoDate, dayLabel, hasStudied };
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 select-none shadow-xs sticky top-0 z-30">
      {/* Left: Study status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">Study Studio XSTK</span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline text-slate-500">Kỳ thi học kỳ 2026</span>
        </div>
      </div>

      {/* Right: Streak & Profile */}
      <div className="flex items-center gap-3">
        {/* Streak Button */}
        <button
          onClick={() => setShowStreakModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 transition-all text-xs"
        >
          <span className="text-base animate-bounce">🔥</span>
          <div className="text-left">
            <span className="font-extrabold text-amber-900 block leading-tight">
              {streakData.currentStreak} Ngày
            </span>
            <span className="text-[10px] text-amber-700 leading-tight">Chuỗi học thực tế</span>
          </div>
        </button>

        {/* Login / Auth Button */}
        <button
          onClick={onOpenAuth}
          className="px-3 py-1.5 rounded-xl bg-[#1B3D2F] text-white hover:bg-[#153125] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <User className="w-3.5 h-3.5 text-[#D6A64F]" />
          <span>{currentUser.provider ? 'Đổi tài khoản' : 'Đăng nhập'}</span>
        </button>

        {/* User Card */}
        <div
          onClick={onOpenProfile}
          title="Xem chi tiết hồ sơ cá nhân"
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-200 transition-colors"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-[#D6A64F]/50"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight">
              {currentUser.provider === 'phone' ? `SĐT: ${currentUser.phone}` : currentUser.provider === 'google' ? 'Google' : currentUser.email}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
        </div>
      </div>

      {/* Streak Calendar Tracker Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h3 className="font-bold text-base text-[#1B3D2F]">Chuỗi ngày học liên tục</h3>
              </div>
              <button
                onClick={() => setShowStreakModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Streak Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-slate-600 block text-[11px]">Chuỗi hiện tại</span>
                <span className="text-2xl font-black text-amber-900">{streakData.currentStreak} Ngày</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-slate-600 block text-[11px]">Kỷ lục cá nhân</span>
                <span className="text-2xl font-black text-emerald-900">{streakData.longestStreak} Ngày</span>
              </div>
            </div>

            {/* Calendar Tracker */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700">Lịch sử 14 ngày qua (Asia/Ho_Chi_Minh):</span>
              <div className="grid grid-cols-7 gap-1.5">
                {pastDays.map((d) => (
                  <div
                    key={d.isoDate}
                    title={`${d.isoDate}: ${d.hasStudied ? 'Đã hoàn thành bài tập' : 'Chưa học'}`}
                    className={`h-11 rounded-lg border flex flex-col items-center justify-center text-[10px] ${
                      d.hasStudied
                        ? 'bg-[#1B3D2F] text-[#D6A64F] font-bold border-[#1B3D2F]'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span>{d.dayLabel}</span>
                    <span>{d.hasStudied ? '✓' : '·'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules reminder */}
            <div className="p-3 rounded-xl bg-[#F4F3EC] border border-slate-200 text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Quy tắc tính chuỗi ngày học:</p>
              <p className="text-[11px] leading-relaxed">
                Chỉ khi bạn hoàn thành bài tập, trắc nghiệm, thi thử hoặc câu hỏi phòng thí nghiệm và đạt điểm dương (&gt;0) thì hệ thống mới ghi nhận ngày học. Mở web đơn thuần không được tính streak.
              </p>
            </div>

            <button
              onClick={() => setShowStreakModal(false)}
              className="w-full py-2.5 rounded-xl font-bold bg-[#1B3D2F] text-white hover:bg-[#153125]"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
