import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  RotateCcw,
  Smartphone
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | 'email'>('google');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Phone OTP Flow states
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneStep, setPhoneStep] = useState<'phone_input' | 'otp_verify'>('phone_input');
  const [otpCode, setOtpCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [phoneUserName, setPhoneUserName] = useState<string>('');
  const [phoneUniversity, setPhoneUniversity] = useState<string>('Đại học Kinh tế Quốc dân');

  // Email form
  const [emailInput, setEmailInput] = useState<string>('nqhuongg247@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••');
  const [nameInput, setNameInput] = useState<string>('Nguyễn Quang Hương');
  const [universityInput, setUniversityInput] = useState<string>('Đại học Kinh tế Quốc dân');

  // Simulated Google Accounts picker state
  const [showGooglePicker, setShowGooglePicker] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (phoneStep === 'otp_verify' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneStep, otpCountdown]);

  if (!isOpen) return null;

  // 1. Google OAuth Simulation
  const handleGoogleSignIn = (selectedEmail?: string, selectedName?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      setShowGooglePicker(false);
      const email = selectedEmail || 'nqhuongg247@gmail.com';
      const name = selectedName || (email.startsWith('nqhuong') ? 'Nguyễn Quang Hương' : 'Sinh viên XSTK');
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name,
        email: email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
        provider: 'google',
        role: 'student',
        university: 'Đại học Kinh tế Quốc dân',
      };
      onLoginSuccess(newUser);
      onClose();
    }, 700);
  };

  // 2. Phone OTP Send
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số).');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Generate realistic 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setPhoneStep('otp_verify');
      setOtpCountdown(60);
    }, 600);
  };

  // 3. Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== generatedOtp && otpCode !== '123456') {
      setErrorMessage('Mã OTP không chính xác. Vui lòng kiểm tra lại tin nhắn.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: `user-phone-${Date.now()}`,
        name: phoneUserName || `Sinh viên ${phoneNumber.slice(-4)}`,
        email: `${phoneNumber}@sms.studystudio.vn`,
        phone: phoneNumber,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        provider: 'phone',
        role: 'student',
        university: phoneUniversity || 'Đại học Ngoại thương',
      };
      onLoginSuccess(newUser);
      onClose();
    }, 600);
  };

  // 4. Email Signin
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: `user-mail-${Date.now()}`,
        name: authMode === 'signup' ? nameInput : nameInput || 'Nguyễn Quang Hương',
        email: emailInput,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        provider: 'email',
        role: 'student',
        university: universityInput,
      };
      onLoginSuccess(newUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl relative border border-slate-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#D6A64F] text-[#1B3D2F] flex items-center justify-center font-black text-xl mx-auto shadow-md">
            ∑
          </div>
          <h3 className="text-xl font-black text-[#1B3D2F] tracking-tight">
            {authMode === 'signin' ? 'Đăng nhập Study Studio' : 'Tạo tài khoản mới'}
          </h3>
          <p className="text-xs text-slate-500">
            Học tập, luyện thi & đồng bộ dữ liệu Xác suất Thống kê
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setAuthMethod('google');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'google' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-500" />
            <span>Gmail</span>
          </button>
          <button
            onClick={() => {
              setAuthMethod('phone');
              setPhoneStep('phone_input');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'phone' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Số ĐT / OTP</span>
          </button>
          <button
            onClick={() => {
              setAuthMethod('email');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#5B6F2B]" />
            <span>Mật khẩu</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* METHOD 1: GOOGLE / GMAIL */}
        {authMethod === 'google' && (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-slate-600 leading-relaxed text-center">
              Đăng nhập một chạm bằng tài khoản Google để tự động đồng bộ kết quả thi, chuỗi streak và thảo luận diễn đàn.
            </p>

            <button
              onClick={() => setShowGooglePicker(true)}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all font-semibold text-xs flex items-center justify-center gap-3 shadow-xs text-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google / Gmail</span>
            </button>

            {/* Google Account Selector Pop-up Simulation */}
            {showGooglePicker && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Chọn tài khoản Google để đăng nhập:
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleGoogleSignIn('nqhuongg247@gmail.com', 'Nguyễn Quang Hương')}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#1B3D2F] flex items-center gap-3 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      H
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Nguyễn Quang Hương</p>
                      <p className="text-[11px] text-slate-500">nqhuongg247@gmail.com</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGoogleSignIn('nam.lh22@st.neu.edu.vn', 'Lê Hoàng Nam')}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#1B3D2F] flex items-center gap-3 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      N
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Lê Hoàng Nam (NEU)</p>
                      <p className="text-[11px] text-slate-500">nam.lh22@st.neu.edu.vn</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* METHOD 2: PHONE & SMS OTP VERIFICATION */}
        {authMethod === 'phone' && (
          <div className="space-y-4 pt-1 text-xs">
            {phoneStep === 'phone_input' ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại di động (Việt Nam)
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-semibold text-xs flex items-center">
                      🇻🇳 +84
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0912 345 678"
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1B3D2F] text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Họ và tên của bạn</label>
                    <input
                      type="text"
                      value={phoneUserName}
                      onChange={(e) => setPhoneUserName(e.target.value)}
                      placeholder="Ví dụ: Trần Minh Quân"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.length < 9}
                  className="w-full py-3 rounded-xl font-bold bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isLoading ? (
                    <span>Đang gửi mã OTP...</span>
                  ) : (
                    <>
                      <span>Nhận mã xác thực OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* OTP verification step */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Honest Sandbox OTP Notification per Section IV.2 */}
                {generatedOtp && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Thông báo cổng SMS & Xác thực an toàn:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Cổng SMS Gateway thực tế (Twilio / Firebase Auth) đang chờ cấu hình khóa API trong biến môi trường. Để phục vụ kiểm thử luồng đăng nhập, mã xác minh được cấp trực tiếp: <strong className="font-mono text-emerald-900 text-sm font-bold bg-white px-2 py-0.5 rounded border border-amber-200">{generatedOtp}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="text-[10px] underline font-bold text-[#1B3D2F] hover:text-emerald-800"
                    >
                      [Tự động điền mã xác thực kiểm thử này]
                    </button>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Nhập mã OTP (6 số)</label>
                    <span className="text-[11px] text-slate-400">
                      Gửi lại sau: <b>{otpCountdown}s</b>
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Nhập 6 số OTP..."
                    className="w-full text-center text-lg font-mono tracking-widest py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhoneStep('phone_input')}
                    className="flex-1 py-2.5 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Đổi số ĐT
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-[#1B3D2F] text-white hover:bg-[#153125] disabled:opacity-40"
                  >
                    {isLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* METHOD 3: EMAIL / PASSWORD */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1 text-xs">
            {authMode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Quang Hương"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all"
            >
              {authMode === 'signin' ? 'Đăng nhập với Email' : 'Đăng ký tài khoản'}
            </button>
          </form>
        )}

        {/* Footer switcher between Sign In and Sign Up */}
        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
          {authMode === 'signin' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                }}
                className="font-bold text-[#1B3D2F] hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage('');
                }}
                className="font-bold text-[#1B3D2F] hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
