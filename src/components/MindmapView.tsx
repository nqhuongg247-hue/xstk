import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Network, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Search, 
  Compass, 
  Bot, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  X, 
  Eye, 
  Calculator, 
  ArrowRight,
  Move,
  Check,
  MousePointerClick,
  Sliders,
  Flame
} from 'lucide-react';
import { 
  MINDMAP_CENTER_NODE, 
  MINDMAP_BRANCHES, 
  MindmapMainBranch, 
  MindmapSubNode,
  SOLVER_ASSISTANT_TREE,
  SolverMethodQuestion
} from '../data/mindmapData';
import { MathView } from './MathView';
import { NavTab } from './Sidebar';

interface MindmapViewProps {
  onNavigateTab?: (tab: NavTab) => void;
  onNavigateChapter?: (chapterId: number) => void;
}

export const MindmapView: React.FC<MindmapViewProps> = ({ onNavigateTab, onNavigateChapter }) => {
  // Navigation & Viewport State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Auto-follow Mode State (Section 5.3)
  const [autoFollow, setAutoFollow] = useState<boolean>(true);

  // Branch expansion state (Section 5.2 - click only, no hover expansion)
  const [expandedBranchIds, setExpandedBranchIds] = useState<Set<string>>(
    new Set(['branch-10h']) // Mặc định mở nhánh 10h để người học có thể khám phá ngay
  );

  // Active Selected Node for Deep Detail View
  const [selectedNode, setSelectedNode] = useState<MindmapSubNode | null>(
    MINDMAP_BRANCHES[0].subNodes[0]
  );

  // Quick Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Section 6: Solver Assistant Modal / Drawer State
  const [showSolverAssistant, setShowSolverAssistant] = useState<boolean>(false);
  const [solverConfirmed, setSolverConfirmed] = useState<boolean>(false);
  const [currentSolverStep, setCurrentSolverStep] = useState<string>('root');
  const [solverHistory, setSolverHistory] = useState<string[]>([]);
  const [recommendedMethod, setRecommendedMethod] = useState<any | null>(null);

  // Canvas dimensions
  const CANVAS_WIDTH = 2400;
  const CANVAS_HEIGHT = 1800;
  const CENTER_X = CANVAS_WIDTH / 2;
  const CENTER_Y = CANVAS_HEIGHT / 2;

  // Branch anchor coordinates around center in an X-layout (10h, 2h, 4h, 8h)
  const BRANCH_OFFSETS: Record<string, { x: number; y: number; angle: string }> = {
    'branch-10h': { x: -480, y: -340, angle: '10:00 (Tây Bắc)' },
    'branch-2h':  { x: 480,  y: -340, angle: '02:00 (Đông Bắc)' },
    'branch-4h':  { x: 480,  y: 340,  angle: '04:00 (Đông Nam)' },
    'branch-8h':  { x: -480, y: 340,  angle: '08:00 (Tây Nam)' },
  };

  // Toggle Branch Open/Close
  const handleToggleBranch = (branchId: string) => {
    setExpandedBranchIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyOpen = next.has(branchId);
      if (isCurrentlyOpen) {
        next.delete(branchId);
        // If closing and auto-follow is on, re-center
        if (autoFollow) {
          smoothPanTo(0, 0);
        }
      } else {
        next.add(branchId);
        // Section 5.3: Khi bật “Tự rê theo”, dịch khung nhìn để nhánh vừa mở trở thành tiêu điểm:
        // tâm cũ dịch về hướng ngược lại với nhánh được mở.
        if (autoFollow) {
          const offset = BRANCH_OFFSETS[branchId];
          if (offset) {
            // Dịch ngược hướng để nhánh rơi vào vùng trung tâm màn hình
            smoothPanTo(-offset.x * 0.75, -offset.y * 0.75);
          }
        }
      }
      return next;
    });
  };

  // Smooth pan animation
  const smoothPanTo = (targetX: number, targetY: number) => {
    setPanOffset({ x: targetX, y: targetY });
  };

  // Expand all / collapse all
  const handleExpandAll = () => {
    setExpandedBranchIds(new Set(MINDMAP_BRANCHES.map((b) => b.id)));
  };

  const handleCollapseAll = () => {
    setExpandedBranchIds(new Set());
    smoothPanTo(0, 0);
  };

  // Reset View / Re-center
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Drag and Pan handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking the canvas background
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Filter subnodes by search query
  const filteredSubnodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: { branch: MindmapMainBranch; node: MindmapSubNode }[] = [];
    MINDMAP_BRANCHES.forEach((b) => {
      b.subNodes.forEach((n) => {
        if (
          n.title.toLowerCase().includes(q) ||
          n.shortDesc.toLowerCase().includes(q) ||
          n.concept.toLowerCase().includes(q) ||
          n.keyFormulas.some((f) => f.toLowerCase().includes(q))
        ) {
          results.push({ branch: b, node: n });
        }
      });
    });
    return results;
  }, [searchQuery]);

  // Handle jump to search result
  const handleSelectSearchResult = (branch: MindmapMainBranch, node: MindmapSubNode) => {
    setExpandedBranchIds((prev) => new Set([...prev, branch.id]));
    setSelectedNode(node);
    const offset = BRANCH_OFFSETS[branch.id];
    if (offset) {
      smoothPanTo(-offset.x * 0.75, -offset.y * 0.75);
    }
  };

  // Section 6: Solver Assistant Navigation
  const handleSolverOptionClick = (opt: any) => {
    if (opt.recommendedMethod) {
      setRecommendedMethod(opt.recommendedMethod);
    } else if (opt.nextStep) {
      setSolverHistory((prev) => [...prev, currentSolverStep]);
      setCurrentSolverStep(opt.nextStep);
    }
  };

  const handleSolverBack = () => {
    if (recommendedMethod) {
      setRecommendedMethod(null);
      return;
    }
    if (solverHistory.length > 0) {
      const prevStep = solverHistory[solverHistory.length - 1];
      setSolverHistory((prev) => prev.slice(0, -1));
      setCurrentSolverStep(prevStep);
    }
  };

  const handleResetSolver = () => {
    setCurrentSolverStep('root');
    setSolverHistory([]);
    setRecommendedMethod(null);
    setSolverConfirmed(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex flex-col bg-[#F4F3EC] text-slate-800 font-sans select-none overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-[calc(100vh-6rem)] rounded-2xl border border-slate-300 shadow-sm'
      }`}
    >
      {/* 1. TOP HEADER & INTERACTIVE CONTROLS TOOLBAR */}
      <div className="bg-[#1B3D2F] text-white px-4 py-3 md:px-6 md:py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900 shrink-0 z-30 shadow-md">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D6A64F] text-[#1B3D2F] flex items-center justify-center font-black shadow-inner shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded bg-[#D6A64F]/25 text-[#D6A64F] border border-[#D6A64F]/40 uppercase">
                Bố cục chữ X · 4 Hướng chéo
              </span>
              <span className="text-[11px] text-emerald-200/80 hidden sm:inline">
                (10h · 2h · 4h · 8h)
              </span>
            </div>
            <h1 className="text-base md:text-lg font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              SƠ ĐỒ TƯ DUY XSTK TOÀN DIỆN
            </h1>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm công thức, khái niệm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-white placeholder-emerald-300/60 text-xs focus:outline-none focus:ring-1 focus:ring-[#D6A64F]"
            />
            <Search className="w-3.5 h-3.5 text-emerald-300 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-emerald-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick search drop-down */}
            {searchQuery && (
              <div className="absolute left-0 mt-1.5 w-72 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                  Kết quả tìm kiếm ({filteredSubnodes.length})
                </div>
                {filteredSubnodes.length === 0 ? (
                  <div className="text-xs text-slate-500 p-2 italic">Không tìm thấy khái niệm phù hợp</div>
                ) : (
                  filteredSubnodes.map(({ branch, node }) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        handleSelectSearchResult(branch, node);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 transition-colors flex flex-col gap-0.5"
                    >
                      <div className="font-bold text-xs text-[#1B3D2F] flex items-center justify-between">
                        <span>{node.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {branch.clockPosition}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{node.shortDesc}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Auto-follow toggle (Section 5.3) */}
          <button
            onClick={() => setAutoFollow(!autoFollow)}
            title="Tự động dịch khung nhìn về nhánh vừa mở"
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              autoFollow 
                ? 'bg-[#5B6F2B] text-white shadow-xs ring-1 ring-emerald-300/40' 
                : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800 hover:bg-emerald-900/60'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${autoFollow ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">Tự rê theo:</span>
            <span>{autoFollow ? 'BẬT' : 'TẮT'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-emerald-950/70 border border-emerald-700/60 rounded-xl overflow-hidden p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 hover:bg-emerald-800 text-emerald-200 hover:text-white rounded-lg transition-colors"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-emerald-200 min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 hover:bg-emerald-800 text-emerald-200 hover:text-white rounded-lg transition-colors"
              title="Phóng to (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Re-center */}
          <button
            onClick={handleResetView}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 hover:text-white hover:bg-emerald-800 flex items-center gap-1 font-semibold"
            title="Đưa sơ đồ về chính giữa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Về giữa</span>
          </button>

          {/* Expand/Collapse All */}
          <button
            onClick={expandedBranchIds.size === MINDMAP_BRANCHES.length ? handleCollapseAll : handleExpandAll}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 hover:text-white hover:bg-emerald-800 font-semibold"
            title={expandedBranchIds.size === MINDMAP_BRANCHES.length ? 'Thu gọn tất cả nhánh' : 'Mở tất cả nhánh'}
          >
            {expandedBranchIds.size === MINDMAP_BRANCHES.length ? 'Thu gọn' : 'Mở tất cả'}
          </button>

          {/* Section 6: Trợ lý chọn phương pháp giải */}
          <button
            onClick={() => {
              setShowSolverAssistant(true);
              setSolverConfirmed(false);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#D6A64F] hover:bg-[#c49542] text-[#1B3D2F] font-black flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">TRỢ LÝ CHỌN PHƯƠNG PHÁP</span>
            <span className="md:hidden">Trợ lý giải</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 hover:text-white hover:bg-emerald-800"
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE SVG & CANVAS AREA */}
      <div 
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-[#F4F3EC]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Animated Mathematical Watermarks in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden select-none">
          <div className="absolute text-3xl font-serif text-[#5B6F2B]/40 top-12 left-16 animate-pulse" style={{ animationDuration: '8s' }}>
            <MathView content="$\int_{-\infty}^{+\infty} f(x)dx = 1$" />
          </div>
          <div className="absolute text-3xl font-serif text-[#1B3D2F]/30 top-20 right-28 animate-pulse" style={{ animationDuration: '10s' }}>
            <MathView content="$\Phi(z) = \frac{1}{\sqrt{2\pi}} \int_0^z e^{-t^2/2} dt$" />
          </div>
          <div className="absolute text-3xl font-serif text-[#D6A64F]/40 bottom-24 left-24 animate-pulse" style={{ animationDuration: '9s' }}>
            <MathView content="$P(A|B) = \frac{P(AB)}{P(B)}$" />
          </div>
          <div className="absolute text-3xl font-serif text-[#1B3D2F]/35 bottom-16 right-20 animate-pulse" style={{ animationDuration: '11s' }}>
            <MathView content="$Z = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \sim N(0, 1)$" />
          </div>
          <div className="absolute text-6xl font-serif text-slate-400/20 top-1/2 left-1/4 -translate-y-1/2">
            <MathView content="$\Omega$" />
          </div>
          <div className="absolute text-5xl font-serif text-slate-400/20 top-1/2 right-1/4 -translate-y-1/2">
            <MathView content="$\sum_{i=1}^n P(A_i) = 1$" />
          </div>
        </div>

        {/* TRANSFORMATION WRAPPER (PAN & ZOOM with 0.75s smooth transitions for auto-follow) */}
        <div 
          className="absolute inset-0 origin-center transition-transform"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transitionDuration: isDragging ? '0s' : '0.75s',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* SVG Canvas for Connecting Curves */}
          <svg 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          >
            <defs>
              {/* Gradients for connecting lines */}
              <linearGradient id="grad-10h" x1="50%" y1="50%" x2="25%" y2="25%">
                <stop offset="0%" stopColor="#1B3D2F" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#D6A64F" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="grad-2h" x1="50%" y1="50%" x2="75%" y2="25%">
                <stop offset="0%" stopColor="#5B6F2B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#D6A64F" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="grad-4h" x1="50%" y1="50%" x2="75%" y2="75%">
                <stop offset="0%" stopColor="#D6A64F" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1B3D2F" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="grad-8h" x1="50%" y1="50%" x2="25%" y2="75%">
                <stop offset="0%" stopColor="#132E23" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#5B6F2B" stopOpacity="0.9" />
              </linearGradient>

              {/* Marker circles */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render connecting lines between Center and the 4 Main Branches */}
            {MINDMAP_BRANCHES.map((branch) => {
              const offset = BRANCH_OFFSETS[branch.id];
              if (!offset) return null;
              const targetX = CENTER_X + offset.x;
              const targetY = CENTER_Y + offset.y;

              // Cubic bezier control points radiating outwards
              const cx1 = CENTER_X + offset.x * 0.45;
              const cy1 = CENTER_Y;
              const cx2 = CENTER_X + offset.x * 0.55;
              const cy2 = CENTER_Y + offset.y;

              const isExpanded = expandedBranchIds.has(branch.id);

              return (
                <g key={`curve-${branch.id}`}>
                  {/* Outer glow line */}
                  <path
                    d={`M ${CENTER_X} ${CENTER_Y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetX} ${targetY}`}
                    fill="none"
                    stroke={branch.themeColor}
                    strokeWidth={isExpanded ? 5 : 3}
                    strokeDasharray={isExpanded ? 'none' : '6 6'}
                    opacity={isExpanded ? 0.9 : 0.45}
                    className="transition-all duration-700"
                  />
                  {/* Decorative connection pulse dots */}
                  <circle cx={targetX} cy={targetY} r={6} fill={branch.accentColor} />
                  <circle cx={(CENTER_X + targetX) / 2} cy={(CENTER_Y + targetY) / 2} r={3} fill="#D6A64F" opacity={0.6} />
                </g>
              );
            })}

            {/* Render connecting lines between Main Branches and their Subnodes when expanded */}
            {MINDMAP_BRANCHES.map((branch) => {
              if (!expandedBranchIds.has(branch.id)) return null;
              const bOffset = BRANCH_OFFSETS[branch.id];
              const bx = CENTER_X + bOffset.x;
              const by = CENTER_Y + bOffset.y;

              const isLeft = bOffset.x < 0;
              const isTop = bOffset.y < 0;

              return branch.subNodes.map((sub, sIdx) => {
                // Compute subnode anchor position in the diagonal quadrant
                const subDistX = isLeft ? -340 : 340;
                const subDistY = (sIdx - (branch.subNodes.length - 1) / 2) * 115;
                const sx = bx + subDistX;
                const sy = by + subDistY;

                const scx1 = bx + subDistX * 0.5;
                const scy1 = by;
                const scx2 = bx + subDistX * 0.7;
                const scy2 = sy;

                const isSelected = selectedNode?.id === sub.id;

                return (
                  <g key={`subcurve-${sub.id}`}>
                    <path
                      d={`M ${bx} ${by} C ${scx1} ${scy1}, ${scx2} ${scy2}, ${sx} ${sy}`}
                      fill="none"
                      stroke={isSelected ? '#D6A64F' : branch.themeColor}
                      strokeWidth={isSelected ? 3.5 : 2}
                      strokeOpacity={isSelected ? 1 : 0.65}
                      className="transition-all duration-500"
                    />
                    <circle cx={sx} cy={sy} r={isSelected ? 5 : 3.5} fill={isSelected ? '#D6A64F' : branch.themeColor} />
                  </g>
                );
              });
            })}
          </svg>

          {/* HTML NODES OVERLAY */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          >
            {/* ========================================================= */}
            {/* 2.1 CENTER CORE NODE: XÁC SUẤT & THỐNG KÊ TOÁN */}
            {/* ========================================================= */}
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer interactive-node group"
              style={{ left: CENTER_X, top: CENTER_Y }}
              onClick={handleResetView}
            >
              <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#1B3D2F] via-[#163327] to-[#0E2019] text-white shadow-2xl border-4 border-[#D6A64F] flex flex-col items-center text-center w-72 md:w-80 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(214,166,79,0.45)]">
                {/* Center Badge */}
                <div className="px-3 py-1 rounded-full bg-[#D6A64F] text-[#1B3D2F] font-black text-[11px] tracking-wider uppercase mb-2 shadow-sm flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{MINDMAP_CENTER_NODE.badge}</span>
                </div>

                {/* Core Title */}
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                  {MINDMAP_CENTER_NODE.title}
                </h2>
                <div className="text-[11px] text-[#D6A64F] font-bold tracking-widest mt-0.5">
                  {MINDMAP_CENTER_NODE.subtitle}
                </div>

                <p className="text-xs text-emerald-100/90 mt-2.5 leading-relaxed">
                  {MINDMAP_CENTER_NODE.description}
                </p>

                {/* Math Symbol Tokens */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-emerald-800/80 text-[11px] font-mono text-[#D6A64F]">
                  <MathView content="$\Omega \quad \sum \quad \int \quad \mu \quad \sigma^2 \quad H_0$" />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2.2 THE 4 MAIN BRANCHES (10h, 2h, 4h, 8h) */}
            {/* ========================================================= */}
            {MINDMAP_BRANCHES.map((branch) => {
              const offset = BRANCH_OFFSETS[branch.id];
              const bx = CENTER_X + offset.x;
              const by = CENTER_Y + offset.y;
              const isExpanded = expandedBranchIds.has(branch.id);

              return (
                <div key={branch.id}>
                  {/* MAIN BRANCH CARD */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 interactive-node cursor-pointer group"
                    style={{ left: bx, top: by }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBranch(branch.id);
                    }}
                  >
                    <div 
                      className={`relative w-80 md:w-96 p-5 rounded-2xl border-2 transition-all duration-300 shadow-lg text-white ${
                        isExpanded
                          ? 'ring-4 ring-[#D6A64F]/50 scale-102'
                          : 'hover:scale-103 hover:shadow-xl'
                      }`}
                      style={{ 
                        backgroundColor: branch.themeColor,
                        borderColor: branch.borderColor
                      }}
                    >
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#D6A64F] text-[#1B3D2F]">
                          {branch.badge}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200">
                          <span>{branch.subNodes.length} nhánh con</span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#D6A64F]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#D6A64F]" />
                          )}
                        </div>
                      </div>

                      {/* Branch Title */}
                      <h3 className="text-base md:text-lg font-black tracking-tight text-white leading-tight uppercase">
                        {branch.title}
                      </h3>
                      <p className="text-xs text-[#D6A64F] font-medium mt-1 leading-snug">
                        {branch.subtitle}
                      </p>

                      <p className="text-xs text-white/80 mt-2 line-clamp-2 leading-relaxed">
                        {branch.summary}
                      </p>

                      {/* Click indicator */}
                      <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] text-white/90">
                        <span className="font-semibold flex items-center gap-1 text-[#D6A64F]">
                          <MousePointerClick className="w-3.5 h-3.5" />
                          {isExpanded ? 'Nhấn để thu gọn' : 'Nhấn để mở nhánh con'}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-200/80">
                          {offset.angle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 2.3 SUB-NODES (RENDERED WHEN BRANCH IS EXPANDED) */}
                  {/* ========================================================= */}
                  {isExpanded && (
                    <>
                      {branch.subNodes.map((subNode, sIdx) => {
                        const isLeft = offset.x < 0;
                        const subDistX = isLeft ? -340 : 340;
                        const subDistY = (sIdx - (branch.subNodes.length - 1) / 2) * 115;
                        const sx = bx + subDistX;
                        const sy = by + subDistY;

                        const isSelected = selectedNode?.id === subNode.id;

                        return (
                          <div
                            key={subNode.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 interactive-node cursor-pointer group"
                            style={{ left: sx, top: sy }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(subNode);
                            }}
                          >
                            <div 
                              className={`w-72 p-3.5 rounded-xl border transition-all duration-200 text-left shadow-md bg-white ${
                                isSelected
                                  ? 'ring-2 ring-[#D6A64F] border-[#1B3D2F] bg-amber-50/40 shadow-lg scale-102'
                                  : 'border-slate-300 hover:border-emerald-700 hover:shadow-lg'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-[11px] text-emerald-800 line-clamp-1">
                                  Chương {subNode.chapterRef}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-[#D6A64F] text-[#1B3D2F]' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {isSelected ? 'Đang chọn' : `Nhánh ${sIdx + 1}`}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-xs text-[#1B3D2F] line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                {subNode.title}
                              </h4>

                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                                {subNode.shortDesc}
                              </p>

                              {/* Key formula preview */}
                              <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] font-mono text-emerald-900 bg-emerald-50/50 px-2 py-1 rounded truncate">
                                <MathView content={`$${subNode.keyFormulas[0]}$`} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Quick Navigation Hints */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-300/80 text-[11px] text-slate-700 shadow-md flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#1B3D2F]">
            <Move className="w-3.5 h-3.5 text-[#D6A64F]" />
            <span>Kéo chuột để di chuyển canvas</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600">
            <span>Click vào nút để mở/thu nhánh</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEEP NODE DETAIL SLIDE-OVER INSPECTION DRAWER (DESKTOP & MOBILE) */}
      {/* ========================================================================= */}
      {selectedNode && (
        <div className="absolute top-14 bottom-0 right-0 w-full sm:w-96 md:w-[420px] bg-white border-l border-slate-300 shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 bg-[#1B3D2F] text-white flex items-center justify-between border-b border-emerald-900 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D6A64F] text-[#1B3D2F] flex items-center justify-center font-bold text-xs">
                {selectedNode.chapterRef}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D6A64F] uppercase">
                  Chi tiết kiến thức · Chương {selectedNode.chapterRef}
                </span>
                <h3 className="font-extrabold text-sm text-white line-clamp-1">
                  {selectedNode.title}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-xs text-slate-700">
            {/* Concept / Mathematical Essence */}
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-slate-200/90 space-y-1.5">
              <div className="font-bold text-[#1B3D2F] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5B6F2B]" />
                Bản chất & Khái niệm cốt lõi:
              </div>
              <div className="text-slate-700 leading-relaxed text-xs">
                <MathView content={selectedNode.concept} />
              </div>
            </div>

            {/* Formulas Box */}
            <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-xs">
              <div className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D6A64F]" />
                Công thức toán trọng tâm:
              </div>
              <div className="space-y-2">
                {selectedNode.keyFormulas.map((form, fIdx) => (
                  <div key={fIdx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 overflow-x-auto text-emerald-950">
                    <MathView content={`$$${form}$$`} displayMode={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <div className="font-bold text-amber-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                Điều kiện áp dụng & Giả định:
              </div>
              <div className="text-amber-900 leading-relaxed text-xs">
                <MathView content={selectedNode.conditions} />
              </div>
            </div>

            {/* Cross-Topic Links */}
            {selectedNode.crossLinks && selectedNode.crossLinks.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#1B3D2F]" />
                  Mối liên hệ liên chương:
                </div>
                <ul className="space-y-1 text-slate-600">
                  {selectedNode.crossLinks.map((link, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-1.5">
                      <span className="text-[#D6A64F] font-bold">•</span>
                      <span>{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practical Example */}
            {selectedNode.practicalExample && (
              <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-1.5">
                <div className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider">
                  Ví dụ thực tế kinh tế & kỹ thuật:
                </div>
                <div className="text-slate-700 leading-relaxed">
                  <MathView content={selectedNode.practicalExample} />
                </div>
              </div>
            )}

            {/* Casio fx-580VN X Guide */}
            {selectedNode.casioShortcut && (
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-slate-200 space-y-1 flex items-start gap-2">
                <Calculator className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Bấm máy Casio fx-580VN X:</div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedNode.casioShortcut}
                  </div>
                </div>
              </div>
            )}

            {/* Fast Action Buttons */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('tutor');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1B3D2F] hover:bg-[#163327] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Bot className="w-4 h-4 text-[#D6A64F]" />
                <span>Hỏi Gia sư AI về chủ đề này</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-emerald-300" />
              </button>

              <button
                onClick={() => {
                  if (onNavigateChapter) {
                    onNavigateChapter(selectedNode.chapterRef);
                  } else if (onNavigateTab) {
                    onNavigateTab('knowledge');
                  }
                }}
                className="w-full py-2 px-4 rounded-xl bg-[#F4F3EC] hover:bg-slate-200 text-[#1B3D2F] border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#5B6F2B]" />
                <span>Xem chi tiết trong Kho kiến thức</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION 6: TRỢ LÝ CHỌN PHƯƠNG PHÁP GIẢI (STANDALONE INTERACTIVE MODAL) */}
      {/* ========================================================================= */}
      {showSolverAssistant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#1B3D2F] text-white flex items-center justify-between border-b border-emerald-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D6A64F] text-[#1B3D2F] flex items-center justify-center font-black">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-white uppercase tracking-tight">
                    TRỢ LÝ CHỌN PHƯƠNG PHÁP GIẢI TOÁN XSTK
                  </h3>
                  <p className="text-[11px] text-[#D6A64F] font-semibold">
                    Định hướng tư duy · Không giải hộ số cuối · Tuân thủ Mục 6
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSolverAssistant(false)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-slate-800 text-xs">
              {/* If user has not confirmed to start yet (Requirement 6: Công cụ chỉ bắt đầu khi người học chủ động mở và nhấn "Xác nhận dùng") */}
              {!solverConfirmed ? (
                <div className="py-6 px-4 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1B3D2F] border-2 border-[#D6A64F] flex items-center justify-center mx-auto shadow-inner">
                    <Sliders className="w-8 h-8 text-[#5B6F2B]" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h4 className="font-black text-base text-[#1B3D2F] uppercase">
                      BẠN ĐANG PHÂN VÂN CHƯA BIẾT DÙNG CÔNG THỨC NÀO?
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Công cụ sẽ đặt các câu hỏi dẫn dắt từng bước giúp bạn nhận diện dạng bài, phân tích dữ kiện, kiểm tra điều kiện áp dụng và lựa chọn phương pháp tối ưu nhất.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-slate-200 text-left max-w-md mx-auto text-[11px] text-slate-700 space-y-1">
                    <div className="font-bold text-[#1B3D2F]">Cam kết phương pháp sư phạm:</div>
                    <div>• Giúp bạn tự tư duy bản chất bài toán</div>
                    <div>• Đề xuất công thức và mẹo máy tính Casio fx-580VN X</div>
                    <div>• Tuyệt đối không làm lộ toàn bộ lời giải hay tính hộ số cuối</div>
                  </div>

                  <button
                    onClick={() => {
                      setSolverConfirmed(true);
                      setCurrentSolverStep('root');
                      setSolverHistory([]);
                      setRecommendedMethod(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#5B6F2B] hover:bg-[#4d5e24] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    Xác nhận dùng trợ lý phương pháp
                  </button>
                </div>
              ) : recommendedMethod ? (
                /* Recommended Method Results Card */
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#1B3D2F] text-white font-bold text-[10px] uppercase">
                        {recommendedMethod.category}
                      </span>
                      <span className="text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đề xuất tối ưu
                      </span>
                    </div>
                    <h4 className="font-black text-base text-[#1B3D2F]">
                      {recommendedMethod.title}
                    </h4>
                    <div className="p-3 bg-white rounded-lg border border-emerald-200 text-emerald-950 overflow-x-auto">
                      <MathView content={`$$${recommendedMethod.formula}$$`} displayMode={true} />
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-slate-200 space-y-1.5">
                    <div className="font-bold text-[#1B3D2F] text-[11px] uppercase tracking-wider">
                      Điều kiện kiểm tra trước khi áp dụng:
                    </div>
                    <ul className="space-y-1 text-slate-700">
                      {recommendedMethod.conditions.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Step by step action plan */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="font-bold text-[#1B3D2F] text-[11px] uppercase tracking-wider">
                      Chiến lược từng bước giải:
                    </div>
                    <div className="space-y-1.5">
                      {recommendedMethod.steps.map((st: string, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                          {st}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Casio Tip */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-amber-800 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-950">Mẹo Casio fx-580VN X: </span>
                      <span className="text-amber-900">{recommendedMethod.casioGuide}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleSolverBack}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      ← Chọn lại tiêu chí khác
                    </button>
                    <button
                      onClick={handleResetSolver}
                      className="px-4 py-2 rounded-xl bg-[#1B3D2F] text-white hover:bg-[#163327] font-bold text-xs"
                    >
                      Tra cứu dạng bài khác
                    </button>
                  </div>
                </div>
              ) : (
                /* Step Question Options */
                <div className="space-y-4">
                  {solverHistory.length > 0 && (
                    <button
                      onClick={handleSolverBack}
                      className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      ← Quay lại bước trước
                    </button>
                  )}

                  <div className="font-extrabold text-sm text-[#1B3D2F]">
                    {SOLVER_ASSISTANT_TREE[currentSolverStep]?.question}
                  </div>

                  <div className="space-y-2.5">
                    {SOLVER_ASSISTANT_TREE[currentSolverStep]?.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSolverOptionClick(opt)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#1B3D2F] hover:bg-emerald-50/60 transition-all flex items-start justify-between group shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-[#1B3D2F] group-hover:text-emerald-900">
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {opt.description}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B3D2F] shrink-0 mt-1 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
