import React, { useState } from 'react';
import { 
  BookOpen, 
  Bot, 
  FileText, 
  Compass, 
  FlaskConical, 
  Trophy, 
  Sparkles, 
  Timer, 
  Network, 
  MessageSquare, 
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  LogIn,
  User,
  MoreVertical,
  Check
} from 'lucide-react';
import { UserProfile, GUEST_USER } from '../types';

export type NavTab = 
  | 'overview'
  | 'knowledge' 
  | 'tutor' 
  | 'unified_doc' 
  | 'roadmap' 
  | 'lab' 
  | 'weekly_challenge' 
  | 'custom_exam' 
  | 'standard_exam' 
  | 'mindmap' 
  | 'forum' 
  | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onOpenAuth: () => void;
  streakDays: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const USERS_LIST: UserProfile[] = [
  {
    id: 'user-student-1',
    name: 'Nguyễn Quang Hương',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    email: 'nqhuongg247@gmail.com',
    provider: 'google',
    role: 'student',
    university: 'Đại học Kinh tế Quốc dân'
  },
  {
    id: 'user-student-2',
    name: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    email: 'mai.tt23@ftu.edu.vn',
    phone: '0988776655',
    provider: 'phone',
    role: 'student',
    university: 'Đại học Ngoại thương'
  },
  {
    id: 'user-lecturer-1',
    name: 'TS. Nguyễn Văn Tuấn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    email: 'tuan.nv@lecturer.edu.vn',
    provider: 'email',
    role: 'lecturer',
    university: 'Bộ môn Toán Kinh tế & XSTK'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  onOpenAuth,
  streakDays,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  // Clean nav items without distracting badges
  const navItems = [
    { id: 'overview' as NavTab, label: 'Tổng quan nền tảng', icon: LayoutDashboard },
    { id: 'knowledge' as NavTab, label: 'Kho kiến thức 7 chương', icon: BookOpen },
    { id: 'tutor' as NavTab, label: 'Gia sư AI & Giọng nói', icon: Bot },
    { id: 'roadmap' as NavTab, label: 'Lộ trình học XSTK', icon: Compass },
    { id: 'lab' as NavTab, label: 'Phòng thí nghiệm xác suất', icon: FlaskConical },
    { id: 'unified_doc' as NavTab, label: 'Tài liệu & Trợ lý học tập', icon: FileText },
    { id: 'weekly_challenge' as NavTab, label: 'Thử thách tuần & Xếp hạng', icon: Trophy },
    { id: 'custom_exam' as NavTab, label: 'Luyện tập & Tạo đề thi', icon: Sparkles },
    { id: 'standard_exam' as NavTab, label: 'Thi thử XSTK 45 phút', icon: Timer },
    { id: 'mindmap' as NavTab, label: 'Sơ đồ tư duy XSTK', icon: Network },
    { id: 'forum' as NavTab, label: 'Diễn đàn học tập', icon: MessageSquare },
    { id: 'reports' as NavTab, label: 'Báo cáo lỗi & Thống kê', icon: AlertTriangle },
  ];

  const isGuest = currentUser.isGuest || currentUser.role === 'guest';

  const handleLogout = () => {
    onSwitchUser(GUEST_USER);
    setShowAccountMenu(false);
  };

  return (
    <aside 
      className={`bg-[#1B3D2F] text-white flex flex-col h-screen shrink-0 border-r border-[#1B3D2F]/30 select-none shadow-xl transition-all duration-200 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-emerald-900/60 bg-[#163327] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#D6A64F] text-[#1B3D2F] flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-[#D6A64F]/30 shrink-0">
            ∑
          </div>
          {!isCollapsed && (
            <div className="truncate min-w-0">
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                Study Studio
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5B6F2B] text-amber-200 font-semibold tracking-wide">
                  XSTK
                </span>
              </h1>
              <p className="text-[11px] text-emerald-300/80 font-medium truncate">
                Luyện thi & Trợ lý Đại học
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Streak Strip (Only when expanded) */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <span>🔥</span>
            <span>Chuỗi ngày học:</span>
          </div>
          <span className="font-bold text-amber-400">
            {streakDays} ngày
          </span>
        </div>
      )}

      {/* Navigation List with subtle animated math watermark background */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden select-none flex flex-col justify-around items-center font-serif text-2xl text-emerald-200">
          <span className="animate-pulse" style={{ animationDuration: '8s' }}>∫ f(x)dx = 1</span>
          <span className="animate-pulse" style={{ animationDuration: '10s' }}>Φ(z) ~ N(0, 1)</span>
          <span className="animate-pulse" style={{ animationDuration: '12s' }}>∑ P(Ai) = 1</span>
          <span className="animate-pulse" style={{ animationDuration: '9s' }}>Z = (x̄ - μ) / (s/√n)</span>
        </div>
        {!isCollapsed && (
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/60 relative z-10">
            Mục điều hướng
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#5B6F2B] text-white shadow-sm ring-1 ring-[#D6A64F]/40 font-semibold'
                  : 'text-emerald-100/90 hover:bg-emerald-900/40 hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D6A64F]' : 'text-emerald-300'}`} />
              {!isCollapsed && (
                <span className="truncate text-left uppercase text-xs tracking-wider font-bold">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Account Section at Bottom (Only displays current user profile, NO cluttered user-switching buttons) */}
      <div className="p-3 border-t border-emerald-900/70 bg-[#142d22] relative">
        {isGuest ? (
          // Guest State
          <div className="flex flex-col gap-2">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Khách truy cập</p>
                    <p className="text-[10px] text-emerald-300/70 truncate">Chưa đăng nhập</p>
                  </div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1.5 rounded-lg bg-[#D6A64F] hover:bg-[#c49542] text-[#1B3D2F] text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Đăng nhập
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                title="Đăng nhập tài khoản"
                className="w-full py-2 flex justify-center text-amber-300 hover:text-white"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          // Logged-in State
          <div>
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D6A64F]/50"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-emerald-950" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-300/80 truncate">
                      {currentUser.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                      {currentUser.university ? ` · ${currentUser.university.split(' ')[0]}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  title="Tùy chọn tài khoản"
                  className="p-1 rounded text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                title={`${currentUser.name} (Tài khoản)`}
                className="w-full flex justify-center relative py-1"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D6A64F]"
                />
                <span className="absolute bottom-1 right-3 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-emerald-950" />
              </button>
            )}

            {/* Account Options Menu Dropdown */}
            {showAccountMenu && (
              <div className={`absolute bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 text-xs z-50 ${
                isCollapsed ? 'left-2 w-48' : 'left-3 right-3'
              }`}>
                <div className="px-2 py-1 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                  {currentUser.email || currentUser.phone || 'Tài khoản hoạt động'}
                </div>

                <div className="py-1 space-y-0.5">
                  <div className="px-2 py-1 text-[10px] text-slate-500 font-semibold uppercase">
                    Đổi tài khoản mẫu (Kiểm thử)
                  </div>
                  {USERS_LIST.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowAccountMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-[#1B3D2F] text-amber-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{u.name} ({u.role === 'lecturer' ? 'GV' : 'SV'})</span>
                      {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-[#D6A64F]" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
