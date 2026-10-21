import React from 'react';
import { User, Mail, School, Award, CheckCircle, Clock, BookOpen, ShieldCheck } from 'lucide-react';
import { UserProfile, StreakData, StudyActivity } from '../types';
import { USERS_LIST } from './Sidebar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  streakData: StreakData;
  activities: StudyActivity[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  streakData,
  activities,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-base text-[#1B3D2F]">Hồ sơ cá nhân & Tài khoản</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#F4F3EC] border border-[#D6A64F]/40">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#D6A64F]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-[#1B3D2F]">{currentUser.name}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#1B3D2F] text-white">
                {currentUser.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-emerald-800 font-semibold">{currentUser.university}</p>
          </div>
        </div>

        {/* Switch Account Section */}
        <div className="space-y-2">
          <span className="font-bold text-slate-800">Chuyển đổi tài khoản (Kiểm thử diễn đàn & streak):</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {USERS_LIST.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onSwitchUser(u);
                  onClose();
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  currentUser.id === u.id
                    ? 'border-[#1B3D2F] bg-[#1B3D2F] text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="truncate font-semibold">{u.name}</p>
                <p className={`text-[10px] truncate ${currentUser.id === u.id ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {u.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Study Activities */}
        <div className="space-y-2">
          <span className="font-bold text-slate-800">Hoạt động học tập gần đây (Đủ điều kiện Streak):</span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-slate-400 italic py-2">Chưa ghi nhận hoạt động nào hôm nay.</p>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(act.completedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-700 shrink-0 ml-2">
                    +{act.score} điểm
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold bg-[#1B3D2F] text-white hover:bg-[#153125]"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
