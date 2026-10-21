import React, { useState, useMemo, useEffect } from 'react';
import { 
  FlaskConical, 
  Coins, 
  Dices, 
  TrendingUp, 
  RotateCcw, 
  Play, 
  Pause, 
  HelpCircle, 
  CheckCircle, 
  Info, 
  Sliders, 
  BarChart3, 
  Layers, 
  Target, 
  Sparkles, 
  Calculator, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Box,
  CreditCard,
  GitBranch,
  Activity,
  Award
} from 'lucide-react';
import { MathView } from './MathView';
import { UserProfile } from '../types';

interface ProbabilityLabProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
}

export type LabCategory = 'basic' | 'distributions' | 'bayes' | 'business_clt';
export type SimId = 'coin' | 'dice' | 'urn' | 'cards' | 'distributions' | 'bayes' | 'business' | 'clt';

export const ProbabilityLab: React.FC<ProbabilityLabProps> = ({ currentUser, onActivityCompleted }) => {
  const [activeCategory, setActiveCategory] = useState<LabCategory>('basic');
  const [activeSim, setActiveSim] = useState<SimId>('coin');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // ==========================================
  // 1. COIN TOSS SIMULATION (LLN)
  // ==========================================
  const [coinP, setCoinP] = useState<number>(0.5);
  const [coinCoinsCount, setCoinCoinsCount] = useState<number>(1);
  const [coinHeads, setCoinHeads] = useState<number>(0);
  const [coinTails, setCoinTails] = useState<number>(0);
  const [coinHistory, setCoinHistory] = useState<{ trial: number; headsPct: number; theoPct: number }[]>([]);

  const runCoinToss = (trials: number) => {
    let heads = coinHeads;
    let tails = coinTails;

    for (let i = 0; i < trials; i++) {
      for (let c = 0; c < coinCoinsCount; c++) {
        if (Math.random() < coinP) heads++;
        else tails++;
      }
    }

    setCoinHeads(heads);
    setCoinTails(tails);

    const total = heads + tails;
    const currentHeadsPct = (heads / total) * 100;
    setCoinHistory((prev) => [
      ...prev.slice(-19),
      {
        trial: total,
        headsPct: Number(currentHeadsPct.toFixed(1)),
        theoPct: Number((coinP * 100).toFixed(1)),
      },
    ]);
    onActivityCompleted(1, 'Thực hiện mô phỏng tung đồng xu Monte Carlo');
  };

  const resetCoin = () => {
    setCoinHeads(0);
    setCoinTails(0);
    setCoinHistory([]);
  };

  // ==========================================
  // 2. DICE SIMULATION
  // ==========================================
  const [diceCount, setDiceCount] = useState<number>(2); // 1 or 2 dice
  const [diceTotalRolls, setDiceTotalRolls] = useState<number>(0);
  const [diceFrequencies, setDiceFrequencies] = useState<{ [sum: number]: number }>({
    2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
  });
  const [singleDiceFreqs, setSingleDiceFreqs] = useState<{ [face: number]: number }>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
  });

  const rollDice = (times: number) => {
    let rolls = diceTotalRolls + times;

    if (diceCount === 1) {
      const f = { ...singleDiceFreqs };
      for (let i = 0; i < times; i++) {
        const r = Math.floor(Math.random() * 6) + 1;
        f[r] = (f[r] || 0) + 1;
      }
      setSingleDiceFreqs(f);
    } else {
      const f = { ...diceFrequencies };
      for (let i = 0; i < times; i++) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const sum = d1 + d2;
        f[sum] = (f[sum] || 0) + 1;
      }
      setDiceFrequencies(f);
    }
    setDiceTotalRolls(rolls);
    onActivityCompleted(1, 'Thực hiện mô phỏng gieo xúc xắc');
  };

  const resetDice = () => {
    setDiceTotalRolls(0);
    setDiceFrequencies({ 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 });
    setSingleDiceFreqs({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  };

  const theoreticalTwoDiceProb: { [sum: number]: number } = {
    2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36, 7: 6/36, 8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36
  };

  // ==========================================
  // 3. URN & MARBLES SIMULATION (HYPERGEOMETRIC VS BINOMIAL)
  // ==========================================
  const [urnRed, setUrnRed] = useState<number>(6);
  const [urnBlue, setUrnBlue] = useState<number>(4);
  const [urnDrawCount, setUrnDrawCount] = useState<number>(3);
  const [urnWithReplacement, setUrnWithReplacement] = useState<boolean>(false);
  const [urnTargetRed, setUrnTargetRed] = useState<number>(2);
  const [urnTotalTrials, setUrnTotalTrials] = useState<number>(0);
  const [urnSuccessTrials, setUrnSuccessTrials] = useState<number>(0);

  const urnTotalMarbles = urnRed + urnBlue;

  // Theoretical probability calculation
  const urnTheoProb = useMemo(() => {
    const N = urnRed + urnBlue;
    const K = urnRed;
    const n = urnDrawCount;
    const k = urnTargetRed;

    if (k > n || k > K || (n - k) > (N - K)) return 0;

    const comb = (n: number, k: number) => {
      if (k < 0 || k > n) return 0;
      let res = 1;
      for (let i = 1; i <= k; i++) res = (res * (n - (k - i))) / i;
      return res;
    };

    if (urnWithReplacement) {
      // Binomial: C_n^k p^k (1-p)^{n-k} with p = K/N
      const p = K / N;
      return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    } else {
      // Hypergeometric: C_K^k * C_{N-K}^{n-k} / C_N^n
      return (comb(K, k) * comb(N - K, n - k)) / comb(N, n);
    }
  }, [urnRed, urnBlue, urnDrawCount, urnTargetRed, urnWithReplacement]);

  const runUrnSimulation = (trials: number) => {
    let success = urnSuccessTrials;
    const N = urnRed + urnBlue;

    for (let t = 0; t < trials; t++) {
      let redDrawn = 0;

      if (urnWithReplacement) {
        // With replacement
        for (let d = 0; d < urnDrawCount; d++) {
          if (Math.random() < urnRed / N) redDrawn++;
        }
      } else {
        // Without replacement: draw step-by-step
        let curRed = urnRed;
        let curTotal = N;
        for (let d = 0; d < urnDrawCount; d++) {
          if (Math.random() < curRed / curTotal) {
            redDrawn++;
            curRed--;
          }
          curTotal--;
        }
      }

      if (redDrawn === urnTargetRed) {
        success++;
      }
    }

    setUrnSuccessTrials(success);
    setUrnTotalTrials(urnTotalTrials + trials);
    onActivityCompleted(1, 'Mô phỏng rút bi từ hộp (Urn model)');
  };

  const resetUrn = () => {
    setUrnTotalTrials(0);
    setUrnSuccessTrials(0);
  };

  // ==========================================
  // 4. CARDS DECK SIMULATION (52 CARDS)
  // ==========================================
  const [cardTargetEvent, setCardTargetEvent] = useState<'ace' | 'heart' | 'red' | 'pair'>('ace');
  const [cardWithReplacement, setCardWithReplacement] = useState<boolean>(false);
  const [cardDraws, setCardDraws] = useState<number>(2);
  const [cardTotalTrials, setCardTotalTrials] = useState<number>(0);
  const [cardSuccessTrials, setCardSuccessTrials] = useState<number>(0);

  const cardTheoProb = useMemo(() => {
    if (cardTargetEvent === 'ace') {
      // At least 1 ace in cardDraws cards
      if (cardWithReplacement) {
        return 1 - Math.pow(48 / 52, cardDraws);
      } else {
        // Hypergeometric: 1 - C_48^d / C_52^d
        const comb = (n: number, k: number) => {
          if (k < 0 || k > n) return 0;
          let r = 1;
          for (let i = 1; i <= k; i++) r = (r * (n - (k - i))) / i;
          return r;
        };
        return 1 - (comb(48, cardDraws) / comb(52, cardDraws));
      }
    } else if (cardTargetEvent === 'heart') {
      // All hearts
      if (cardWithReplacement) {
        return Math.pow(13 / 52, cardDraws);
      } else {
        const comb = (n: number, k: number) => {
          if (k < 0 || k > n) return 0;
          let r = 1;
          for (let i = 1; i <= k; i++) r = (r * (n - (k - i))) / i;
          return r;
        };
        return comb(13, cardDraws) / comb(52, cardDraws);
      }
    } else if (cardTargetEvent === 'red') {
      // All red cards
      if (cardWithReplacement) {
        return Math.pow(26 / 52, cardDraws);
      } else {
        const comb = (n: number, k: number) => {
          if (k < 0 || k > n) return 0;
          let r = 1;
          for (let i = 1; i <= k; i++) r = (r * (n - (k - i))) / i;
          return r;
        };
        return comb(26, cardDraws) / comb(52, cardDraws);
      }
    } else {
      // Pair (exact 2 cards of same rank when drawing 2 cards)
      if (cardDraws === 2) {
        return cardWithReplacement ? 1 / 13 : 3 / 51;
      }
      return 0.0588;
    }
  }, [cardTargetEvent, cardWithReplacement, cardDraws]);

  const runCardSimulation = (trials: number) => {
    let success = cardSuccessTrials;

    for (let t = 0; t < trials; t++) {
      // Create deck: 52 cards (ranks 1-13, suits 1-4: 1=heart, 2=diamond, 3=club, 4=spade)
      let deck: { rank: number; suit: number }[] = [];
      for (let s = 1; s <= 4; s++) {
        for (let r = 1; r <= 13; r++) {
          deck.push({ rank: r, suit: s });
        }
      }

      let drawn: { rank: number; suit: number }[] = [];
      if (cardWithReplacement) {
        for (let i = 0; i < cardDraws; i++) {
          drawn.push(deck[Math.floor(Math.random() * 52)]);
        }
      } else {
        for (let i = 0; i < cardDraws; i++) {
          const idx = Math.floor(Math.random() * deck.length);
          drawn.push(deck.splice(idx, 1)[0]);
        }
      }

      let match = false;
      if (cardTargetEvent === 'ace') {
        match = drawn.some(c => c.rank === 1);
      } else if (cardTargetEvent === 'heart') {
        match = drawn.every(c => c.suit === 1);
      } else if (cardTargetEvent === 'red') {
        match = drawn.every(c => c.suit === 1 || c.suit === 2);
      } else if (cardTargetEvent === 'pair') {
        if (drawn.length >= 2) {
          const ranks = drawn.map(c => c.rank);
          match = new Set(ranks).size < ranks.length;
        }
      }

      if (match) success++;
    }

    setCardSuccessTrials(success);
    setCardTotalTrials(cardTotalTrials + trials);
    onActivityCompleted(1, 'Mô phỏng rút bài Tây 52 lá');
  };

  const resetCards = () => {
    setCardTotalTrials(0);
    setCardSuccessTrials(0);
  };

  // ==========================================
  // 5. BAYES & DIAGNOSTIC SCREENING SIMULATION
  // ==========================================
  const [bayesPrevalence, setBayesPrevalence] = useState<number>(0.02); // 2% prevalence P(D)
  const [bayesSensitivity, setBayesSensitivity] = useState<number>(0.95); // 95% sensitivity P(+|D)
  const [bayesFalsePositive, setBayesFalsePositive] = useState<number>(0.05); // 5% false positive P(+|~D)
  const [bayesSampleSize, setBayesSampleSize] = useState<number>(1000);
  const [bayesSimResults, setBayesSimResults] = useState<{
    total: number;
    disease: number;
    healthy: number;
    truePos: number;
    falsePos: number;
    trueNeg: number;
    falseNeg: number;
  } | null>(null);

  // Theoretical Bayes calculation: P(D|+) = P(D)P(+|D) / [ P(D)P(+|D) + P(~D)P(+|~D) ]
  const bayesTheoPostProb = useMemo(() => {
    const pD = bayesPrevalence;
    const pNotD = 1 - pD;
    const pPosGivenD = bayesSensitivity;
    const pPosGivenNotD = bayesFalsePositive;
    const pTotalPos = (pD * pPosGivenD) + (pNotD * pPosGivenNotD);
    return (pD * pPosGivenD) / pTotalPos;
  }, [bayesPrevalence, bayesSensitivity, bayesFalsePositive]);

  const runBayesSimulation = () => {
    let disease = 0;
    let healthy = 0;
    let truePos = 0;
    let falsePos = 0;
    let trueNeg = 0;
    let falseNeg = 0;

    for (let i = 0; i < bayesSampleSize; i++) {
      const hasDisease = Math.random() < bayesPrevalence;
      if (hasDisease) {
        disease++;
        if (Math.random() < bayesSensitivity) {
          truePos++;
        } else {
          falseNeg++;
        }
      } else {
        healthy++;
        if (Math.random() < bayesFalsePositive) {
          falsePos++;
        } else {
          trueNeg++;
        }
      }
    }

    setBayesSimResults({
      total: bayesSampleSize,
      disease,
      healthy,
      truePos,
      falsePos,
      trueNeg,
      falseNeg,
    });
    onActivityCompleted(1, 'Chạy mô phỏng cây xác suất Bayes');
  };

  // ==========================================
  // 6. 6 PROBABILITY DISTRIBUTIONS SIMULATION
  // ==========================================
  const [distModel, setDistModel] = useState<'normal' | 'binomial' | 'poisson' | 'bernoulli' | 'uniform' | 'exponential'>('normal');
  const [normMu, setNormMu] = useState<number>(0);
  const [normSigma, setNormSigma] = useState<number>(1);
  const [binomN, setBinomN] = useState<number>(10);
  const [binomP, setBinomP] = useState<number>(0.5);
  const [poissonLambda, setPoissonLambda] = useState<number>(4);
  const [unifA, setUnifA] = useState<number>(0);
  const [unifB, setUnifB] = useState<number>(10);
  const [expLambda, setExpLambda] = useState<number>(0.5);

  const [distGeneratedSamples, setDistGeneratedSamples] = useState<number[]>([]);

  const generateDistSamples = (count = 100) => {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      if (distModel === 'bernoulli') {
        samples.push(Math.random() < binomP ? 1 : 0);
      } else if (distModel === 'binomial') {
        let succ = 0;
        for (let j = 0; j < binomN; j++) {
          if (Math.random() < binomP) succ++;
        }
        samples.push(succ);
      } else if (distModel === 'poisson') {
        // Knuth's algorithm for Poisson
        let L = Math.exp(-poissonLambda);
        let k = 0;
        let p = 1;
        do {
          k++;
          p *= Math.random();
        } while (p > L);
        samples.push(k - 1);
      } else if (distModel === 'normal') {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
        samples.push(Number((normMu + z0 * normSigma).toFixed(2)));
      } else if (distModel === 'uniform') {
        samples.push(Number((unifA + Math.random() * (unifB - unifA)).toFixed(2)));
      } else if (distModel === 'exponential') {
        // Inverse transform: -ln(U) / lambda
        samples.push(Number((-Math.log(Math.random() || 0.0001) / expLambda).toFixed(2)));
      }
    }
    setDistGeneratedSamples(samples);
  };

  // ==========================================
  // 7. BUSINESS CONVERSION / APPLICATION SIMULATION
  // ==========================================
  const [bizReach, setBizReach] = useState<number>(100);
  const [bizConvRate, setBizConvRate] = useState<number>(0.05); // 5% conversion
  const [bizSimulationRun, setBizSimulationRun] = useState<{
    conversions: number;
    rate: number;
    expected: number;
    probAtLeastOne: number;
  } | null>(null);

  const runBizSimulation = () => {
    let conversions = 0;
    for (let i = 0; i < bizReach; i++) {
      if (Math.random() < bizConvRate) conversions++;
    }
    const rate = conversions / bizReach;
    const expected = bizReach * bizConvRate;
    const probAtLeastOne = 1 - Math.pow(1 - bizConvRate, bizReach);

    setBizSimulationRun({
      conversions,
      rate,
      expected,
      probAtLeastOne,
    });
    onActivityCompleted(1, 'Chạy mô phỏng kinh doanh tỷ lệ chuyển đổi');
  };

  // ==========================================
  // 8. CENTRAL LIMIT THEOREM (CLT) & LLN
  // ==========================================
  const [cltBaseDist, setCltBaseDist] = useState<'uniform' | 'exponential' | 'binomial'>('uniform');
  const [cltSampleSize, setCltSampleSize] = useState<number>(30); // n
  const [cltNumSamples, setCltNumSamples] = useState<number>(500); // M
  const [cltSampleMeans, setCltSampleMeans] = useState<number[]>([]);

  const runCLTSimulation = () => {
    const means: number[] = [];

    for (let m = 0; m < cltNumSamples; m++) {
      let sum = 0;
      for (let i = 0; i < cltSampleSize; i++) {
        if (cltBaseDist === 'uniform') {
          // Uniform(0, 10): E = 5, Var = 100/12 = 8.33
          sum += Math.random() * 10;
        } else if (cltBaseDist === 'exponential') {
          // Exp(lambda = 1): E = 1, Var = 1
          sum += -Math.log(Math.random() || 0.0001);
        } else {
          // Binomial(10, 0.3): E = 3
          let b = 0;
          for (let j = 0; j < 10; j++) if (Math.random() < 0.3) b++;
          sum += b;
        }
      }
      means.push(Number((sum / cltSampleSize).toFixed(3)));
    }

    setCltSampleMeans(means);
    onActivityCompleted(2, 'Chạy mô phỏng Định lý Giới hạn Trung tâm (CLT)');
  };

  const simsList = [
    { id: 'coin', label: 'Tung đồng xu', icon: Coins, category: 'basic' },
    { id: 'dice', label: 'Gieo xúc xắc', icon: Dices, category: 'basic' },
    { id: 'urn', label: 'Rút bi từ hộp', icon: Box, category: 'basic' },
    { id: 'cards', label: 'Rút bài 52 lá', icon: CreditCard, category: 'basic' },
    { id: 'bayes', label: 'Cây xác suất & Bayes', icon: GitBranch, category: 'bayes' },
    { id: 'distributions', label: '6 Phân phối xác suất', icon: BarChart3, category: 'distributions' },
    { id: 'business', label: 'Ứng dụng kinh doanh', icon: TrendingUp, category: 'business_clt' },
    { id: 'clt', label: 'Định lý Giới hạn CLT', icon: Activity, category: 'business_clt' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              PHÒNG THÍ NGHIỆM XSTK TƯƠNG TÁC
            </span>
            <span className="text-xs text-emerald-300">Mô phỏng Monte Carlo & Trực quan hóa số lớn</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-[#D6A64F]" />
            Phòng Thí Nghiệm Xác Suất
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Môi trường thực nghiệm ảo giúp sinh viên quan sát quy luật số lớn (LLN), tương tác trực quan với biểu đồ cột, thay đổi tham số và so sánh xác suất lý thuyết với tần suất thực nghiệm.
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-[#D6A64F]" />
          <span>{showExplanation ? 'Ẩn giải thích sư phạm' : 'Xem giải thích sư phạm 7 câu hỏi'}</span>
        </button>
      </div>

      {/* CATEGORY & SIMULATION SELECTOR TABS */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5">
          {[
            { id: 'basic', label: '1. Xác suất cơ bản & Tổ hợp' },
            { id: 'bayes', label: '2. Xác suất có điều kiện & Bayes' },
            { id: 'distributions', label: '3. Phân phối xác suất' },
            { id: 'business_clt', label: '4. Ứng dụng & Định lý giới hạn' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as LabCategory);
                const firstInCat = simsList.find(s => s.category === cat.id);
                if (firstInCat) setActiveSim(firstInCat.id as SimId);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1B3D2F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sub-simulation pills in active category */}
        <div className="flex flex-wrap items-center gap-2">
          {simsList.filter(s => s.category === activeCategory).map((sim) => {
            const Icon = sim.icon;
            const isActive = activeSim === sim.id;
            return (
              <button
                key={sim.id}
                onClick={() => setActiveSim(sim.id as SimId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-[#5B6F2B] text-white border-[#5B6F2B] shadow-sm ring-1 ring-[#D6A64F]/50'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6A64F]' : 'text-slate-500'}`} />
                <span>{sim.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SIMULATION 1: COIN TOSS (LLN) */}
      {/* ======================================================== */}
      {activeSim === 'coin' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#D6A64F]" />
                  Mô phỏng Tung đồng xu (Kiểm chứng Quy luật số lớn LLN)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quan sát tần suất thực nghiệm mặt Ngửa hội tụ về xác suất lý thuyết p khi số lần thử tăng.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runCoinToss(1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  Tung 1 lần
                </button>
                <button
                  onClick={() => runCoinToss(10)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all"
                >
                  Tung 10 lần
                </button>
                <button
                  onClick={() => runCoinToss(100)}
                  className="px-4 py-2 rounded-xl bg-[#1B3D2F] hover:bg-[#163327] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Tung 100 lần
                </button>
                <button
                  onClick={() => runCoinToss(1000)}
                  className="px-4 py-2 rounded-xl bg-[#D6A64F] hover:bg-[#c2933f] text-[#1B3D2F] text-xs font-bold transition-all shadow-sm"
                >
                  Tung 1000 lần
                </button>
                <button
                  onClick={resetCoin}
                  title="Đặt lại"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Xác suất mặt Ngửa p lý thuyết:</span>
                  <span className="font-mono text-emerald-800 font-bold">{coinP} ({Math.round(coinP * 100)}%)</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={coinP}
                  onChange={(e) => setCoinP(Number(e.target.value))}
                  className="w-full accent-[#1B3D2F]"
                />
                <span className="text-[11px] text-slate-500">Đồng xu chuẩn là p = 0.5 (cân đối). Có thể chỉnh p để mô phỏng đồng xu không cân đối.</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Số đồng xu gieo mỗi lần:</span>
                  <span className="font-mono text-emerald-800 font-bold">{coinCoinsCount} đồng xu</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={coinCoinsCount}
                  onChange={(e) => setCoinCoinsCount(Number(e.target.value))}
                  className="w-full accent-[#1B3D2F]"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500">Tổng số lần tung:</span>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{coinHeads + coinTails}</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-700">Mặt Ngửa (H):</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{coinHeads}</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs text-amber-700">Mặt Sấp (T):</span>
                <div className="text-2xl font-bold text-amber-900 mt-1 font-mono">{coinTails}</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs text-blue-700">Tỷ lệ thực nghiệm:</span>
                <div className="text-2xl font-bold text-blue-900 mt-1 font-mono">
                  {coinHeads + coinTails > 0 ? `${((coinHeads / (coinHeads + coinTails)) * 100).toFixed(1)}%` : '0%'}
                </div>
                <span className="text-[10px] text-blue-600">Lý thuyết: {Math.round(coinP * 100)}%</span>
              </div>
            </div>

            {/* Cumulative Convergence Chart (SVG) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Biểu đồ hội tụ quy luật số lớn (Tỷ lệ ngửa thực nghiệm qua các lần tung)</span>
                <span className="text-emerald-700">Đường đỏ: Xác suất lý thuyết p = {coinP}</span>
              </div>

              {coinHistory.length > 1 ? (
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    {/* Theoretical line */}
                    <line
                      x1="0"
                      y1={150 - (coinP * 150)}
                      x2="500"
                      y2={150 - (coinP * 150)}
                      stroke="#e11d48"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Experimental points polyline */}
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      points={coinHistory.map((h, i) => {
                        const x = (i / (coinHistory.length - 1)) * 500;
                        const y = 150 - (h.headsPct / 100) * 150;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                  Nhấn "Tung 10 lần", "Tung 100 lần" hoặc "Tung 1000 lần" để bắt đầu quan sát đường hội tụ.
                </div>
              )}
            </div>
          </div>

          {/* 7-Question Pedagogical Explanation */}
          {showExplanation && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700 space-y-3">
              <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Giải thích Sư phạm 7 Câu hỏi về Mô phỏng Tung đồng xu
              </h4>
              <ol className="list-decimal ml-5 space-y-1.5 leading-relaxed">
                <li><strong>Chúng ta đang mô phỏng điều gì?</strong> Mô phỏng phép thử Bernoulli độc lập lặp lại nhiều lần với 2 kết quả khả dĩ: Ngửa (1) hoặc Sấp (0).</li>
                <li><strong>Biến cố là gì?</strong> Biến cố <MathView content="$A$" />: "Đồng xu xuất hiện mặt Ngửa".</li>
                <li><strong>Công thức lý thuyết:</strong> <MathView content="Định luật số lớn Bernoulli: $\lim_{n \to \infty} P\left(\left|\frac{m}{n} - p\right| \ge \epsilon\right) = 0$." /></li>
                <li><strong>Kết quả lý thuyết:</strong> <MathView content="Xác suất cố định $P(A) = p$." /></li>
                <li><strong>Ý nghĩa mô phỏng:</strong> Giúp người học thấy rõ trực quan: xác suất không phải là con số chắc chắn ở từng lần thử đơn lẻ, mà là xu hướng ổn định của tần suất khi thực hiện phép thử vô số lần.</li>
                <li><strong>Vì sao thực nghiệm có thể khác lý thuyết?</strong> <MathView content="Do tính chất ngẫu nhiên nội tại trong mẫu nhỏ; tần suất có thể dao động quanh $p$ trước khi ổn định." /></li>
                <li><strong>Khi tăng số lần thử:</strong> <MathView content="Độ dao động $|\frac{m}{n} - p|$ thu hẹp dần và tiến sát về đường lý thuyết $p$." /></li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 2: DICE ROLLING (HISTOGRAM) */}
      {/* ======================================================== */}
      {activeSim === 'dice' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Dices className="w-5 h-5 text-emerald-700" />
                  Mô phỏng Gieo xúc xắc (Biểu đồ cột Histogram)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  So sánh phân phối tần suất thực nghiệm với phân phối lý thuyết (Đều với 1 xúc xắc, Hình tam giác với 2 xúc xắc).
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => rollDice(1)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Gieo 1 lần
                </button>
                <button
                  onClick={() => rollDice(50)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold"
                >
                  Gieo 50 lần
                </button>
                <button
                  onClick={() => rollDice(500)}
                  className="px-4 py-2 rounded-xl bg-[#1B3D2F] hover:bg-[#163327] text-white text-xs font-bold shadow-sm"
                >
                  Gieo 500 lần
                </button>
                <button
                  onClick={resetDice}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode: 1 dice or 2 dice */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Chọn chế độ gieo:</span>
              <button
                onClick={() => setDiceCount(1)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  diceCount === 1 ? 'bg-[#1B3D2F] text-white' : 'bg-white border text-slate-600'
                }`}
              >
                1 Xúc xắc (Phân phối đều 1-6)
              </button>
              <button
                onClick={() => setDiceCount(2)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  diceCount === 2 ? 'bg-[#1B3D2F] text-white' : 'bg-white border text-slate-600'
                }`}
              >
                2 Xúc xắc (Tổng điểm từ 2 đến 12)
              </button>
              <span className="text-slate-400 ml-auto">Tổng số lần gieo: <strong>{diceTotalRolls}</strong></span>
            </div>

            {/* Clear Bar Chart (Histogram) */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Biểu đồ cột tần suất (Histogram) so sánh Thực nghiệm (Cột xanh) vs Lý thuyết (Vạch đỏ)</span>
                <span className="text-emerald-800">Tổng điểm thường xuất hiện nhất: 7 (xác suất 6/36 ≈ 16.7%)</span>
              </div>

              {diceCount === 1 ? (
                // 1 Dice histogram
                <div className="grid grid-cols-6 gap-2 pt-6 items-end h-48 border-b border-slate-300">
                  {[1, 2, 3, 4, 5, 6].map((face) => {
                    const count = singleDiceFreqs[face] || 0;
                    const pct = diceTotalRolls > 0 ? (count / diceTotalRolls) * 100 : 0;
                    const theoPct = (1 / 6) * 100;

                    return (
                      <div key={face} className="flex flex-col items-center h-full justify-end group relative">
                        <span className="text-[10px] font-bold text-slate-700 mb-1">{pct.toFixed(1)}%</span>
                        <div 
                          className="w-full bg-emerald-600 rounded-t-lg transition-all duration-300 min-h-[4px]"
                          style={{ height: `${Math.min(100, pct * 3.5)}%` }}
                        />
                        <span className="mt-2 text-xs font-bold text-slate-800">Mặt {face}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // 2 Dice sum histogram (2-12)
                <div className="grid grid-cols-11 gap-1.5 pt-6 items-end h-48 border-b border-slate-300">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sum) => {
                    const count = diceFrequencies[sum] || 0;
                    const pct = diceTotalRolls > 0 ? (count / diceTotalRolls) * 100 : 0;
                    const theoPct = (theoreticalTwoDiceProb[sum] || 0) * 100;

                    return (
                      <div key={sum} className="flex flex-col items-center h-full justify-end relative">
                        <span className="text-[10px] font-bold text-slate-700 mb-1">{pct.toFixed(0)}%</span>
                        <div 
                          className="w-full bg-[#1B3D2F] rounded-t-md transition-all duration-300 min-h-[4px]"
                          style={{ height: `${Math.min(100, pct * 4)}%` }}
                        />
                        <span className="mt-2 text-xs font-bold text-slate-800">{sum}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-amber-950 text-sm">Bản chất phân phối tổng hai con xúc xắc:</h4>
              <p>
                Không gian mẫu gồm $6 \times 6 = 36$ cặp kết quả đồng khả năng. Tổng điểm 7 có nhiều cách tạo thành nhất (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) nên xác suất lý thuyết cao nhất là $P(X=7) = 6/36 = 16.67\%$. Các tổng điểm ở hai biên (2 và 12) chỉ có duy nhất 1 cách tạo thành nên xác suất thấp nhất là $1/36 \approx 2.78\%$.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 3: URN & MARBLES (HYPERGEOMETRIC) */}
      {/* ======================================================== */}
      {activeSim === 'urn' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Box className="w-5 h-5 text-purple-700" />
                  Mô phỏng Rút bi từ hộp (Phân phối Siêu bội & Nhị thức)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Khám phá sự khác biệt cốt lõi giữa Rút có hoàn lại (độc lập) và Rút không hoàn lại (phụ thuộc).
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runUrnSimulation(1)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Rút 1 lần
                </button>
                <button
                  onClick={() => runUrnSimulation(100)}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold"
                >
                  Rút 100 lần
                </button>
                <button
                  onClick={() => runUrnSimulation(1000)}
                  className="px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold shadow-sm"
                >
                  Rút 1000 lần
                </button>
                <button onClick={resetUrn} className="p-2 text-slate-400 hover:text-slate-600">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Parameter Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <label className="font-semibold block mb-1">Số bi Đỏ trong hộp:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={urnRed}
                  onChange={(e) => setUrnRed(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Số bi Xanh trong hộp:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={urnBlue}
                  onChange={(e) => setUrnBlue(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Số bi cần rút (n):</label>
                <input
                  type="number"
                  min="1"
                  max={urnRed + urnBlue}
                  value={urnDrawCount}
                  onChange={(e) => setUrnDrawCount(Math.min(urnRed + urnBlue, Math.max(1, Number(e.target.value))))}
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Biến cố theo dõi (số bi đỏ):</label>
                <input
                  type="number"
                  min="0"
                  max={urnDrawCount}
                  value={urnTargetRed}
                  onChange={(e) => setUrnTargetRed(Math.min(urnDrawCount, Math.max(0, Number(e.target.value))))}
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Mode Toggle: Replacement vs No Replacement */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700">Phương thức rút:</span>
              <button
                onClick={() => setUrnWithReplacement(false)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  !urnWithReplacement ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-700 border'
                }`}
              >
                Rút không hoàn lại (Hypergeometric - Siêu bội)
              </button>
              <button
                onClick={() => setUrnWithReplacement(true)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  urnWithReplacement ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-700 border'
                }`}
              >
                Rút có hoàn lại (Binomial - Nhị thức)
              </button>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-xs text-purple-800 font-semibold">Xác suất lý thuyết:</span>
                <div className="text-2xl font-bold text-purple-950 mt-1 font-mono">
                  {(urnTheoProb * 100).toFixed(2)}%
                </div>
                <span className="text-[11px] text-purple-600">
                  {urnWithReplacement ? 'Công thức Bernoulli' : 'Công thức Tổ hợp C_n^k'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-semibold">Tần suất thực nghiệm:</span>
                <div className="text-2xl font-bold text-emerald-950 mt-1 font-mono">
                  {urnTotalTrials > 0 ? `${((urnSuccessTrials / urnTotalTrials) * 100).toFixed(2)}%` : '0.00%'}
                </div>
                <span className="text-[11px] text-emerald-600">
                  {urnSuccessTrials} / {urnTotalTrials} lần thành công
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-600 font-semibold">Độ lệch sai số:</span>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {urnTotalTrials > 0 
                    ? `${Math.abs((urnSuccessTrials / urnTotalTrials) * 100 - urnTheoProb * 100).toFixed(2)}%` 
                    : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 4: 52 CARDS DECK */}
      {/* ======================================================== */}
      {activeSim === 'cards' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  Mô phỏng Rút bài (Bộ bài tiêu chuẩn 52 lá)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bộ bài chuẩn 52 lá không tính Joker, phân tích xác suất rút được lá Át, lá Cơ, lá Đỏ hoặc Một cặp.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => runCardSimulation(10)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Rút 10 lần
                </button>
                <button
                  onClick={() => runCardSimulation(500)}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm"
                >
                  Rút 500 lần
                </button>
                <button onClick={resetCards} className="p-2 text-slate-400 hover:text-slate-600">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Event Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: 'ace', label: 'Có ít nhất 1 lá Át (A)' },
                { id: 'heart', label: 'Tất cả lá rút đều là lá Cơ (♥)' },
                { id: 'red', label: 'Tất cả lá rút đều là lá Đỏ (♥, ♦)' },
                { id: 'pair', label: 'Rút được một Cặp bài cùng số' },
              ].map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setCardTargetEvent(ev.id as any);
                    resetCards();
                  }}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    cardTargetEvent === ev.id
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {ev.label}
                </button>
              ))}
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-xs text-rose-800 font-semibold">Xác suất lý thuyết:</span>
                <div className="text-2xl font-bold text-rose-950 mt-1 font-mono">
                  {(cardTheoProb * 100).toFixed(2)}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-semibold">Tần suất thực nghiệm:</span>
                <div className="text-2xl font-bold text-emerald-950 mt-1 font-mono">
                  {cardTotalTrials > 0 ? `${((cardSuccessTrials / cardTotalTrials) * 100).toFixed(2)}%` : '0.00%'}
                </div>
                <span className="text-[11px] text-emerald-600">
                  {cardSuccessTrials} / {cardTotalTrials} lượt thành công
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-600 font-semibold">Số lá rút mỗi lần:</span>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{cardDraws} lá</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 5: BAYES & SCREENING */}
      {/* ======================================================== */}
      {activeSim === 'bayes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-indigo-700" />
                  Mô phỏng Cây xác suất & Công thức Bayes (KCS / Chẩn đoán)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  *Tình huống giáo dục giả định*: Minh họa nghịch lý xác suất dương tính giả khi tỷ lệ nền thấp.
                </p>
              </div>

              <button
                onClick={runBayesSimulation}
                className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                Chạy mô phỏng mẫu
              </button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Tỷ lệ nền P(D):</span>
                  <span className="font-mono text-indigo-800 font-bold">{(bayesPrevalence * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.2"
                  step="0.005"
                  value={bayesPrevalence}
                  onChange={(e) => setBayesPrevalence(Number(e.target.value))}
                  className="w-full accent-indigo-700"
                />
                <span className="text-[10px] text-slate-500">Tỷ lệ sản phẩm lỗi hoặc người mang mầm bệnh trong cộng đồng.</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Độ nhạy P(+|D):</span>
                  <span className="font-mono text-indigo-800 font-bold">{(bayesSensitivity * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="0.99"
                  step="0.01"
                  value={bayesSensitivity}
                  onChange={(e) => setBayesSensitivity(Number(e.target.value))}
                  className="w-full accent-indigo-700"
                />
                <span className="text-[10px] text-slate-500">Khả năng test phát hiện đúng khi thực sự có bệnh.</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Tỷ lệ dương tính giả P(+|~D):</span>
                  <span className="font-mono text-indigo-800 font-bold">{(bayesFalsePositive * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.1"
                  step="0.01"
                  value={bayesFalsePositive}
                  onChange={(e) => setBayesFalsePositive(Number(e.target.value))}
                  className="w-full accent-indigo-700"
                />
                <span className="text-[10px] text-slate-500">Người khỏe mạnh nhưng test báo nhầm kết quả dương tính.</span>
              </div>
            </div>

            {/* Bayes Result Comparison */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">
                  Xác suất thực sự bị lỗi khi test báo Dương tính P(D|+):
                </span>
                <div className="text-3xl font-extrabold text-indigo-950 font-mono mt-1">
                  {(bayesTheoPostProb * 100).toFixed(2)}%
                </div>
                <p className="text-xs text-indigo-700 mt-2 leading-relaxed">
                  Ngay cả khi độ nhạy cao đến {(bayesSensitivity * 100).toFixed(0)}%, do tỷ lệ nền thấp ({(bayesPrevalence * 100).toFixed(1)}%), đa số kết quả test dương tính lại là dương tính giả!
                </p>
              </div>

              {bayesSimResults && (
                <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3.5 rounded-lg border border-indigo-100">
                  <div className="font-bold text-slate-800 border-b pb-1">Kết quả thực nghiệm trên {bayesSimResults.total} mẫu:</div>
                  <div className="flex justify-between">
                    <span>Thực sự có bệnh & test đúng:</span>
                    <strong className="text-emerald-700">{bayesSimResults.truePos}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Khỏe mạnh nhưng bị dương tính giả:</span>
                    <strong className="text-rose-700">{bayesSimResults.falsePos}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold text-indigo-900">
                    <span>Tỷ lệ thực nghiệm P(D|+):</span>
                    <span>
                      {bayesSimResults.truePos + bayesSimResults.falsePos > 0
                        ? `${((bayesSimResults.truePos / (bayesSimResults.truePos + bayesSimResults.falsePos)) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 6: 6 PROBABILITY DISTRIBUTIONS */}
      {/* ======================================================== */}
      {activeSim === 'distributions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  Mô phỏng 6 Phân phối Xác suất Cốt lõi
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quan sát biểu đồ hàm xác suất PMF / mật độ PDF, kỳ vọng $E(X)$ và phương sai $Var(X)$.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateDistSamples(100)}
                  className="px-4 py-2 rounded-xl bg-[#1B3D2F] hover:bg-[#163327] text-white text-xs font-bold"
                >
                  Sinh 100 mẫu
                </button>
              </div>
            </div>

            {/* Model Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              {[
                { id: 'bernoulli', label: 'Bernoulli' },
                { id: 'binomial', label: 'Nhị thức B(n,p)' },
                { id: 'poisson', label: 'Poisson(λ)' },
                { id: 'normal', label: 'Chuẩn N(μ,σ²)' },
                { id: 'uniform', label: 'Đều U(a,b)' },
                { id: 'exponential', label: 'Mũ Exp(λ)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setDistModel(m.id as any);
                    setDistGeneratedSamples([]);
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    distModel === m.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Dynamic Sliders based on model */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              {distModel === 'normal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Kỳ vọng μ: {normMu}</label>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.5"
                      value={normMu}
                      onChange={(e) => setNormMu(Number(e.target.value))}
                      className="w-full accent-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Độ lệch chuẩn σ: {normSigma}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.25"
                      value={normSigma}
                      onChange={(e) => setNormSigma(Number(e.target.value))}
                      className="w-full accent-emerald-700"
                    />
                  </div>
                </div>
              )}

              {distModel === 'binomial' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Số phép thử n: {binomN}</label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={binomN}
                      onChange={(e) => setBinomN(Number(e.target.value))}
                      className="w-full accent-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Xác suất thành công p: {binomP}</label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={binomP}
                      onChange={(e) => setBinomP(Number(e.target.value))}
                      className="w-full accent-emerald-700"
                    />
                  </div>
                </div>
              )}

              {distModel === 'poisson' && (
                <div>
                  <label className="font-semibold block mb-1">Tham số tốc độ trung bình λ: {poissonLambda}</label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={poissonLambda}
                    onChange={(e) => setPoissonLambda(Number(e.target.value))}
                    className="w-full accent-emerald-700 max-w-md"
                  />
                </div>
              )}
            </div>

            {/* Formula & Properties */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Loại biến:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {['normal', 'uniform', 'exponential'].includes(distModel) ? 'Biến ngẫu nhiên Liên tục' : 'Biến ngẫu nhiên Rời rạc'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Kỳ vọng E(X):</span>
                <p className="font-bold text-emerald-900 mt-0.5 font-mono">
                  {distModel === 'normal' && normMu}
                  {distModel === 'binomial' && (binomN * binomP).toFixed(2)}
                  {distModel === 'poisson' && poissonLambda}
                  {distModel === 'bernoulli' && binomP}
                  {distModel === 'uniform' && ((unifA + unifB) / 2).toFixed(2)}
                  {distModel === 'exponential' && (1 / expLambda).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Phương sai Var(X):</span>
                <p className="font-bold text-emerald-900 mt-0.5 font-mono">
                  {distModel === 'normal' && (normSigma * normSigma).toFixed(2)}
                  {distModel === 'binomial' && (binomN * binomP * (1 - binomP)).toFixed(2)}
                  {distModel === 'poisson' && poissonLambda}
                  {distModel === 'bernoulli' && (binomP * (1 - binomP)).toFixed(2)}
                  {distModel === 'uniform' && (Math.pow(unifB - unifA, 2) / 12).toFixed(2)}
                  {distModel === 'exponential' && (1 / Math.pow(expLambda, 2)).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Generated Samples View */}
            {distGeneratedSamples.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Mẫu thực nghiệm được sinh ngẫu nhiên ({distGeneratedSamples.length} phần tử):</span>
                  <span>Trung bình mẫu: <strong>{(distGeneratedSamples.reduce((a, b) => a + b, 0) / distGeneratedSamples.length).toFixed(2)}</strong></span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto font-mono text-[11px] p-2 bg-white rounded-lg border">
                  {distGeneratedSamples.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 7: BUSINESS APPLICATION */}
      {/* ======================================================== */}
      {activeSim === 'business' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  Mô phỏng Ứng dụng Kinh doanh & Tỷ lệ chuyển đổi
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  *Mô hình giáo dục giả định*: Chiến dịch tiếp thị quảng cáo, số lượt chuyển đổi và phân tích kỳ vọng vs thực tế.
                </p>
              </div>

              <button
                onClick={runBizSimulation}
                className="px-5 py-2.5 rounded-xl bg-[#1B3D2F] hover:bg-[#163327] text-white text-xs font-bold"
              >
                Chạy mô phỏng chiến dịch
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Số lượt khách tiếp cận (n):</span>
                  <span className="font-bold text-emerald-800">{bizReach} lượt</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="20"
                  value={bizReach}
                  onChange={(e) => setBizReach(Number(e.target.value))}
                  className="w-full accent-[#1B3D2F]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Tỷ lệ chuyển đổi giả định p:</span>
                  <span className="font-bold text-emerald-800">{(bizConvRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.2"
                  step="0.01"
                  value={bizConvRate}
                  onChange={(e) => setBizConvRate(Number(e.target.value))}
                  className="w-full accent-[#1B3D2F]"
                />
              </div>
            </div>

            {/* Results Card */}
            {bizSimulationRun && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border text-center">
                  <span className="text-xs text-slate-500">Số đơn chuyển đổi:</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{bizSimulationRun.conversions}</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-700">Tỷ lệ thực tế:</span>
                  <div className="text-2xl font-bold text-emerald-950 mt-1">
                    {(bizSimulationRun.rate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-xs text-amber-700">Kỳ vọng lý thuyết:</span>
                  <div className="text-2xl font-bold text-amber-950 mt-1">
                    {bizSimulationRun.expected.toFixed(1)} đơn
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-xs text-blue-700">Xác suất có ít nhất 1 đơn:</span>
                  <div className="text-2xl font-bold text-blue-950 mt-1">
                    {(bizSimulationRun.probAtLeastOne * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMULATION 8: CENTRAL LIMIT THEOREM (CLT) */}
      {/* ======================================================== */}
      {activeSim === 'clt' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-700" />
                  Mô phỏng Định lý Giới hạn Trung tâm (Central Limit Theorem)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dù phân phối gốc bất kỳ (Đều, Mũ, Nhị thức), khi cỡ mẫu n đủ lớn, trung bình mẫu X̄ luôn hội tụ về phân phối Chuẩn!
                </p>
              </div>

              <button
                onClick={runCLTSimulation}
                className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-sm"
              >
                Rút {cltNumSamples} mẫu ngẫu nhiên
              </button>
            </div>

            {/* Base Distribution & Sample Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1.5">
                <span className="font-semibold block">Phân phối gốc ban đầu:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCltBaseDist('uniform')}
                    className={`px-3 py-1.5 rounded-lg font-bold ${
                      cltBaseDist === 'uniform' ? 'bg-indigo-700 text-white' : 'bg-white border'
                    }`}
                  >
                    Phân phối Đều U(0, 10)
                  </button>
                  <button
                    onClick={() => setCltBaseDist('exponential')}
                    className={`px-3 py-1.5 rounded-lg font-bold ${
                      cltBaseDist === 'exponential' ? 'bg-indigo-700 text-white' : 'bg-white border'
                    }`}
                  >
                    Phân phối Mũ Exp(1)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Kích thước mỗi mẫu (n):</span>
                  <span className="font-bold text-indigo-800">n = {cltSampleSize}</span>
                </div>
                <div className="flex gap-2">
                  {[2, 5, 15, 30, 50].map((nVal) => (
                    <button
                      key={nVal}
                      onClick={() => setCltSampleSize(nVal)}
                      className={`flex-1 py-1 rounded-lg font-bold ${
                        cltSampleSize === nVal ? 'bg-indigo-700 text-white' : 'bg-white border'
                      }`}
                    >
                      {nVal}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500">Khi n ≥ 30, phân phối của X̄ có hình chuông chuẩn hoàn hảo.</span>
              </div>
            </div>

            {/* Distribution of Sample Means (Bell Curve Histogram) */}
            {cltSampleMeans.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Phân phối của {cltSampleMeans.length} giá trị trung bình mẫu X̄ (Hình chuông Gauss):</span>
                  <span className="text-indigo-800">
                    Trung bình của các X̄: {(cltSampleMeans.reduce((a, b) => a + b, 0) / cltSampleMeans.length).toFixed(2)}
                  </span>
                </div>

                <div className="h-44 flex items-end gap-1 pt-6 border-b border-slate-300">
                  {/* Binning sample means into 20 histogram bars */}
                  {(() => {
                    const min = Math.min(...cltSampleMeans);
                    const max = Math.max(...cltSampleMeans);
                    const range = max - min || 1;
                    const numBins = 20;
                    const bins = new Array(numBins).fill(0);

                    cltSampleMeans.forEach(val => {
                      const idx = Math.min(numBins - 1, Math.floor(((val - min) / range) * numBins));
                      bins[idx]++;
                    });

                    const maxBin = Math.max(...bins, 1);

                    return bins.map((count, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div 
                          className="w-full bg-indigo-600 rounded-t-sm transition-all duration-300 hover:bg-indigo-700 min-h-[2px]"
                          style={{ height: `${(count / maxBin) * 100}%` }}
                        />
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Giá trị X̄ nhỏ nhất: {Math.min(...cltSampleMeans)}</span>
                  <span>Giá trị X̄ lớn nhất: {Math.max(...cltSampleMeans)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
