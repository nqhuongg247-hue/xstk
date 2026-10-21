import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Check,
  Headphones,
  SlidersHorizontal,
  X,
  Square,
  Maximize2,
  Minimize2,
  Trash2,
  HelpCircle,
  Calculator,
  Compass,
  ArrowRight
} from 'lucide-react';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { MathView } from './MathView';
import { UserProfile } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'local_fallback';
  status?: string;
  timestamp: string;
}

interface AITutorProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
}

export const AITutor: React.FC<AITutorProps> = ({ currentUser, onActivityCompleted }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `### Xin chào ${currentUser.name}! 
Tôi là **Gia sư AI Xác suất & Thống kê** được tích hợp mô hình **Gemini 3.8 Flash**.

Tôi có thể đồng hành cùng bạn trong các nội dung:
1. **Giải thích bản chất lý thuyết**: Phân tích trực quan các khái niệm từ Biến cố, Phân phối xác suất, đến Ước lượng khoảng & Kiểm định giả thuyết.
2. **Quy trình giải bài tập chuẩn mực**: Trình bày theo cấu trúc: **Dữ kiện $\\rightarrow$ Phương pháp $\\rightarrow$ Thay số $\\rightarrow$ Kết quả $\\rightarrow$ Đánh giá**.
3. **Mẹo bấm máy tính Casio fx-580VN X**: Hướng dẫn Menu 6 (Thống kê mẫu 1 biến) và Menu 7 (Distribution tính Normal CD, Inverse Normal, Binomial, Poisson).
4. **Hỗ trợ Giọng nói hai chiều**:
   - Nhấn nút **Micro** để đọc chính tả câu hỏi bằng tiếng Việt (bạn có thể kiểm tra và chỉnh sửa trước khi gửi).
   - Nhấn nút **Nghe đọc** tại mỗi câu trả lời để tôi phát âm thanh giải thích rõ ràng.

Hôm nay bạn muốn thảo luận về chủ đề nào trong 7 chương Xác suất & Thống kê?`,
      source: 'gemini',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceVolumeLevel, setVoiceVolumeLevel] = useState<number>(0);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);

  // TEXT-TO-SPEECH (TTS) STATE
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  const [autoSpeakResponse, setAutoSpeakResponse] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // VIEW MODES & EXPANSION
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSidePanel, setShowSidePanel] = useState<boolean>(true);
  const [selectedChapterContext, setSelectedChapterContext] = useState<number>(0);
  const [pedagogyMode, setPedagogyMode] = useState<'standard' | 'problem_solving' | 'concept' | 'theorem'>('standard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Sẵn sàng kết nối Gemini 3.8 Flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthKeepAliveRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load and cache Speech Synthesis Voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const viVoice = voices.find((v) => 
          v.lang.startsWith('vi') || 
          v.name.toLowerCase().includes('vietnam') || 
          v.name.toLowerCase().includes('vietnamese')
        );
        if (viVoice) {
          setSelectedVoice(viVoice);
        } else {
          setSelectedVoice(voices[0]);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (synthKeepAliveRef.current) {
        clearInterval(synthKeepAliveRef.current);
      }
    };
  }, []);

  // Web Speech Recognition (Voice-to-Text) Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        setConnectionStatus('Đang lắng nghe giọng đọc qua micro...');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        // Use console.warn instead of console.error for expected browser permission / iframe policy events
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Quyền truy cập Micro chưa được cấp hoặc bị hạn chế trên trình duyệt / khung iframe.');
        } else if (event.error === 'no-speech') {
          setConnectionStatus('Chưa phát hiện thấy giọng nói. Hãy nói to hơn hoặc gõ phím.');
        } else if (event.error === 'aborted') {
          // Handled or canceled
        } else {
          setMicError(`Thông báo micro: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setConnectionStatus('Đã kết thúc thu âm.');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Simulate audio level pulse when listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setVoiceVolumeLevel(Math.floor(Math.random() * 5) + 1);
      }, 150);
    } else {
      setVoiceVolumeLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Clean mathematical formulas to natural spoken Vietnamese
  const cleanTextForSpeech = (rawText: string): string => {
    let text = rawText
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/```[\s\S]*?```/g, ' đoạn mã máy tính ')
      .replace(/`([^`]+)`/g, ' $1 ');

    // Convert common mathematical expressions to spoken Vietnamese
    text = text
      .replace(/P\(([^)]+)\)/g, 'xác suất P của $1')
      .replace(/\\Phi\(([^)]+)\)/g, 'hàm Laplace phi tại $1')
      .replace(/\\mu/g, 'kỳ vọng muy')
      .replace(/\\sigma\^2/g, 'phương sai xích ma bình phương')
      .replace(/\\sigma/g, 'độ lệch chuẩn xích ma')
      .replace(/\\lambda/g, 'tham số lam đa')
      .replace(/\\bar\{x\}/g, 'trung bình mẫu x ngang')
      .replace(/s\^2/g, 'phương sai mẫu s bình phương')
      .replace(/s_x/g, 'độ lệch chuẩn mẫu s')
      .replace(/\\alpha/g, 'mức ý nghĩa an pha')
      .replace(/\\le/g, 'nhỏ hơn hoặc bằng')
      .replace(/\\ge/g, 'lớn hơn hoặc bằng')
      .replace(/\\approx/g, 'xấp xỉ')
      .replace(/\\neq/g, 'khác')
      .replace(/\\in/g, 'thuộc')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 chia cho $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'căn bậc hai của $1')
      .replace(/\\sum/g, 'tổng')
      .replace(/\\times/g, 'nhân')
      .replace(/\\cdot/g, 'nhân')
      .replace(/\$\$/g, ' ')
      .replace(/\$/g, ' ');

    return text.trim();
  };

  // Text-To-Speech (Read Aloud)
  const speakText = (text: string, messageId?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng Web Speech Synthesis.');
      return;
    }

    // Stop current speech
    window.speechSynthesis.cancel();
    if (synthKeepAliveRef.current) clearInterval(synthKeepAliveRef.current);

    const spokenText = cleanTextForSpeech(text);
    if (!spokenText) return;

    // Split long speech into sentence chunks to prevent Chrome pause bug
    const sentences = spokenText.match(/[^.!?\n]+[.!?\n]+/g) || [spokenText];
    let currentIndex = 0;

    setIsSpeaking(true);
    setCurrentlySpeakingMsgId(messageId || 'active');

    const speakNextChunk = () => {
      if (currentIndex >= sentences.length) {
        setIsSpeaking(false);
        setCurrentlySpeakingMsgId(null);
        if (synthKeepAliveRef.current) clearInterval(synthKeepAliveRef.current);
        return;
      }

      const chunk = sentences[currentIndex].trim();
      currentIndex++;

      if (!chunk) {
        speakNextChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.lang = 'vi-VN';
      }

      utterance.onend = () => {
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        speakNextChunk();
      };

      window.speechSynthesis.speak(utterance);
    };

    // Keep synthesis active in Chrome
    synthKeepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    setTimeout(() => {
      speakNextChunk();
    }, 50);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (synthKeepAliveRef.current) clearInterval(synthKeepAliveRef.current);
    setIsSpeaking(false);
    setCurrentlySpeakingMsgId(null);
  };

  // Voice dictation simulation (for quick testing or when microphone is blocked by browser/iframe policy)
  const handleSimulateVoiceInput = (sampleQuestion?: string) => {
    const textToSimulate = sampleQuestion || 'Cho biến ngẫu nhiên X có phân phối chuẩn N(10, 4). Hãy tính xác suất P(X > 12) và hướng dẫn bấm máy Casio fx-580VN X.';
    setMicError(null);
    setIsListening(true);
    setSpeechTranscript('');
    setConnectionStatus('Đang nhận diện giọng nói mô phỏng...');

    let current = '';
    const words = textToSimulate.split(' ');
    let wordIdx = 0;

    const timer = setInterval(() => {
      if (wordIdx < words.length) {
        current += (wordIdx === 0 ? '' : ' ') + words[wordIdx];
        setSpeechTranscript(current);
        setVoiceVolumeLevel(Math.floor(Math.random() * 4) + 1);
        wordIdx++;
      } else {
        clearInterval(timer);
        setIsListening(false);
        setVoiceVolumeLevel(0);
        setConnectionStatus('Đã nhận diện xong giọng nói!');
      }
    }, 80);
  };

  // Voice dictation toggle
  const handleToggleVoiceDictation = async () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    if (!recognitionRef.current) {
      setMicError('Trình duyệt chưa hỗ trợ Web Speech Recognition hoặc bị tắt trong môi trường này. Bạn có thể nhấn "Thử giọng nói mẫu" để trải nghiệm tính năng.');
      return;
    }

    setSpeechTranscript('');
    setMicError(null);

    // Politely check permissions before calling start()
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr: any) {
        console.warn('Microphone permission check notice:', permErr?.name || permErr);
        setMicError('Quyền truy cập Micro chưa được cấp hoặc bị hạn chế trên trình duyệt / khung iframe.');
        return;
      }
    }

    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.warn('Recognition start notice:', e);
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setMicError('Không thể khởi động micro lúc này. Bạn có thể nhập câu hỏi bằng văn bản hoặc nhấn "Thử giọng nói mẫu".');
    }
  };

  const applyTranscriptToInput = () => {
    setInputText((prev) => (prev ? `${prev} ${speechTranscript}` : speechTranscript));
    setSpeechTranscript('');
    if (isListening) recognitionRef.current?.stop();
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setConnectionStatus('Đã dừng phản hồi theo yêu cầu của bạn.');
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Reset input states
    setInputText('');
    setSpeechTranscript('');
    if (isListening) recognitionRef.current?.stop();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setConnectionStatus('Gemini 3.8 Flash đang suy nghĩ và tính toán lời giải...');

    let chapterContext = '';
    if (selectedChapterContext > 0) {
      const ch = CHAPTERS_DATA.find((c) => c.id === selectedChapterContext);
      if (ch) {
        chapterContext = `${ch.title}: ${ch.description}`;
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyContext = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: query,
          history: historyContext,
          chapterContext,
          pedagogyMode,
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'Rất tiếc, chưa nhận được phản hồi hợp lệ.',
        source: data.source,
        status: data.status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Complete activity & award streak progress
      onActivityCompleted(10, 'Hoàn thành phiên vấn đáp cùng Gia sư AI');

      // Auto-speak only if explicitly enabled by user
      if (autoSpeakResponse) {
        speakText(botMsg.text, botMsg.id);
      }

      setConnectionStatus('Phản hồi thành công từ Gemini 3.8 Flash (Tài liệu chuẩn đại học)');
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Chat notice:', err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: 'Đã xảy ra sự cố kết nối máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại!',
        source: 'local_fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setConnectionStatus('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'msg-welcome-fresh',
        role: 'assistant',
        text: `Chào ${currentUser.name}! Cuộc hội thoại mới đã được thiết lập. Bạn muốn tìm hiểu bài học hoặc giải bài toán XSTK nào?`,
        source: 'gemini',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const selectedChapterInfo = CHAPTERS_DATA.find((c) => c.id === selectedChapterContext);

  return (
    <div className={`mx-auto flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-3 z-50 max-w-none h-[calc(100vh-1.5rem)]' 
        : 'max-w-7xl h-[calc(100vh-8.5rem)]'
    }`}>
      {/* HEADER BAR */}
      <div className="p-4 md:px-6 bg-[#1B3D2F] text-white flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/60 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D6A64F] text-[#1B3D2F] flex items-center justify-center font-bold shadow-md ring-2 ring-[#D6A64F]/30 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Gia sư AI Gemini & Giọng nói</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-800/80 text-[#D6A64F] border border-[#D6A64F]/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-200/80">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-xs">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Controls */}
          <div className="flex items-center gap-1 bg-emerald-950/60 p-1 rounded-xl border border-emerald-800/60">
            <button
              onClick={() => setAutoSpeakResponse(!autoSpeakResponse)}
              title={autoSpeakResponse ? 'Tắt tự động đọc âm thanh' : 'Bật tự động đọc âm thanh câu trả lời'}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                autoSpeakResponse 
                  ? 'bg-[#D6A64F] text-[#1B3D2F] shadow' 
                  : 'text-emerald-200 hover:bg-emerald-900/80'
              }`}
            >
              {autoSpeakResponse ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">Tự đọc</span>
            </button>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 animate-pulse"
                title="Dừng phát âm thanh"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Dừng đọc</span>
              </button>
            )}

            {/* Speech Rate */}
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="bg-transparent text-emerald-200 text-xs font-medium px-2 py-1 rounded focus:outline-none cursor-pointer"
              title="Tốc độ đọc"
            >
              <option value={0.85} className="bg-slate-800 text-white">0.8x</option>
              <option value={1.0} className="bg-slate-800 text-white">1.0x (Chuẩn)</option>
              <option value={1.2} className="bg-slate-800 text-white">1.2x</option>
            </select>
          </div>

          {/* Toggle Side Panel on Desktop */}
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            title={showSidePanel ? 'Thu gọn bảng phụ' : 'Mở bảng phụ'}
            className={`p-2 rounded-xl text-xs font-semibold hidden lg:flex items-center gap-1.5 transition-colors ${
              showSidePanel ? 'bg-emerald-800 text-white' : 'text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tài liệu & Công thức</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Mở rộng toàn màn hình'}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900/80 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Reset Chat */}
          <button
            onClick={handleResetChat}
            title="Bắt đầu hội thoại mới"
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODE STRIP */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Phong cách phản hồi:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setPedagogyMode('standard')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              pedagogyMode === 'standard'
                ? 'bg-[#1B3D2F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            💬 Chatbot Gemini Linh hoạt
          </button>
          <button
            onClick={() => setPedagogyMode('problem_solving')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              pedagogyMode === 'problem_solving'
                ? 'bg-[#1B3D2F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            📐 Giải bài 4 bước sư phạm
          </button>
          <button
            onClick={() => setPedagogyMode('concept')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              pedagogyMode === 'concept'
                ? 'bg-[#1B3D2F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            💡 Trực quan & Ví dụ đời sống
          </button>
          <button
            onClick={() => setPedagogyMode('theorem')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              pedagogyMode === 'theorem'
                ? 'bg-[#1B3D2F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            📟 Hướng dẫn Casio fx-580VN X
          </button>
        </div>
      </div>

      {/* MAIN 2-COLUMN WORKSPACE (CHAT + STUDY COMPANION PANEL) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F9F9F6]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isCurrentMsgSpeaking = currentlySpeakingMsgId === msg.id && isSpeaking;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-[#1B3D2F] text-[#D6A64F] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-[92%] md:max-w-[85%] rounded-2xl p-4 md:p-6 shadow-sm text-sm ${
                    isUser 
                      ? 'bg-[#1B3D2F] text-white rounded-tr-xs' 
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}>
                    {/* Header of Bot Message */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-900">Gia sư AI Gemini</span>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Read Aloud Button */}
                          <button
                            onClick={() => isCurrentMsgSpeaking ? stopSpeaking() : speakText(msg.text, msg.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isCurrentMsgSpeaking
                                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                            title={isCurrentMsgSpeaking ? 'Dừng đọc' : 'Phát âm thanh câu trả lời'}
                          >
                            {isCurrentMsgSpeaking ? (
                              <>
                                <Square className="w-3 h-3 fill-current" />
                                <span>Dừng</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Nghe đọc</span>
                              </>
                            )}
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Sao chép câu trả lời"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Animated sound wave bar when speaking */}
                    {!isUser && isCurrentMsgSpeaking && (
                      <div className="mb-3 p-2 bg-emerald-50/80 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
                        <div className="flex items-center gap-2">
                          <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.1s] h-3" />
                            <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s] h-2" />
                            <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.3s] h-3.5" />
                            <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.15s] h-2.5" />
                          </div>
                          <span className="font-semibold text-emerald-800">Đang đọc bài giải...</span>
                        </div>
                        <button
                          onClick={stopSpeaking}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          Dừng
                        </button>
                      </div>
                    )}

                    {/* Content View via MathView (Markdown + KaTeX) */}
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <MathView content={msg.text} />
                    )}
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 overflow-hidden">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator with Stop button */}
            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-2xl bg-[#1B3D2F] text-[#D6A64F] flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl px-5 py-3.5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Gemini 3.8 Flash đang tính toán và định dạng lời giải...
                  </span>
                  <button
                    onClick={handleStopGeneration}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    Dừng phản hồi
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* VOICE-TO-TEXT PREVIEW BAR */}
          {isListening && (
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-1 h-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-amber-600 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, (voiceVolumeLevel >= i + 1 ? 16 : 6))}px`,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <span className="font-bold text-amber-950">Đang thu âm: </span>
                  <span className="italic">
                    {speechTranscript || 'Hãy đọc đề bài hoặc câu hỏi bằng tiếng Việt...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={applyTranscriptToInput}
                  disabled={!speechTranscript.trim()}
                  className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs"
                >
                  Chèn vào ô nhập
                </button>
                <button
                  onClick={() => handleSendMessage(speechTranscript)}
                  disabled={!speechTranscript.trim()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  Gửi luôn
                </button>
                <button
                  onClick={() => recognitionRef.current?.stop()}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Dừng ghi âm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {micError && (
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2 flex-1 mr-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{micError}</span>
                <button
                  type="button"
                  onClick={() => handleSimulateVoiceInput()}
                  className="ml-2 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shrink-0 transition-colors shadow-xs"
                >
                  🎤 Thử mẫu giọng nói
                </button>
              </div>
              <button onClick={() => setMicError(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* INPUT BAR */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={handleToggleVoiceDictation}
                title={isListening ? 'Dừng thu âm micro' : 'Bật thu âm giọng nói (Voice-to-Text)'}
                className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Textarea Input (Auto-expanding) */}
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={inputText.split('\n').length > 1 ? Math.min(4, inputText.split('\n').length) : 1}
                  placeholder={isListening ? 'Đang lắng nghe giọng đọc...' : 'Nhập câu hỏi hoặc đề bài XSTK (Enter để gửi, Shift+Enter xuống dòng)...'}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B3D2F] text-sm bg-slate-50/50 resize-none max-h-32"
                />

                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    title="Xóa nội dung"
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Send or Stop Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white transition-all shrink-0 shadow-md font-semibold"
                  title="Dừng phản hồi"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3.5 rounded-2xl bg-[#1B3D2F] hover:bg-[#163327] disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all shrink-0 shadow-md font-semibold"
                  title="Gửi câu hỏi"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span><MathView content="💡 Hỗ trợ gõ công thức LaTeX: $P(A|B) = \frac{P(AB)}{P(B)}$" /></span>
              <span>Gemini AI Engine · Đại học chuẩn</span>
            </div>
          </div>
        </div>

        {/* RIGHT: STUDY COMPANION PANEL (DESKTOP) */}
        {showSidePanel && (
          <div className="w-80 border-l border-slate-200 bg-white p-4 overflow-y-auto space-y-5 hidden lg:block shrink-0 text-xs">
            {/* Chapter Focus */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Ngữ cảnh chương đang học
              </label>
              <select
                value={selectedChapterContext}
                onChange={(e) => setSelectedChapterContext(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700 cursor-pointer"
              >
                <option value={0}>Tất cả 7 chương XSTK</option>
                {CHAPTERS_DATA.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Chương {ch.id}: {ch.title.split(':')[1]?.trim() || ch.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick formulas for selected chapter */}
            {selectedChapterInfo && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="font-bold text-emerald-950 text-[11px]">
                  Công thức trọng tâm {selectedChapterInfo.title.split(':')[0]}:
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  {selectedChapterInfo.sections.slice(0, 2).map((sec, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-emerald-100">
                      <div className="font-semibold text-emerald-900 mb-1">{sec.title}</div>
                      <MathView content={`$$${sec.keyFormulas[0]}$$`} displayMode={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Prompts */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D6A64F]" />
                Hỏi nhanh theo chuyên đề
              </label>
              <div className="space-y-1.5">
                {[
                  'Phân biệt P(A|B) và P(AB)',
                  'Khi nào dùng Z-test và khi nào dùng T-test?',
                  'Cách bấm Casio fx-580VN X Menu 7 tính Normal CD',
                  'Ý nghĩa Định lý giới hạn trung tâm CLT',
                  'Tại sao phương sai mẫu s² phải chia cho n - 1?',
                  'Ví dụ công thức Bayes trong kinh doanh'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/80 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-700 shrink-0 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Casio fx-580VN X Quick Reference */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
              <div className="font-bold text-amber-950 text-[11px] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-700" />
                Phím tắt Casio fx-580VN X:
              </div>
              <ul className="space-y-1 text-[11px] text-amber-900">
                <li>• <strong>Menu 6:</strong> <MathView content="Thống kê mẫu 1-Variable ($\bar{x}, s_x, s_x^2, n$)" /></li>
                <li>• <strong>Menu 7 → 2:</strong> <MathView content="Normal CD tính $P(a \le X \le b)$" /></li>
                <li>• <strong>Menu 7 → 4:</strong> <MathView content="Binomial PD tính $P(X = k)$" /></li>
                <li>• <strong>Menu 7 → ↓ 1:</strong> <MathView content="Poisson PD tính $P(X = k)$" /></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
