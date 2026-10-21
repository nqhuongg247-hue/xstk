import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Target, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  HelpCircle,
  Award,
  Layers,
  Check,
  Play,
  Filter
} from 'lucide-react';
import { UserProfile } from '../types';
import { MathView } from './MathView';
import { NavTab } from './Sidebar';

interface RoadmapChapter {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  objectives: string[];
  lessons: { id: string; title: string; duration: string }[];
  keyFormulas: { name: string; latex: string; condition: string }[];
  example: {
    problem: string;
    solution: string;
    explanation: string;
  };
  practiceProblem: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  relatedLabId: string;
  relatedLabName: string;
}

const ROADMAP_CHAPTERS: RoadmapChapter[] = [
  {
    id: 1,
    number: 'Chương 1',
    title: 'Quy tắc đếm và các Khái niệm Xác suất cơ bản',
    subtitle: 'Không gian mẫu, giải tích tổ hợp, biến cố ngẫu nhiên & xác suất cổ điển',
    objectives: [
      'Nắm vững quy tắc cộng, quy tắc nhân, hoán vị, chỉnh hợp $A_n^k$ và tổ hợp $C_n^k$.',
      'Xác định không gian mẫu $\\Omega$ và các biến cố thuận lợi cho $A$.',
      'Tính xác suất cổ điển $P(A) = \\frac{n_A}{n_\\Omega}$ và xác suất thống kê theo tần suất.',
      'Áp dụng công thức cộng xác suất cho biến cố xung khắc và không xung khắc.'
    ],
    lessons: [
      { id: '1.1', title: 'Quy tắc đếm, hoán vị, chỉnh hợp và tổ hợp', duration: '20 phút' },
      { id: '1.2', title: 'Phép thử, không gian mẫu và định nghĩa xác suất cổ điển', duration: '25 phút' },
      { id: '1.3', title: 'Các phép toán biến cố: Hợp, giao, biến cố đối và xung khắc', duration: '20 phút' },
      { id: '1.4', title: 'Quy tắc cộng xác suất $P(A+B) = P(A) + P(B) - P(AB)$', duration: '25 phút' }
    ],
    keyFormulas: [
      {
        name: 'Tổ hợp chập k của n phần tử',
        latex: 'C_n^k = \\frac{n!}{k!(n-k)!}',
        condition: '$0 \\le k \\le n, \\ k, n \\in \\mathbb{N}$. Dùng khi chọn không phân biệt thứ tự.'
      },
      {
        name: 'Xác suất cổ điển',
        latex: 'P(A) = \\frac{|A|}{|\\Omega|} = \\frac{n_A}{n_\\Omega}',
        condition: 'Không gian mẫu $\\Omega$ hữu hạn và các biến cố sơ cấp đồng khả năng.'
      },
      {
        name: 'Công thức cộng xác suất tổng quát',
        latex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
        condition: 'Nếu $A, B$ xung khắc ($A \\cap B = \\emptyset$) thì $P(A \\cup B) = P(A) + P(B)$.'
      }
    ],
    example: {
      problem: 'Một hộp có 6 bi đỏ và 4 bi xanh. Rút ngẫu nhiên 3 bi. Tính xác suất để rút được đúng 2 bi đỏ?',
      solution: 'Số phần tử không gian mẫu: $n_\\Omega = C_{10}^3 = \\frac{10 \\times 9 \\times 8}{3 \\times 2 \\times 1} = 120$.\nSố cách chọn 2 bi đỏ từ 6 bi đỏ và 1 bi xanh từ 4 bi xanh: $n_A = C_6^2 \\times C_4^1 = 15 \\times 4 = 60$.\nXác suất cần tìm: $P(A) = \\frac{60}{120} = 0.5$ (hay 50%).',
      explanation: 'Sử dụng mô hình siêu bội (hypergeometric). Do rút đồng thời, thứ tự các viên bi không quan trọng nên ta dùng tổ hợp thay vì chỉnh hợp.'
    },
    practiceProblem: {
      question: 'Gieo một con xúc xắc cân đối đồng chất 6 mặt. Xác suất để số chấm xuất hiện là số nguyên tố bằng bao nhiêu?',
      options: ['1/6', '1/3', '1/2', '2/3'],
      correctIndex: 2,
      explanation: 'Không gian mẫu $\\Omega = \\{1, 2, 3, 4, 5, 6\\}$ ($n_\\Omega = 6$). Các số nguyên tố là $\\{2, 3, 5\\}$ ($n_A = 3$). Do đó $P(A) = 3/6 = 1/2$.'
    },
    relatedLabId: 'dice',
    relatedLabName: 'Mô phỏng gieo xúc xắc'
  },
  {
    id: 2,
    number: 'Chương 2',
    title: 'Xác suất có điều kiện, Độc lập, Xác suất toàn phần & Bayes',
    subtitle: 'Định lý nhân xác suất, hệ biến cố đầy đủ và cập nhật niềm tin hậu nghiệm',
    objectives: [
      'Phân biệt xác suất có điều kiện $P(A|B)$ và xác suất giao $P(AB)$.',
      'Kiểm tra tính độc lập thống kê: $P(AB) = P(A)P(B)$.',
      'Áp dụng công thức xác suất toàn phần khi biến cố phụ thuộc nhiều kịch bản.',
      'Sử dụng công thức Bayes để tính xác suất hậu nghiệm trong kiểm tra chất lượng và chẩn đoán.'
    ],
    lessons: [
      { id: '2.1', title: 'Định nghĩa xác suất có điều kiện & quy tắc nhân', duration: '25 phút' },
      { id: '2.2', title: 'Tính độc lập của hai hoặc nhiều biến cố', duration: '20 phút' },
      { id: '2.3', title: 'Hệ biến cố đầy đủ & công thức xác suất toàn phần', duration: '30 phút' },
      { id: '2.4', title: 'Công thức Bayes và bài toán đảo ngược thời gian', duration: '35 phút' }
    ],
    keyFormulas: [
      {
        name: 'Xác suất có điều kiện',
        latex: 'P(A|B) = \\frac{P(AB)}{P(B)}',
        condition: 'Bắt buộc điều kiện mẫu số dương: $P(B) > 0$.'
      },
      {
        name: 'Công thức xác suất toàn phần',
        latex: 'P(A) = \\sum_{i=1}^n P(H_i) \\cdot P(A|H_i)',
        condition: '$\\{H_1, H_2, \\dots, H_n\\}$ là hệ biến cố đầy đủ xung khắc từng đôi và $\\bigcup H_i = \\Omega$.'
      },
      {
        name: 'Công thức Bayes',
        latex: 'P(H_k|A) = \\frac{P(H_k) \\cdot P(A|H_k)}{\\sum_{i=1}^n P(H_i) \\cdot P(A|H_i)}',
        condition: 'Dùng để tính xác suất nguyên nhân $H_k$ khi đã quan sát thấy kết quả $A$ xảy ra.'
      }
    ],
    example: {
      problem: 'Kho hàng nhập linh kiện từ 2 nhà máy: Nhà máy I cung cấp 60% với tỷ lệ phế phẩm 1%; Nhà máy II cung cấp 40% với tỷ lệ phế phẩm 2%. Lấy ngẫu nhiên 1 sản phẩm thấy bị hỏng. Tính xác suất sản phẩm đó do Nhà máy I sản xuất?',
      solution: 'Gọi $H_1, H_2$ lần lượt là biến cố sản phẩm do Nhà máy I, II sản xuất. $P(H_1)=0.6, P(H_2)=0.4$.\nGọi $A$ là biến cố sản phẩm bị hỏng: $P(A|H_1)=0.01, P(A|H_2)=0.02$.\nXác suất toàn phần: $P(A) = 0.6 \\times 0.01 + 0.4 \\times 0.02 = 0.006 + 0.008 = 0.014$.\nTheo công thức Bayes: $P(H_1|A) = \\frac{0.6 \\times 0.01}{0.014} = \\frac{0.006}{0.014} \\approx 0.4286$ (42.86%).',
      explanation: 'Dù Nhà máy I cung cấp nhiều sản phẩm hơn (60%), nhưng do chất lượng tốt hơn (lỗi 1% so với 2%) nên khi phát hiện phế phẩm, xác suất xuất phát từ Nhà máy I chỉ còn 42.86%.'
    },
    practiceProblem: {
      question: 'Cho hai biến cố $A$ và $B$ độc lập với $P(A) = 0.4$ và $P(B) = 0.5$. Xác suất $P(A \\cup B)$ bằng:',
      options: ['0.9', '0.7', '0.2', '0.5'],
      correctIndex: 1,
      explanation: 'Do $A, B$ độc lập nên $P(AB) = P(A) \\times P(B) = 0.4 \\times 0.5 = 0.2$. Do đó $P(A \\cup B) = P(A) + P(B) - P(AB) = 0.4 + 0.5 - 0.2 = 0.7$.'
    },
    relatedLabId: 'bayes',
    relatedLabName: 'Mô phỏng cây xác suất Bayes'
  },
  {
    id: 3,
    number: 'Chương 3',
    title: 'Biến ngẫu nhiên Rời rạc, Liên tục, Kỳ vọng & Phương sai',
    subtitle: 'Hàm phân phối tích lũy F(x), hàm mật độ f(x), giá trị trung bình và độ lệch rủi ro',
    objectives: [
      'Phân loại biến ngẫu nhiên rời rạc (bảng phân phối) và biến ngẫu nhiên liên tục (hàm mật độ $f(x)$).',
      'Tính kỳ vọng $E(X)$ đại diện cho giá trị trung bình/doanh thu kỳ vọng.',
      'Tính phương sai $Var(X)$ và độ lệch chuẩn $\\sigma$ phản ánh mức độ rủi ro/dao động.',
      'Vận dụng tính chất: $E(aX + b) = aE(X) + b$ và $Var(aX + b) = a^2 Var(X)$.'
    ],
    lessons: [
      { id: '3.1', title: 'Biến ngẫu nhiên rời rạc & bảng phân phối xác suất', duration: '25 phút' },
      { id: '3.2', title: 'Biến ngẫu nhiên liên tục & hàm mật độ $f(x)$', duration: '30 phút' },
      { id: '3.3', title: 'Kỳ vọng $E(X)$, ý nghĩa điểm cân bằng và mô hình tài chính', duration: '25 phút' },
      { id: '3.4', title: 'Phương sai $Var(X)$, độ lệch chuẩn và bất đẳng thức Chebyshev', duration: '30 phút' }
    ],
    keyFormulas: [
      {
        name: 'Kỳ vọng biến ngẫu nhiên rời rạc',
        latex: 'E(X) = \\sum_{i} x_i p_i',
        condition: 'Chuỗi hội tụ tuyệt đối $\\sum |x_i| p_i < \\infty$.'
      },
      {
        name: 'Hàm mật độ biến ngẫu nhiên liên tục',
        latex: 'f(x) \\ge 0, \\quad \\int_{-\\infty}^{+\\infty} f(x) dx = 1',
        condition: 'Xác suất tại 1 điểm riêng biệt luôn bằng 0: $P(X = c) = 0$.'
      },
      {
        name: 'Công thức tính phương sai',
        latex: 'Var(X) = E(X^2) - [E(X)]^2',
        condition: '$\\sigma = \\sqrt{Var(X)}$ đo lường độ phân tán cùng đơn vị đo với $X$.'
      }
    ],
    example: {
      problem: 'Một dự án đầu tư có doanh thu $X$ (tỷ đồng) với bảng phân phối: $X=10$ với xác suất 0.2; $X=20$ với xác suất 0.5; $X=30$ với xác suất 0.3. Tính doanh thu kỳ vọng và độ lệch chuẩn?',
      solution: 'Kỳ vọng: $E(X) = 10(0.2) + 20(0.5) + 30(0.3) = 2 + 10 + 9 = 21$ tỷ đồng.\nTính $E(X^2) = 10^2(0.2) + 20^2(0.5) + 30^2(0.3) = 20 + 200 + 270 = 490$.\nPhương sai: $Var(X) = E(X^2) - [E(X)]^2 = 490 - 21^2 = 490 - 441 = 49$.\nĐộ lệch chuẩn: $\\sigma = \\sqrt{49} = 7$ tỷ đồng.',
      explanation: 'Doanh thu trung bình kỳ vọng là 21 tỷ đồng, với biên độ dao động rủi ro điển hình là ±7 tỷ đồng.'
    },
    practiceProblem: {
      question: 'Cho biến ngẫu nhiên $X$ có $E(X) = 5$ và $Var(X) = 4$. Giá trị kỳ vọng $E(3X - 2)$ và phương sai $Var(3X - 2)$ lần lượt là:',
      options: ['13 và 36', '13 và 12', '15 và 36', '13 và 10'],
      correctIndex: 0,
      explanation: '$E(3X - 2) = 3E(X) - 2 = 3(5) - 2 = 13$. Phương sai: $Var(3X - 2) = 3^2 Var(X) = 9 \\times 4 = 36$.'
    },
    relatedLabId: 'distributions',
    relatedLabName: 'Mô phỏng phân phối xác suất'
  },
  {
    id: 4,
    number: 'Chương 4',
    title: 'Các Phân phối Xác suất Thông dụng',
    subtitle: 'Bernoulli, Nhị thức, Poisson, Chuẩn (Gauss), Đều, Mũ và Hình học',
    objectives: [
      'Nhận diện mô hình Bernoulli và phân phối Nhị thức $B(n, p)$ với $E(X)=np, Var(X)=np(1-p)$.',
      'Ứng dụng phân phối Poisson $P(\\lambda)$ cho các biến cố hiếm gặp trong một khoảng thời gian/không gian.',
      'Sử dụng phân phối Chuẩn $N(\\mu, \\sigma^2)$, kỹ thuật chuẩn hóa về $Z \\sim N(0, 1)$ và quy tắc 3-Sigma.',
      'Phân phối Đều $U(a, b)$ và phân phối Mũ $Exp(\\lambda)$ (tính không nhớ).'
    ],
    lessons: [
      { id: '4.1', title: 'Phân phối Bernoulli và phân phối Nhị thức $B(n, p)$', duration: '30 phút' },
      { id: '4.2', title: 'Phân phối Poisson và xấp xỉ Poisson cho Nhị thức', duration: '25 phút' },
      { id: '4.3', title: 'Phân phối Chuẩn $N(\\mu, \\sigma^2)$ & tra bảng Laplace $\\Phi(z)$', duration: '40 phút' },
      { id: '4.4', title: 'Phân phối liên tục khác: Đều $U(a, b)$ và Mũ $Exp(\\lambda)$', duration: '25 phút' }
    ],
    keyFormulas: [
      {
        name: 'Phân phối Nhị thức B(n, p)',
        latex: 'P(X = k) = C_n^k p^k (1-p)^{n-k}, \\quad E(X) = np, \\ Var(X) = np(1-p)',
        condition: '$n$ phép thử Bernoulli độc lập, cùng xác suất thành công $p$.'
      },
      {
        name: 'Phân phối Poisson',
        latex: 'P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad E(X) = Var(X) = \\lambda',
        condition: 'Số lần xuất hiện biến cố trong khoảng cố định với tốc độ trung bình $\\lambda > 0$.'
      },
      {
        name: 'Chuẩn hóa phân phối Chuẩn',
        latex: 'Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1) \\implies P(a \\le X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
        condition: '$\\Phi(-z) = 1 - \\Phi(z)$ do tính đối xứng của hàm mật độ qua $z=0$.'
      }
    ],
    example: {
      problem: 'Tuổi thọ bóng đèn có phân phối chuẩn $N(1000, 100^2)$ giờ. Tính xác suất một bóng đèn có tuổi thọ trên 1150 giờ?',
      solution: 'Chuẩn hóa biến cố: $P(X > 1150) = P\\left(Z > \\frac{1150 - 1000}{100}\\right) = P(Z > 1.5)$.\nSử dụng hàm Laplace: $P(Z > 1.5) = 1 - \\Phi(1.5)$.\nTra bảng chuẩn tắc: $\\Phi(1.5) \\approx 0.9332$.\nVậy $P(X > 1150) = 1 - 0.9332 = 0.0668$ (6.68%).',
      explanation: 'Có khoảng 6.68% bóng đèn đạt độ bền vượt trên 1150 giờ hoạt động.'
    },
    practiceProblem: {
      question: 'Số cuộc gọi đến tổng đài theo phân phối Poisson với trung bình 3 cuộc/phút ($\\lambda = 3$). Xác suất không có cuộc gọi nào trong 1 phút là:',
      options: ['e^-3', '3e^-3', '1 - e^-3', '0'],
      correctIndex: 0,
      explanation: 'Với $k = 0$: $P(X = 0) = \\frac{3^0 e^{-3}}{0!} = e^{-3} \\approx 0.0498$.'
    },
    relatedLabId: 'distributions',
    relatedLabName: 'Mô phỏng 6 Phân phối xác suất'
  },
  {
    id: 5,
    number: 'Chương 5',
    title: 'Phân phối Đồng thời, Hiệp phương sai & Mối quan hệ',
    subtitle: 'Biến ngẫu nhiên 2 chiều (X, Y), phân phối lề, phân phối có điều kiện và hệ số tương quan',
    objectives: [
      'Lập bảng phân phối xác suất đồng thời $p_{ij} = P(X=x_i, Y=y_j)$ và tính các phân phối lề.',
      'Tính kỳ vọng có điều kiện $E(X|Y)$ và phương sai có điều kiện.',
      'Tính hiệp phương sai $Cov(X, Y) = E(XY) - E(X)E(Y)$ đo lường xu hướng biến thiên cùng chiều hay ngược chiều.',
      'Đánh giá hệ số tương quan tuyến tính Pearson $\\rho_{XY} = \\frac{Cov(X, Y)}{\\sigma_X \\sigma_Y} \\in [-1, 1]$.'
    ],
    lessons: [
      { id: '5.1', title: 'Biến ngẫu nhiên hai chiều và bảng phân phối đồng thời', duration: '30 phút' },
      { id: '5.2', title: 'Phân phối xác suất lề và tính độc lập của hai biến ngẫu nhiên', duration: '25 phút' },
      { id: '5.3', title: 'Hiệp phương sai $Cov(X, Y)$ và tính chất', duration: '30 phút' },
      { id: '5.4', title: 'Hệ số tương quan Pearson $\\rho$ và ý nghĩa trong đa dạng hóa rủi ro', duration: '35 phút' }
    ],
    keyFormulas: [
      {
        name: 'Hiệp phương sai Covariance',
        latex: 'Cov(X, Y) = E[(X - E(X))(Y - E(Y))] = E(XY) - E(X)E(Y)',
        condition: 'Nếu $X, Y$ độc lập thì $Cov(X, Y) = 0$ (chiều ngược lại không luôn đúng).'
      },
      {
        name: 'Hệ số tương quan Pearson',
        latex: '\\rho_{XY} = \\frac{Cov(X, Y)}{\\sigma_X \\sigma_Y}, \\quad -1 \\le \\rho_{XY} \\le 1',
        condition: '$|\\rho| = 1$ khi và chỉ khi $Y = aX + b$ (phụ thuộc tuyến tính hoàn hảo).'
      },
      {
        name: 'Phương sai của tổng hai biến ngẫu nhiên',
        latex: 'Var(aX + bY) = a^2 Var(X) + b^2 Var(Y) + 2ab Cov(X, Y)',
        condition: 'Cơ sở lý thuyết danh mục đầu tư Markowitz.'
      }
    ],
    example: {
      problem: 'Hai cổ phiếu A và B có độ lệch chuẩn $\\sigma_A = 10\\%, \\sigma_B = 15\\%$, và hệ số tương quan $\\rho = 0.4$. Nhà đầu tư phân bổ 60% vốn vào A và 40% vào B. Tính độ lệch chuẩn của danh mục?',
      solution: 'Hiệp phương sai: $Cov(A, B) = \\rho \\sigma_A \\sigma_B = 0.4 \\times 10 \\times 15 = 60$.\nPhương sai danh mục: $Var(P) = (0.6)^2(10)^2 + (0.4)^2(15)^2 + 2(0.6)(0.4)(60) = 36 + 36 + 28.8 = 100.8$.\nĐộ lệch chuẩn: $\\sigma_P = \\sqrt{100.8} \\approx 10.04\\%$.',
      explanation: 'Nhờ hệ số tương quan $\\rho = 0.4 < 1$, rủi ro danh mục (10.04%) thấp hơn đáng kể so với trung bình cộng gia quyền $(0.6 \\times 10 + 0.4 \\times 15 = 12\\%)$.'
    },
    practiceProblem: {
      question: 'Nếu hai biến ngẫu nhiên $X$ và $Y$ độc lập thì khẳng định nào sau đây là ĐÚNG?',
      options: ['Cov(X, Y) = 0 và E(XY) = E(X)E(Y)', 'Cov(X, Y) = 1', 'Var(X + Y) = Var(X) - Var(Y)', 'p_{ij} = p_i + p_j'],
      correctIndex: 0,
      explanation: 'Khi $X$ và $Y$ độc lập, $E(XY) = E(X)E(Y)$, do đó $Cov(X, Y) = E(XY) - E(X)E(Y) = 0$.'
    },
    relatedLabId: 'business',
    relatedLabName: 'Mô phỏng ứng dụng kinh doanh'
  },
  {
    id: 6,
    number: 'Chương 6',
    title: 'Thống kê mô tả, Lấy mẫu & Định lý Giới hạn Trung tâm (CLT)',
    subtitle: 'Mẫu ngẫu nhiên, trung bình mẫu, phương sai mẫu hiệu chỉnh s² và phân phối lấy mẫu',
    objectives: [
      'Tính các thống kê mẫu: trung bình mẫu $\\bar{X}$, phương sai mẫu hiệu chỉnh $s^2 = \\frac{1}{n-1}\\sum (X_i - \\bar{X})^2$.',
      'Hiểu vì sao phải chia cho $n-1$ để phương sai mẫu không chệch ($E(s^2) = \\sigma^2$).',
      'Nắm vững Định lý Giới hạn Trung tâm (CLT): Trung bình mẫu $\\bar{X}$ tiến về phân phối chuẩn khi $n$ đủ lớn.',
      'Phân biệt phân phối Student ($t$) khi chưa biết $\\sigma$ và mẫu nhỏ $n < 30$.'
    ],
    lessons: [
      { id: '6.1', title: 'Thu thập dữ liệu, mẫu ngẫu nhiên và thống kê mô tả', duration: '25 phút' },
      { id: '6.2', title: 'Trung bình mẫu $\\bar{X}$ và phương sai mẫu hiệu chỉnh $s^2$', duration: '30 phút' },
      { id: '6.3', title: 'Định lý Giới hạn Trung tâm (Central Limit Theorem - CLT)', duration: '35 phút' },
      { id: '6.4', title: 'Bấm máy tính Casio fx-580VN X Menu 6 xử lý thống kê 1 biến', duration: '20 phút' }
    ],
    keyFormulas: [
      {
        name: 'Phương sai mẫu hiệu chỉnh (Không chệch)',
        latex: 's^2 = \\frac{1}{n-1} \\sum_{i=1}^n (X_i - \\bar{X})^2 = \\frac{1}{n-1} \\left[ \\sum X_i^2 - n(\\bar{X})^2 \\right]',
        condition: 'Chia cho $n-1$ để triệt tiêu độ chệch kỳ vọng: $E(s^2) = \\sigma^2$.'
      },
      {
        name: 'Định lý Giới hạn Trung tâm (CLT)',
        latex: '\\bar{X} \\approx N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\implies Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\approx N(0, 1)',
        condition: 'Áp dụng cho mọi phân phối gốc có kỳ vọng $\\mu$ và phương sai $\\sigma^2$ hữu hạn khi cỡ mẫu $n \\ge 30$.'
      }
    ],
    example: {
      problem: 'Trọng lượng sản phẩm có trung bình $\\mu = 500$g, độ lệch chuẩn $\\sigma = 20$g. Lấy ngẫu nhiên mẫu gồm $n = 36$ sản phẩm. Tính xác suất để trọng lượng trung bình mẫu $\\bar{X}$ nằm trong khoảng từ 495g đến 505g?',
      solution: 'Theo CLT, vì $n = 36 \\ge 30$, $\\bar{X} \\sim N\\left(500, \\frac{20^2}{36}\\right) = N(500, 3.33^2)$ với sai số chuẩn $SE = \\frac{20}{\\sqrt{36}} = 3.33$.\nChuẩn hóa: $Z_1 = \\frac{495 - 500}{3.33} = -1.5$, $Z_2 = \\frac{505 - 500}{3.33} = 1.5$.\n$P(495 \\le \\bar{X} \\le 505) = \\Phi(1.5) - \\Phi(-1.5) = 2\\Phi(1.5) - 1 = 2(0.9332) - 1 = 0.8664$ (86.64%).',
      explanation: 'Dù trọng lượng từng sản phẩm có dao động $\\pm 20$g, nhưng trung bình của 36 sản phẩm dao động hẹp hơn nhiều ($SE = 3.33$g).'
    },
    practiceProblem: {
      question: 'Khi cỡ mẫu tăng gấp 4 lần ($n$ thành $4n$), sai số chuẩn của trung bình mẫu $SE = \\frac{\\sigma}{\\sqrt{n}}$ sẽ:',
      options: ['Giảm đi một nửa (giảm 2 lần)', 'Giảm đi 4 lần', 'Tăng gấp đôi', 'Không thay đổi'],
      correctIndex: 0,
      explanation: 'Do mẫu số có căn bậc hai $\\sqrt{4n} = 2\\sqrt{n}$, nên sai số chuẩn giảm đi một nửa (2 lần).'
    },
    relatedLabId: 'clt',
    relatedLabName: 'Mô phỏng Định lý Giới hạn Trung tâm (CLT)'
  },
  {
    id: 7,
    number: 'Chương 7',
    title: 'Ước lượng Khoảng tin cậy & Kiểm định Giả thuyết Thống kê',
    subtitle: 'Khoảng tin cậy cho kỳ vọng/tỷ lệ, Kiểm định Z-test, T-test Student, so sánh 2 mẫu',
    objectives: [
      'Xây dựng khoảng tin cậy $(1-\\alpha)$ cho kỳ vọng $\\mu$ (mẫu lớn dùng Z, mẫu nhỏ chưa biết $\\sigma$ dùng Student $t$).',
      'Khoảng tin cậy cho tỷ lệ tổng thể $p$ (dùng phân phối chuẩn tắc $Z_{\\alpha/2}$).',
      'Nắm vững 5 bước kiểm định giả thuyết thống kê: $H_0$ vs $H_1$, mức ý nghĩa $\\alpha$, thống kê kiểm định, miền bác bỏ $W_\\alpha$ và kết luận.',
      'So sánh 2 trung bình mẫu độc lập và kiểm định tỷ lệ 2 mẫu.'
    ],
    lessons: [
      { id: '7.1', title: 'Ước lượng điểm và khoảng tin cậy cho kỳ vọng $\\mu$', duration: '35 phút' },
      { id: '7.2', title: 'Ước lượng khoảng tin cậy cho tỷ lệ $p$ trong kinh tế', duration: '25 phút' },
      { id: '7.3', title: 'Quy trình kiểm định giả thuyết $H_0/H_1$ và sai lầm loại I, II', duration: '30 phút' },
      { id: '7.4', title: 'Kiểm định Z-test vs T-test Student & So sánh 2 tổng thể', duration: '40 phút' }
    ],
    keyFormulas: [
      {
        name: 'Khoảng tin cậy cho kỳ vọng (Mẫu lớn hoặc đã biết σ)',
        latex: '\\bar{X} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}',
        condition: 'Độ tin cậy $95\\% \\implies z_{0.025} = 1.96$; $99\\% \\implies z_{0.005} = 2.576$.'
      },
      {
        name: 'Khoảng tin cậy cho kỳ vọng (Mẫu nhỏ n < 30, chưa biết σ)',
        latex: '\\bar{X} - t_{\\alpha/2}^{(n-1)} \\frac{s}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + t_{\\alpha/2}^{(n-1)} \\frac{s}{\\sqrt{n}}',
        condition: 'Tổng thể có phân phối chuẩn, sử dụng phân phối Student bậc tự do $n-1$.'
      },
      {
        name: 'Tiêu chuẩn kiểm định Z-test cho kỳ vọng',
        latex: 'Z_{qs} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}, \\quad |Z_{qs}| > z_{\\alpha/2} \\implies \\text{Bác bỏ } H_0',
        condition: 'Mức ý nghĩa $\\alpha$ thường chọn $0.05$ (5%) hoặc $0.01$ (1%).'
      }
    ],
    example: {
      problem: 'Điều tra mức chi tiêu của 100 sinh viên thu được trung bình mẫu $\\bar{x} = 4.2$ triệu đồng/tháng, độ lệch chuẩn $s = 0.8$ triệu đồng. Hãy ước lượng mức chi tiêu trung bình với độ tin cậy 95%?',
      solution: 'Cỡ mẫu $n = 100 > 30$. Với độ tin cậy $1 - \\alpha = 0.95 \\implies \\alpha/2 = 0.025$, giá trị tới hạn $z_{0.025} = 1.96$.\nĐộ chính xác ước lượng: $\\epsilon = 1.96 \\times \\frac{0.8}{\\sqrt{100}} = 1.96 \\times 0.08 = 0.1568$ triệu đồng.\nKhoảng tin cậy: $[4.2 - 0.1568, \\ 4.2 + 0.1568] = [4.0432, \\ 4.3568]$ triệu đồng.',
      explanation: 'Với độ tin cậy 95%, mức chi tiêu trung bình thực tế của toàn bộ sinh viên nằm trong khoảng từ 4.04 triệu đến 4.36 triệu đồng.'
    },
    practiceProblem: {
      question: 'Trong bài toán kiểm định giả thuyết $H_0: \\mu = \\mu_0$ với đối thiết 2 phía $H_1: \\mu \\neq \\mu_0$, ta bác bỏ $H_0$ ở mức ý nghĩa $\\alpha = 0.05$ khi giá trị kiểm định $Z_{qs}$ thỏa mãn:',
      options: ['|Z_qs| > 1.96', 'Z_qs > 1.645', '|Z_qs| < 1.96', 'Z_qs < -1.96'],
      correctIndex: 0,
      explanation: 'Với bài toán 2 phía mức $\\alpha = 0.05$, miền bác bỏ là $|Z_{qs}| > z_{0.025} = 1.96$.'
    },
    relatedLabId: 'clt',
    relatedLabName: 'Mô phỏng phân phối lấy mẫu'
  }
];

interface RoadmapViewProps {
  currentUser: UserProfile;
  onActivityCompleted: (score: number, title: string) => void;
  onNavigateToChapter: (chapterId: number) => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  currentUser,
  onActivityCompleted,
  onNavigateToChapter,
  onNavigateTab
}) => {
  // Store chapter progress in state, loaded from localStorage for persistent real progress
  const [chapterStatus, setChapterStatus] = useState<{ [chapterId: number]: 'not_started' | 'in_progress' | 'completed' }>({
    1: 'in_progress',
    2: 'not_started',
    3: 'not_started',
    4: 'not_started',
    5: 'not_started',
    6: 'not_started',
    7: 'not_started'
  });

  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPracticeAnswers, setSelectedPracticeAnswers] = useState<{ [chapterId: number]: number }>({});
  const [showPracticeResult, setShowPracticeResult] = useState<{ [chapterId: number]: boolean }>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`xstk_roadmap_progress_${currentUser.id}`);
      if (saved) {
        setChapterStatus(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, [currentUser.id]);

  const handleUpdateStatus = (chapterId: number, status: 'not_started' | 'in_progress' | 'completed') => {
    const updated = { ...chapterStatus, [chapterId]: status };
    setChapterStatus(updated);
    try {
      localStorage.setItem(`xstk_roadmap_progress_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    if (status === 'completed') {
      onActivityCompleted(10, `Hoàn thành ${ROADMAP_CHAPTERS.find(c => c.id === chapterId)?.number}`);
    }
  };

  const handleAnswerPractice = (chapterId: number, optionIndex: number) => {
    setSelectedPracticeAnswers((prev) => ({ ...prev, [chapterId]: optionIndex }));
    setShowPracticeResult((prev) => ({ ...prev, [chapterId]: true }));

    const chapter = ROADMAP_CHAPTERS.find(c => c.id === chapterId);
    if (chapter && optionIndex === chapter.practiceProblem.correctIndex) {
      onActivityCompleted(5, `Trả lời đúng bài tập tự luyện ${chapter.number}`);
    }
  };

  const completedCount = Object.values(chapterStatus).filter(s => s === 'completed').length;
  const inProgressCount = Object.values(chapterStatus).filter(s => s === 'in_progress').length;
  const overallPercentage = Math.round((completedCount / ROADMAP_CHAPTERS.length) * 100);

  const filteredChapters = ROADMAP_CHAPTERS.filter((ch) => {
    const status = chapterStatus[ch.id] || 'not_started';
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ch.title.toLowerCase().includes(q) ||
        ch.subtitle.toLowerCase().includes(q) ||
        ch.number.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER BANNER */}
      <section className="bg-gradient-to-br from-[#1B3D2F] via-[#163327] to-[#0E2019] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6A64F]/20 border border-[#D6A64F]/40 text-[#F5C77E] text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#D6A64F]" />
            Lộ trình học XSTK Đại học Toàn diện
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            Lộ Trình Học Xác Suất & Thống Kê
          </h1>

          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-normal">
            Trình tự 7 chương kiến thức theo logic sư phạm chuẩn mực. Nhấp vào từng chương để xem mục tiêu, công thức, ví dụ giải chi tiết và thực hành bài tập.
          </p>
        </div>

        {/* PROGRESS CARD */}
        <div className="bg-[#142d22] p-5 rounded-2xl border border-emerald-800/80 min-w-[240px] space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span className="font-medium">Tiến độ hoàn thành:</span>
            <span className="font-bold text-[#D6A64F] text-base">{overallPercentage}%</span>
          </div>

          <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/50">
            <div 
              className="h-full bg-gradient-to-r from-[#D6A64F] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-800/50">
            <span>Đã học: <strong>{completedCount}/7</strong> chương</span>
            <span>Đang học: <strong>{inProgressCount}</strong></span>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc:
          </span>
          {[
            { id: 'all', label: 'Tất cả (7)' },
            { id: 'in_progress', label: `Đang học (${inProgressCount})` },
            { id: 'completed', label: `Đã hoàn thành (${completedCount})` },
            { id: 'not_started', label: 'Chưa học' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === f.id
                  ? 'bg-[#1B3D2F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chương, chủ đề..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs bg-slate-50"
          />
        </div>
      </div>

      {/* VERTICAL ROADMAP LIST WITH CONNECTING LINE */}
      <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-3 md:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-800/30">
        {filteredChapters.map((ch, index) => {
          const status = chapterStatus[ch.id] || 'not_started';
          const isExpanded = expandedChapterId === ch.id;

          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <div key={ch.id} className="relative group">
              {/* Timeline Indicator Circle */}
              <div 
                className={`absolute -left-6 md:-left-10 top-5 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isInProgress
                    ? 'bg-[#D6A64F] border-[#D6A64F] text-[#1B3D2F]'
                    : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : ch.id}
              </div>

              {/* Chapter Card */}
              <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isExpanded ? 'border-emerald-600 ring-1 ring-emerald-600/30' : 'border-slate-200/90 hover:border-slate-300'
              }`}>
                {/* Header Row (Clickable to Toggle Expand) */}
                <div 
                  onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                  className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {ch.number}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isInProgress
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isCompleted ? '✓ Đã hoàn thành' : isInProgress ? '⏳ Đang học' : '○ Chưa học'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ch.subtitle}
                    </p>
                  </div>

                  {/* Actions & Expand Chevron */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToChapter(ch.id);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#1B3D2F] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Vào học</span>
                    </button>

                    <div className="p-1.5 text-slate-400 group-hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* EXPANDED CONTENT DETAILS */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-[#FCFCF9] p-5 md:p-6 space-y-6 text-sm">
                    {/* 1. Learning Objectives */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-700" />
                        Mục tiêu học tập của chương
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {ch.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span><MathView content={obj} /></span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 2. Sub-Lessons Sequence */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        Danh sách các bài học con
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ch.lessons.map((les) => (
                          <div key={les.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 text-xs">
                            <span className="font-semibold text-slate-800">{les.title}</span>
                            <span className="text-slate-400 text-[11px] font-medium shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {les.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Key Concepts & Formulas */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#D6A64F]" />
                        Khái niệm & Công thức trọng tâm
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {ch.keyFormulas.map((f, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                            <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1">
                              {f.name}
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50/50 text-center">
                              <MathView content={`$$${f.latex}$$`} displayMode={true} />
                            </div>
                            <div className="text-[11px] text-slate-500 leading-relaxed">
                              <strong>Điều kiện áp dụng:</strong> <MathView content={f.condition} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Illustrative Example with Step-by-Step Solution */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-700" />
                          Ví dụ minh họa chi tiết
                        </span>
                        <span className="text-[11px] text-amber-700 font-medium">Bám sát đề thi đại học</span>
                      </div>
                      <div className="text-xs text-slate-800 font-semibold leading-relaxed">
                        <MathView content={ch.example.problem} />
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1.5">
                        <div className="font-bold text-emerald-900">Lời giải từng bước:</div>
                        <div className="whitespace-pre-line leading-relaxed">
                          <MathView content={ch.example.solution} />
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 italic">
                        💡 <strong>Giải thích sư phạm:</strong> {ch.example.explanation}
                      </div>
                    </div>

                    {/* 5. Practice Self-Check Exercise */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-emerald-700" />
                          Bài tập tự luyện kiểm tra nhanh
                        </span>
                        <span className="text-[11px] text-slate-400">Chọn phương án đúng</span>
                      </div>

                      <div className="text-xs font-medium text-slate-800">
                        <MathView content={ch.practiceProblem.question} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {ch.practiceProblem.options.map((opt, optIdx) => {
                          const isSelected = selectedPracticeAnswers[ch.id] === optIdx;
                          const isCorrect = optIdx === ch.practiceProblem.correctIndex;
                          const showRes = showPracticeResult[ch.id];

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerPractice(ch.id, optIdx)}
                              className={`p-2.5 rounded-lg text-xs font-semibold text-center border transition-all ${
                                showRes && isCorrect
                                  ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                                  : showRes && isSelected && !isCorrect
                                  ? 'bg-rose-100 border-rose-500 text-rose-900'
                                  : isSelected
                                  ? 'bg-[#1B3D2F] text-white border-[#1B3D2F]'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {showPracticeResult[ch.id] && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                          <strong>Giải thích: </strong>
                          <MathView content={ch.practiceProblem.explanation} />
                        </div>
                      )}
                    </div>

                    {/* 6. Footer Controls & Related Lab Link */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                      {/* Jump to Lab */}
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('lab')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                      >
                        <FlaskConical className="w-4 h-4 text-[#D6A64F]" />
                        <span>Mở thí nghiệm liên quan: <strong>{ch.relatedLabName}</strong></span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Cập nhật tiến độ:</span>
                        <button
                          onClick={() => handleUpdateStatus(ch.id, 'not_started')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            status === 'not_started' ? 'bg-slate-300 text-slate-800 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Chưa học
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ch.id, 'in_progress')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            status === 'in_progress' ? 'bg-amber-400 text-amber-950 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Đang học
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ch.id, 'completed')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            status === 'completed' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Hoàn thành
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
