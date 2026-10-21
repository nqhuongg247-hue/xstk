export interface MindmapSubNode {
  id: string;
  title: string;
  shortDesc: string;
  concept: string;
  keyFormulas: string[];
  conditions: string;
  crossLinks?: string[]; // Mối liên hệ logic với các chủ đề khác
  practicalExample?: string;
  casioShortcut?: string;
  chapterRef: number;
}

export interface MindmapMainBranch {
  id: string;
  clockPosition: '10h' | '2h' | '4h' | '8h';
  angleDeg: number; // Góc tương đối so với tâm
  title: string;
  subtitle: string;
  themeColor: string; // mã màu chủ đạo
  accentColor: string;
  borderColor: string;
  badge: string;
  summary: string;
  subNodes: MindmapSubNode[];
}

export const MINDMAP_CENTER_NODE = {
  title: 'XÁC SUẤT & THỐNG KÊ TOÁN',
  subtitle: 'STUDY STUDIO KNOWLEDGE CORE',
  badge: 'TRỌNG TÂM',
  description: 'Hệ thống hóa toàn bộ kiến thức 7 chương XSTK theo mô hình tư duy 4 nhánh đối xứng tỏa hình chữ X (10h, 2h, 4h, 8h)',
  symbols: ['\\Omega', '\\sum', '\\int', '\\mu', '\\sigma^2', 'P(A)', 'N(\\mu, \\sigma^2)', 'H_0']
};

export const MINDMAP_BRANCHES: MindmapMainBranch[] = [
  // 1. NHÁNH 10 GIỜ (TÂY BẮC - NORTHWEST): XÁC SUẤT CƠ BẢN & CÁC CÔNG THỨC TOÀN PHẦN
  {
    id: 'branch-10h',
    clockPosition: '10h',
    angleDeg: 210, // ~10 giờ (trên - trái)
    title: 'XÁC SUẤT CƠ BẢN & CÔNG THỨC TOÀN PHẦN',
    subtitle: 'Nền tảng phép thử, biến cố ngẫu nhiên & Định lý Bayes',
    themeColor: '#1B3D2F', // Forest green
    accentColor: '#D6A64F', // Warm bronze
    borderColor: '#2A5742',
    badge: '10:00 · NỀN TẢNG',
    summary: 'Phép thử, không gian mẫu Ω, quy tắc cộng/nhân, xác suất có điều kiện, hệ đầy đủ, công thức toàn phần và công thức Bayes.',
    subNodes: [
      {
        id: 'node-10h-1',
        title: 'Phép thử & Biến cố ngẫu nhiên',
        shortDesc: 'Không gian mẫu Ω, biến cố đối, xung khắc và độc lập',
        concept: 'Phép thử là hành động thực nghiệm mà kết quả không thể dự đoán trước. Không gian mẫu $\\Omega$ là tập tất cả các kết quả có thể. Biến cố $A \\subset \\Omega$. Hai biến cố đối lập thoả mãn $A \\cap \\bar{A} = \\emptyset$ và $A \\cup \\bar{A} = \\Omega$.',
        keyFormulas: [
          'P(\\Omega) = 1, \\quad P(\\emptyset) = 0',
          'P(\\bar{A}) = 1 - P(A)',
          'A \\cap B = \\emptyset \\implies A, B \\text{ xung khắc}'
        ],
        conditions: 'Biến cố đối lập chỉ tồn tại theo cặp vét cạn không gian mẫu; xung khắc nghĩa là không thể cùng xảy ra trong một phép thử.',
        crossLinks: ['Liên kết trực tiếp tới Quy tắc cộng xác suất', 'Là cơ sở xây dựng Bảng phân phối xác suất ở Nhánh 2h'],
        practicalExample: 'Kiểm tra ngẫu nhiên 3 sản phẩm xuất xưởng: Biến cố $A$ là "có ít nhất một phế phẩm", biến cố đối $\\bar{A}$ là "cả 3 sản phẩm đều đạt chuẩn".',
        casioShortcut: 'Phím nCr (Shift ÷) và nPr (Shift ×) để tính số phần tử tổ hợp và chỉnh hợp của biến cố.',
        chapterRef: 1
      },
      {
        id: 'node-10h-2',
        title: 'Định nghĩa Xác suất & Tiên đề Kolmogorov',
        shortDesc: 'Cổ điển, hình học, thống kê và hệ tiên đề hiện đại',
        concept: 'Định nghĩa cổ điển giả định các biến cố sơ cấp đồng khả năng và hữu hạn: $P(A) = \\frac{|A|}{|\\Omega|}$. Tiên đề Kolmogorov xây dựng trên độ đo xác suất thỏa mãn tính cộng hữu hạn/đếm được.',
        keyFormulas: [
          'P(A) = \\frac{m}{n} = \\frac{\\text{Số kết quả thuận lợi cho } A}{\\text{Tổng số kết quả sơ cấp đồng khả năng}}',
          '0 \\le P(A) \\le 1, \\quad P\\left(\\bigcup_{i=1}^\\infty A_i\\right) = \\sum_{i=1}^\\infty P(A_i) \\text{ khi rời nhau}'
        ],
        conditions: 'Công thức cổ điển chỉ áp dụng khi số kết quả sơ cấp là hữu hạn và đồng khả năng xảy ra.',
        crossLinks: ['Định nghĩa thống kê gắn liền với Tần suất và Luật số lớn ở Nhánh 4h'],
        practicalExample: 'Rút ngẫu nhiên 4 lá bài từ bộ bài Tây 52 lá, xác suất để được đúng 2 lá Át là $P(A) = \\frac{C_4^2 C_{48}^2}{C_{52}^4}$.',
        casioShortcut: 'Nhập trực tiếp biểu thức tổ hợp: 4 Shift ÷ 2 × 48 Shift ÷ 2 / (52 Shift ÷ 4) = 0.0399.',
        chapterRef: 1
      },
      {
        id: 'node-10h-3',
        title: 'Quy tắc Cộng & Nhân Xác suất',
        shortDesc: 'Xác suất có điều kiện P(A|B) và tính độc lập ngẫu nhiên',
        concept: 'Xác suất của biến cố hợp $A \\cup B$ bằng tổng xác suất trừ đi phần giao. Xác suất có điều kiện $P(A|B)$ đo xác suất của $A$ khi biết chắc $B$ đã xảy ra. Hai biến cố độc lập khi xác suất biến cố này không ảnh hưởng đến biến cố kia.',
        keyFormulas: [
          'P(A \\cup B) = P(A) + P(B) - P(AB)',
          'P(A|B) = \\frac{P(AB)}{P(B)} \\quad (với \\; P(B) > 0)',
          'A, B \\text{ độc lập} \\iff P(AB) = P(A) \\cdot P(B)'
        ],
        conditions: 'Nếu $A, B$ xung khắc thì $P(AB)=0 \\implies P(A \\cup B) = P(A)+P(B)$. Không được nhầm lẫn giữa "độc lập" và "xung khắc".',
        crossLinks: ['Xác suất có điều kiện là tiền đề của Công thức Bayes và Chuỗi Markov'],
        practicalExample: 'Một sinh viên học hai môn XSTK và Kinh tế lượng. Xác suất qua XSTK là 0.8, qua Kinh tế lượng là 0.7, qua cả hai là 0.6. Xác suất qua ít nhất một môn là $0.8 + 0.7 - 0.6 = 0.9$.',
        casioShortcut: 'Sử dụng biến nhớ A, B, C (phím STO) để lưu xác suất trung gian tránh sai số làm tròn.',
        chapterRef: 1
      },
      {
        id: 'node-10h-4',
        title: 'Công thức Xác suất Toàn phần & Bayes',
        shortDesc: 'Hệ biến cố đầy đủ, cập nhật xác suất tiên nghiệm và hậu nghiệm',
        concept: 'Nếu không gian mẫu được phân hoạch bởi hệ biến cố đầy đủ $\{A_1, A_2, ..., A_n\}$, thì xác suất của biến cố bất kỳ $B$ được tính thông qua các xác suất có điều kiện. Công thức Bayes cho phép tính xác suất nguyên nhân sau khi biến cố kết quả đã xuất hiện.',
        keyFormulas: [
          'P(B) = \\sum_{i=1}^n P(A_i) P(B|A_i) \\quad (\\text{Công thức xác suất toàn phần})',
          'P(A_k|B) = \\frac{P(A_k) P(B|A_k)}{\\sum_{i=1}^n P(A_i) P(B|A_i)} = \\frac{P(A_k B)}{P(B)} \\quad (\\text{Công thức Bayes})'
        ],
        conditions: 'Hệ biến cố $\{A_1, ..., A_n\}$ phải là hệ đầy đủ: $A_i \\cap A_j = \\emptyset$ với mọi $i \\ne j$, và $\\bigcup A_i = \\Omega$.',
        crossLinks: ['Cơ sở của thuật toán phân loại Naive Bayes trong Trí tuệ nhân tạo & Khoa học dữ liệu'],
        practicalExample: 'Xét nghiệm phát hiện virus: Tỷ lệ nhiễm bệnh trong cộng đồng là 1%, độ nhạy xét nghiệm là 99%, độ đặc hiệu là 95%. Nếu một người có kết quả dương tính, xác suất thực sự mắc bệnh chỉ xấp xỉ 16.7% theo Bayes!',
        casioShortcut: 'Nhập công thức phân số lồng nhau bằng phím phân số trên Casio fx-580VN X.',
        chapterRef: 1
      },
      {
        id: 'node-10h-5',
        title: 'Dãy phép thử độc lập Bernoulli',
        shortDesc: 'Lặp lại n phép thử độc lập, số lần thành công có khả năng nhất',
        concept: 'Dãy gồm $n$ phép thử độc lập, mỗi phép thử chỉ có 2 khả năng đối lập: Thành công (xác suất $p$) hoặc Thất bại (xác suất $q = 1-p$). Xác suất để có đúng $k$ lần thành công tuân theo phân phối Bernoulli.',
        keyFormulas: [
          'P_n(k) = C_n^k p^k (1-p)^{n-k} = C_n^k p^k q^{n-k}',
          'np - q \\le k_0 \\le np + p \\quad (k_0 \\text{ là số lần thành công có khả năng nhất})'
        ],
        conditions: 'Các phép thử phải hoàn toàn độc lập với nhau và xác suất $p$ không đổi qua từng lần thực hiện.',
        crossLinks: ['Dẫn trực tiếp tới Phân phối Nhị thức B(n, p) tại Nhánh 2h'],
        practicalExample: 'Bắn 10 phát đạn độc lập vào bia với xác suất trúng mỗi phát là 0.7. Xác suất để có đúng 8 phát trúng đích là $C_{10}^8 (0.7)^8 (0.3)^2 \\approx 0.2335$.',
        casioShortcut: 'Menu 7 → 4 (Binomial PD) để tính trực tiếp P(X = k) hoặc Menu 7 → ↓ 1 (Binomial CD) để tính xác suất tích lũy.',
        chapterRef: 1
      }
    ]
  },

  // 2. NHÁNH 2 GIỜ (ĐÔNG BẮC - NORTHEAST): BIẾN NGẪU NHIÊN & PHÂN PHỐI XÁC SUẤT
  {
    id: 'branch-2h',
    clockPosition: '2h',
    angleDeg: 330, // ~2 giờ (trên - phải)
    title: 'BIẾN NGẪU NHIÊN & PHÂN PHỐI XÁC SUẤT',
    subtitle: 'Rời rạc & Liên tục: Nhị thức, Poisson, Chuẩn Gauss & Mũ',
    themeColor: '#5B6F2B', // Olive
    accentColor: '#D6A64F',
    borderColor: '#728938',
    badge: '02:00 · QUY LUẬT',
    summary: 'Biến ngẫu nhiên rời rạc, hàm khối xác suất PMF, biến ngẫu nhiên liên tục PDF/CDF, phân phối chuẩn Gauss, kỳ vọng E(X), phương sai Var(X) và hiệp phương sai.',
    subNodes: [
      {
        id: 'node-2h-1',
        title: 'Biến ngẫu nhiên rời rạc & Phân phối cơ bản',
        shortDesc: 'Bảng phân phối, hàm phân phối tích lũy CDF, Nhị thức & Poisson',
        concept: 'Biến ngẫu nhiên rời rạc nhận tập giá trị hữu hạn hoặc đếm được. Được mô tả bằng Bảng phân phối xác suất hoặc hàm khối xác suất $P(X = x_i) = p_i$ với điều kiện $\\sum p_i = 1$.',
        keyFormulas: [
          'X \\sim B(n, p) \\implies P(X = k) = C_n^k p^k (1-p)^{n-k}, \\quad E(X) = np, \\; Var(X) = np(1-p)',
          'X \\sim P(\\lambda) \\implies P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad E(X) = \\lambda, \\; Var(X) = \\lambda',
          'F(x) = P(X \\le x) = \\sum_{x_i \\le x} p_i'
        ],
        conditions: 'Phân phối Poisson là giới hạn xấp xỉ của Nhị thức khi $n$ rất lớn ($n \\ge 50$) và $p$ rất nhỏ ($p \\le 0.1$) với $\\lambda = np$.',
        crossLinks: ['Xấp xỉ Poisson sang Phân phối Chuẩn khi λ > 15'],
        practicalExample: 'Số cuộc gọi đến tổng đài hỗ trợ trong 1 phút có trung bình $\\lambda = 3$. Xác suất có đúng 2 cuộc gọi là $\\frac{3^2 e^{-3}}{2!} \\approx 0.224$.',
        casioShortcut: 'Casio fx-580VN X: Menu 7 → chọn 4 (Binomial PD) hoặc Menu 7 → cuộn xuống chọn 2 (Poisson PD).',
        chapterRef: 2
      },
      {
        id: 'node-2h-2',
        title: 'Biến ngẫu nhiên liên tục & Hàm mật độ',
        shortDesc: 'Hàm mật độ xác suất PDF f(x), tính chất diện tích dưới đường cong',
        concept: 'Biến ngẫu nhiên liên tục nhận giá trị trên một khoảng liên tục. Được mô tả bởi hàm mật độ xác suất $f(x) \\ge 0$ và diện tích toàn phần dưới đường cong bằng 1. Với biến liên tục, xác suất tại điểm cô lập luôn bằng 0: $P(X = c) = 0$.',
        keyFormulas: [
          'f(x) \\ge 0, \\quad \\int_{-\\infty}^{+\\infty} f(x) dx = 1',
          'P(a \\le X \\le b) = \\int_a^b f(x) dx = F(b) - F(a)',
          'F(x) = \\int_{-\\infty}^x f(t) dt \\implies F\'(x) = f(x)'
        ],
        conditions: 'Hàm $f(x)$ không bao giờ âm; tích phân trên toàn miền thực bắt buộc bằng 1.',
        crossLinks: ['Cơ sở tích phân để tính Kỳ vọng và Phương sai của biến liên tục'],
        practicalExample: 'Tuổi thọ của bóng đèn LED là biến ngẫu nhiên liên tục $X$ (đơn vị: nghìn giờ) có hàm mật độ $f(x) = 0.5 e^{-0.5 x}$ với $x > 0$.',
        casioShortcut: 'Sử dụng phím tích phân (∫dx) trên máy tính để kiểm tra điều kiện chuẩn hóa hoặc tính xác suất trong khoảng.',
        chapterRef: 2
      },
      {
        id: 'node-2h-3',
        title: 'Phân phối Chuẩn Gauss & Chuẩn hóa Z',
        shortDesc: 'N(μ, σ²), biến đổi Z = (X - μ)/σ, quy tắc 3-Sigma và bảng Laplace',
        concept: 'Phân phối quan trọng nhất trong thống kê với đồ thị hàm mật độ hình chuông đối xứng qua tâm $\\mu$. Biến đổi chuẩn hóa đưa bất kỳ phân phối chuẩn $X \\sim N(\\mu, \\sigma^2)$ về dạng chuẩn tắc $Z \\sim N(0, 1)$.',
        keyFormulas: [
          'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}, \\quad Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)',
          'P(a \\le X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
          '\\text{Quy tắc 3}\\sigma: P(\\mu - \\sigma \\le X \\le \\mu + \\sigma) \\approx 68.27\\%, \\; \\pm 2\\sigma \\approx 95.45\\%, \\; \\pm 3\\sigma \\approx 99.73\\%'
        ],
        conditions: 'Độ lệch chuẩn $\\sigma > 0$. Đồ thị đối xứng hoàn hảo qua $x = \\mu$ nên Mode = Median = Mean = $\\mu$.',
        crossLinks: ['Là tâm điểm của Định lý Giới hạn Trung tâm (CLT) ở Nhánh 4h và Kiểm định Z ở Nhánh 8h'],
        practicalExample: 'Điểm thi SAT có $\\mu = 1000, \\sigma = 200$. Thí sinh đạt 1300 điểm có $Z = \\frac{1300-1000}{200} = 1.5$. Xác suất thí sinh khác đạt điểm cao hơn là $1 - \\Phi(1.5) = 1 - 0.9332 = 6.68\\%$.',
        casioShortcut: 'Menu 7 → 2 (Normal CD): Nhập Lower = a, Upper = b, σ, μ để ra ngay xác suất P(a ≤ X ≤ b).',
        chapterRef: 3
      },
      {
        id: 'node-2h-4',
        title: 'Các số đặc trưng: Kỳ vọng & Phương sai',
        shortDesc: 'E(X), Var(X), độ lệch chuẩn σ, Mode, Median và tính chất tuyến tính',
        concept: 'Kỳ vọng $E(X)$ là giá trị trung bình theo trọng số xác suất (trọng tâm phân phối). Phương sai $Var(X)$ đo mức độ biến thiên, phân tán của giá trị xung quanh kỳ vọng.',
        keyFormulas: [
          'E(aX + b) = aE(X) + b, \\quad Var(aX + b) = a^2 Var(X)',
          'Var(X) = E(X^2) - [E(X)]^2, \\quad \\sigma_X = \\sqrt{Var(X)}',
          'X, Y \\text{ độc lập} \\implies E(XY) = E(X)E(Y), \\; Var(X \\pm Y) = Var(X) + Var(Y)'
        ],
        conditions: 'Phương sai luôn không âm: $Var(X) \\ge 0$. Độ lệch chuẩn cùng đơn vị đo với biến ngẫu nhiên gốc.',
        crossLinks: ['Ước lượng trung bình mẫu x̄ và phương sai hiệu chỉnh s² ở Nhánh 4h'],
        practicalExample: 'Trong đầu tư tài chính, lợi suất kỳ vọng của danh mục là $E(R)$, còn rủi ro được đo lường chính xác bằng độ lệch chuẩn $\\sigma_R$.',
        casioShortcut: 'Nhập bảng phân phối bằng Menu 6 (Thống kê 1 biến) với cột FREQ = xác suất để tính tự động E(X) và σx.',
        chapterRef: 2
      },
      {
        id: 'node-2h-5',
        title: 'Biến ngẫu nhiên hai chiều & Tương quan',
        shortDesc: 'Phân phối đồng thời, hiệp phương sai Cov(X,Y) và hệ số tương quan ρ',
        concept: 'Xét đồng thời hai biến ngẫu nhiên $(X, Y)$ trên cùng không gian mẫu. Hiệp phương sai $Cov(X,Y)$ phản ánh chiều hướng biến thiên đồng thời. Hệ số tương quan $\\rho_{XY}$ chuẩn hóa mức độ phụ thuộc tuyến tính về $[-1, 1]$.',
        keyFormulas: [
          'Cov(X, Y) = E[(X - E(X))(Y - E(Y))] = E(XY) - E(X)E(Y)',
          '\\rho_{XY} = \\frac{Cov(X, Y)}{\\sigma_X \\sigma_Y} \\quad (-1 \\le \\rho_{XY} \\le 1)',
          'X, Y \\text{ độc lập} \\implies Cov(X, Y) = 0 \\implies \\rho_{XY} = 0'
        ],
        conditions: 'Chú ý: $Cov(X,Y)=0$ chưa chắc $X, Y$ đã độc lập (chỉ khẳng định không tương quan tuyến tính).',
        crossLinks: ['Mối nối trực tiếp tới Mô hình Hồi quy tuyến tính mẫu ở Nhánh 8h'],
        practicalExample: 'Mối quan hệ giữa chi phí quảng cáo $X$ và doanh thu bán hàng $Y$: Nếu $\\rho_{XY} = 0.88$, chứng tỏ tương quan thuận tuyến tính rất mạnh.',
        casioShortcut: 'Menu 6 → chọn 2 (y = a + bx) để nhập bảng dữ liệu 2 biến và xem r, Cov, phương trình hồi quy.',
        chapterRef: 3
      }
    ]
  },

  // 3. NHÁNH 4 GIỜ (ĐÔNG NAM - SOUTHEAST): THỐNG KÊ MÔ TẢ & LÝ THUYẾT MẪU
  {
    id: 'branch-4h',
    clockPosition: '4h',
    angleDeg: 30, // ~4 giờ (dưới - phải)
    title: 'THỐNG KÊ MÔ TẢ & LÝ THUYẾT MẪU',
    subtitle: 'Đặc trưng mẫu ngẫu nhiên, Trung bình x̄, Phương sai s² & CLT',
    themeColor: '#D6A64F', // Warm bronze
    accentColor: '#1B3D2F',
    borderColor: '#B8883B',
    badge: '04:00 · QUAN SÁT',
    summary: 'Mẫu ngẫu nhiên i.i.d, trung bình mẫu, phương sai mẫu hiệu chỉnh s², định lý giới hạn trung tâm (CLT) và phân phối lấy mẫu Student, Chi-bình phương, Fisher.',
    subNodes: [
      {
        id: 'node-4h-1',
        title: 'Mẫu ngẫu nhiên & Phương pháp thu thập',
        shortDesc: 'Tổng thể N phần tử, mẫu kích thước n độc lập cùng phân phối (i.i.d)',
        concept: 'Tổng thể là toàn bộ tập hợp các đối tượng nghiên cứu với các tham số chưa biết $(\\mu, \\sigma^2, p)$. Mẫu ngẫu nhiên gồm $n$ biến ngẫu nhiên $X_1, X_2, ..., X_n$ độc lập và có cùng phân phối xác suất với tổng thể gốc.',
        keyFormulas: [
          'W_X = (X_1, X_2, ..., X_n) \\quad (X_i \\text{ i.i.d theo } X)',
          '\\text{Cỡ mẫu } n \\ge 30 \\implies \\text{Mẫu lớn}; \\quad n < 30 \\implies \\text{Mẫu nhỏ}'
        ],
        conditions: 'Các phần tử trong mẫu phải được chọn hoàn toàn ngẫu nhiên và khách quan để đảm bảo tính đại diện cho tổng thể.',
        crossLinks: ['Là nguyên liệu đầu vào cho Ước lượng khoảng và Kiểm định giả thuyết ở Nhánh 8h'],
        practicalExample: 'Khảo sát ngẫu nhiên mức chi tiêu của 100 sinh viên tại một trường đại học để suy diễn cho toàn bộ 15.000 sinh viên của trường.',
        casioShortcut: 'Nhập dữ liệu thô vào Menu 6 (1-Variable) để máy tính lưu mẫu vào bộ nhớ thống kê.',
        chapterRef: 4
      },
      {
        id: 'node-4h-2',
        title: 'Các số đặc trưng mẫu thực nghiệm',
        shortDesc: 'Trung bình mẫu x̄, phương sai mẫu s², phương sai hiệu chỉnh s² và tỷ lệ f',
        concept: 'Từ mẫu cụ thể $(x_1, ..., x_n)$, ta tính các đại lượng thống kê mô tả. Trung bình mẫu $\\bar{x}$ ước lượng kỳ vọng tổng thể. Phương sai mẫu hiệu chỉnh $s^2$ chia cho $n-1$ để tạo ước lượng không chệch cho $\\sigma^2$.',
        keyFormulas: [
          '\\bar{x} = \\frac{1}{n} \\sum_{i=1}^n x_i, \\quad E(\\bar{X}) = \\mu, \\; Var(\\bar{X}) = \\frac{\\sigma^2}{n}',
          's^2 = \\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2 \\quad (E(S^2) = \\sigma^2 \\text{ không chệch})',
          '\\hat{p} = f = \\frac{m}{n} \\quad (m \\text{ phần tử mang thuộc tính quan sát})'
        ],
        conditions: 'Chia cho $(n-1)$ vì đã mất 1 bậc tự do khi dùng $\\bar{x}$ để tính độ lệch.',
        crossLinks: ['Khoảng tin cậy cho μ sử dụng s thay thế khi σ chưa biết'],
        practicalExample: 'Đo chiều cao của 5 bạn: 165, 170, 168, 172, 175. Trung bình $\\bar{x} = 170$ cm, phương sai hiệu chỉnh $s^2 = 14.5$ cm².',
        casioShortcut: 'Trên Casio: phím OPTN → chọn 2 (1-Variable Calc) để xem ngay $\\bar{x}$, $\\sum x$, $\\sum x^2$, $\\sigma_x$, $s_x$ ($s_x$ chính là độ lệch chuẩn hiệu chỉnh!).',
        chapterRef: 4
      },
      {
        id: 'node-4h-3',
        title: 'Định lý Giới hạn Trung tâm (CLT)',
        shortDesc: 'Nền tảng vàng của thống kê: Khi n ≥ 30, trung bình mẫu x̄ xấp xỉ phân phối chuẩn',
        concept: 'Cho $X_1, ..., X_n$ độc lập cùng phân phối có kỳ vọng $\\mu$ và phương sai $\\sigma^2$ hữu hạn. Bất kể phân phối gốc là gì (đều, nhị thức, xiên hay lệch), khi cỡ mẫu $n$ đủ lớn ($n \\ge 30$), trung bình mẫu $\\bar{X}$ sẽ hội tụ về phân phối chuẩn $N(\\mu, \\sigma^2/n)$.',
        keyFormulas: [
          '\\bar{X} \\xrightarrow{d} N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad \\text{khi } n \\to \\infty',
          'Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} N(0, 1)',
          '\\sum_{i=1}^n X_i \\sim N(n\\mu, n\\sigma^2)'
        ],
        conditions: 'Tổng thể gốc phải có phương sai hữu hạn; các quan sát độc lập; cỡ mẫu thực hành $n \\ge 30$.',
        crossLinks: ['Giải thích vì sao Phân phối Chuẩn xuất hiện khắp nơi trong tự nhiên và kinh tế'],
        practicalExample: 'Dù số phế phẩm từng lô hàng có phân phối rời rạc không đối xứng, nhưng trung bình phế phẩm của 50 lô hàng liên tiếp sẽ tuân theo phân phối chuẩn hoàn hảo.',
        casioShortcut: 'Nhập phân phối chuẩn của trung bình mẫu với độ lệch chuẩn $\\sigma_{\\bar{x}} = \\frac{\\sigma}{\\sqrt{n}}$ trên Menu 7.',
        chapterRef: 4
      },
      {
        id: 'node-4h-4',
        title: 'Các phân phối của thống kê mẫu',
        shortDesc: 'Phân phối Student t(n-1), Chi-bình phương χ²(n-1) và Fisher F',
        concept: 'Khi tổng thể gốc chuẩn $N(\\mu, \\sigma^2)$ nhưng tham số $\\sigma$ chưa biết, việc thay $\\sigma$ bằng độ lệch mẫu $s$ làm xuất hiện phân phối Student $t$ với đuôi dày hơn phân phối chuẩn. Tỷ số phương sai tuân theo Fisher $F$.',
        keyFormulas: [
          'T = \\frac{\\bar{X} - \\mu}{s / \\sqrt{n}} \\sim t(n-1) \\quad (\\text{Phân phối Student bậc tự do } n-1)',
          '\\chi^2 = \\frac{(n-1)s^2}{\\sigma^2} \\sim \\chi^2(n-1) \\quad (\\text{Phân phối Khi-bình phương})',
          'F = \\frac{s_1^2 / \\sigma_1^2}{s_2^2 / \\sigma_2^2} \\sim F(n_1-1, n_2-1)'
        ],
        conditions: 'Phân phối Student $t$ tiến về Chuẩn tắc $N(0, 1)$ khi số bậc tự do $n-1 \\ge 30$. Bắt buộc tổng thể gốc phải phân phối chuẩn khi $n < 30$.',
        crossLinks: ['Là công cụ nền tảng để tra bảng số trong Kiểm định T-test và Ước lượng tham số ở Nhánh 8h'],
        practicalExample: 'Kiểm nghiệm độ bền của một mác thép mới với mẫu nhỏ $n = 12$, bắt buộc dùng giá trị tới hạn $t_{0.025; 11} = 2.201$ thay vì $z_{0.025} = 1.96$.',
        casioShortcut: 'Tra bảng Student hoặc bấm máy trực tiếp để xác định giá trị tới hạn $t_\\alpha$.',
        chapterRef: 4
      }
    ]
  },

  // 4. NHÁNH 8 GIỜ (TÂY NAM - SOUTHWEST): THỐNG KÊ SUY DIỄN: ƯỚC LƯỢNG & KIỂM ĐỊNH
  {
    id: 'branch-8h',
    clockPosition: '8h',
    angleDeg: 150, // ~8 giờ (dưới - trái)
    title: 'THỐNG KÊ SUY DIỄN: ƯỚC LƯỢNG & KIỂM ĐỊNH',
    subtitle: 'Khoảng tin cậy Z/T, Kiểm định giả thuyết H₀, p-value & Hồi quy',
    themeColor: '#132E23', // Deep dark green
    accentColor: '#D6A64F',
    borderColor: '#264E3D',
    badge: '08:00 · QUYẾT ĐỊNH',
    summary: 'Ước lượng khoảng tin cậy cho kỳ vọng μ và tỷ lệ p, kiểm định giả thuyết thống kê, sai lầm loại I & II, miền bác bỏ Wα, p-value, so sánh 2 tham số và mô hình hồi quy OLS.',
    subNodes: [
      {
        id: 'node-8h-1',
        title: 'Ước lượng Khoảng tin cậy',
        shortDesc: 'Khoảng tin cậy đối xứng cho μ và tỷ lệ p với độ tin cậy 1 - α',
        concept: 'Tìm một khoảng $[\\hat{\\theta} - \\epsilon, \\hat{\\theta} + \\epsilon]$ chứa tham số thực $\\theta$ của tổng thể với xác suất tin cậy $1 - \\alpha$ định trước. $\\epsilon$ là độ chính xác của ước lượng.',
        keyFormulas: [
          '\\mu \\in \\left[ \\bar{x} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}, \\; \\bar{x} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\right] \\quad (\\text{Khi biết } \\sigma \\text{ hoặc } n \\ge 30)',
          '\\mu \\in \\left[ \\bar{x} - t_{\\alpha/2; n-1} \\frac{s}{\\sqrt{n}}, \\; \\bar{x} + t_{\\alpha/2; n-1} \\frac{s}{\\sqrt{n}} \\right] \\quad (\\text{Chưa biết } \\sigma, n < 30, \\text{chuẩn})',
          'p \\in \\left[ f - z_{\\alpha/2} \\sqrt{\\frac{f(1-f)}{n}}, \\; f + z_{\\alpha/2} \\sqrt{\\frac{f(1-f)}{n}} \\right]',
          'n \\ge \\frac{z_{\\alpha/2}^2 \\sigma^2}{\\epsilon^2} \\quad (\\text{Xác định cỡ mẫu tối thiểu})'
        ],
        conditions: 'Khi độ tin cậy $1-\\alpha$ tăng (ví dụ 95% lên 99%) thì bán kính khoảng $\\epsilon$ tăng (khoảng rộng hơn, kém chính xác hơn nhưng độ tin cậy cao hơn).',
        crossLinks: ['Có mối quan hệ tương đương kép với Kiểm định giả thuyết hai phía'],
        practicalExample: 'Khảo sát $n = 100$ bình gas có trung bình $\\bar{x} = 12$ kg, $s = 0.2$ kg. Với độ tin cậy 95% ($z_{0.025} = 1.96$), khoảng tin cậy cho khối lượng bình ga là $12 \\pm 1.96 \\cdot \\frac{0.2}{\\sqrt{100}} = [11.961, 12.039]$ kg.',
        casioShortcut: 'Tính sai số $\\epsilon = 1.96 \\times s / \\sqrt{n}$, sau đó lấy $\\bar{x} - \\epsilon$ và $\\bar{x} + \\epsilon$.',
        chapterRef: 5
      },
      {
        id: 'node-8h-2',
        title: 'Kiểm định giả thuyết: Bản chất & Sai lầm',
        shortDesc: 'Cặp giả thuyết H₀ vs H₁, sai lầm loại I (α), loại II (β) và mức ý nghĩa',
        concept: 'Kiểm định giả thuyết nhằm đưa ra quyết định bác bỏ hay chấp nhận một khẳng định về tham số tổng thể dựa trên mẫu quan sát. Giả thuyết vô hiệu $H_0$ là trạng thái cân bằng. Sai lầm loại I là bác bỏ $H_0$ khi $H_0$ đúng; sai lầm loại II là không bác bỏ $H_0$ khi $H_0$ sai.',
        keyFormulas: [
          '\\alpha = P(\\text{Bác bỏ } H_0 \\mid H_0 \\text{ đúng}) = \\text{Mức ý nghĩa}',
          '\\beta = P(\\text{Không bác bỏ } H_0 \\mid H_0 \\text{ sai})',
          '1 - \\beta = \\text{Lực kiểm định (Power of the test)}'
        ],
        conditions: 'Trong thực hành, ta khống chế sai lầm loại I ở mức nhỏ (thường $\\alpha = 5\\%$ hoặc $1\\%$) rồi tìm miền bác bỏ tối ưu.',
        crossLinks: ['Quy tắc quyết định p-value và Miền bác bỏ Wα'],
        practicalExample: 'Tương tự việc xét xử tại tòa án: $H_0$: "Bị cáo vô tội". Sai lầm loại I: kết án người vô tội (rất nghiêm trọng). Sai lầm loại II: thả lọt tội phạm.',
        casioShortcut: 'Nhớ nhanh các giá trị tới hạn chuẩn tắc thông dụng: $z_{0.05} = 1.645$, $z_{0.025} = 1.96$, $z_{0.005} = 2.576$.',
        chapterRef: 6
      },
      {
        id: 'node-8h-3',
        title: 'Quy trình Kiểm định & Tiêu chuẩn Wα',
        shortDesc: 'Z-test, T-test, quy tắc so sánh giá trị tới hạn và phương pháp p-value',
        concept: 'Các bước kiểm định: 1. Thiết lập $H_0, H_1$; 2. Chọn tiêu chuẩn kiểm định phù hợp; 3. Với mức ý nghĩa $\\alpha$, xác định miền bác bỏ $W_\\alpha$; 4. Tính giá trị quan sát $Z_{qs}$ hoặc $T_{qs}$; 5. Kết luận: Nếu rơi vào $W_\\alpha$ thì bác bỏ $H_0$.',
        keyFormulas: [
          'Z_{qs} = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} \\quad \\text{hoặc} \\quad T_{qs} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}',
          'H_1: \\mu > \\mu_0 \\implies W_\\alpha = (z_\\alpha, +\\infty) \\quad (\\text{Kiểm định một phía bên phải})',
          'H_1: \\mu \\ne \\mu_0 \\implies W_\\alpha = (-\\infty, -z_{\\alpha/2}) \\cup (z_{\\alpha/2}, +\\infty) \\quad (\\text{Hai phía})',
          '\\text{Quy tắc } p\\text{-value}: p \\le \\alpha \\implies \\text{Bác bỏ } H_0; \\quad p > \\alpha \\implies \\text{Chưa bác bỏ } H_0'
        ],
        conditions: 'Đối thuyết $H_1$ mang dấu $>$ thì miền bác bỏ lệch phải; mang dấu $<$ thì lệch trái; mang dấu $\\ne$ thì chia đều hai phía.',
        crossLinks: ['So sánh 2 trung bình và 2 tỷ lệ mẫu'],
        practicalExample: 'Nhà sản xuất tuyên bố tuổi thọ bóng đèn là $\\mu_0 = 1000$ giờ. Nghi ngờ tuổi thọ thấp hơn, ta đặt $H_0: \\mu = 1000$ vs $H_1: \\mu < 1000$ (kiểm định phía trái).',
        casioShortcut: 'Tính trực tiếp $Z_{qs} = (\\bar{x} - \\mu_0) / (s / \\sqrt{n})$ và so sánh ngay với ngưỡng tới hạn.',
        chapterRef: 6
      },
      {
        id: 'node-8h-4',
        title: 'So sánh 2 Tham số & Hồi quy tuyến tính',
        shortDesc: 'So sánh μ₁ - μ₂, tỷ lệ p₁ - p₂, tương quan Pearson và mô hình hồi quy OLS',
        concept: 'So sánh hai tổng thể độc lập hoặc cặp quan sát ghép đôi để đánh giá hiệu quả tác động. Phân tích hồi quy tuyến tính đơn ước lượng mối liên hệ hàm số $Y = \\beta_0 + \\beta_1 X + U$ bằng phương pháp bình phương bé nhất (OLS).',
        keyFormulas: [
          'Z_{qs} = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}} \\sim N(0, 1) \\quad (\\text{So sánh 2 trung bình mẫu lớn})',
          'Z_{qs} = \\frac{f_1 - f_2}{\\sqrt{\\bar{p}(1-\\bar{p})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}} \\quad (\\bar{p} = \\frac{m_1 + m_2}{n_1 + n_2})',
          '\\hat{y} = a + bx \\quad \\text{với} \\; b = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^2 - (\\sum x)^2}, \\; a = \\bar{y} - b\\bar{x}',
          'R^2 = r^2 \\quad (\\text{Hệ số xác định đo mức độ giải thích của mô hình})'
        ],
        conditions: 'Mô hình hồi quy tuyến tính cổ điển giả định sai số ngẫu nhiên $U$ có kỳ vọng bằng 0, phương sai không đổi và không tự tương quan.',
        crossLinks: ['Khép kín chu trình nghiên cứu dữ liệu từ Xác suất lý thuyết đến Kinh tế lượng'],
        practicalExample: 'So sánh hiệu quả của thuốc mới và thuốc cũ trên 2 nhóm bệnh nhân $n_1 = 50, n_2 = 50$ để kiểm tra tỷ lệ khỏi bệnh có tăng thực sự hay chỉ do ngẫu nhiên.',
        casioShortcut: 'Menu 6 → chọn 2 (y = a + bx), nhập các cặp $(x_i, y_i)$, bấm OPTN → 3 để lấy hệ số a, b và r.',
        chapterRef: 7
      }
    ]
  }
];

// Dữ liệu cho Trợ lý chọn phương pháp giải (Section 6)
export interface SolverMethodQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    description: string;
    nextStep?: string;
    recommendedMethod?: {
      title: string;
      category: string;
      formula: string;
      conditions: string[];
      steps: string[];
      casioGuide: string;
    };
  }[];
}

export const SOLVER_ASSISTANT_TREE: Record<string, SolverMethodQuestion> = {
  root: {
    id: 'root',
    question: 'Bước 1: Đề bài của bạn thuộc nhóm nội dung trọng tâm nào dưới đây?',
    options: [
      {
        label: '1. Tính xác suất của biến cố',
        description: 'Bốc thăm, tung xúc xắc, chọn mẫu, biến cố ngẫu nhiên, Bayes...',
        nextStep: 'step_prob'
      },
      {
        label: '2. Biến ngẫu nhiên & Phân phối xác suất',
        description: 'Kỳ vọng, phương sai, phân phối Nhị thức, Poisson, Chuẩn Gauss...',
        nextStep: 'step_rv'
      },
      {
        label: '3. Ước lượng tham số (Khoảng tin cậy)',
        description: 'Tìm khoảng tin cậy cho kỳ vọng μ, tỷ lệ p, xác định cỡ mẫu tối thiểu...',
        nextStep: 'step_est'
      },
      {
        label: '4. Kiểm định giả thuyết thống kê',
        description: 'Bác bỏ hay chấp nhận nhận định, kiểm tra độ tin cậy, so sánh 2 trung bình...',
        nextStep: 'step_test'
      }
    ]
  },

  step_prob: {
    id: 'step_prob',
    question: 'Bước 2: Dữ kiện bài toán xác suất có đặc điểm nào dưới đây?',
    options: [
      {
        label: 'Có nhiều khả năng sơ cấp đồng khả năng (bài toán bốc đồ vật, cỗ bài, gieo xúc xắc)',
        description: 'Dùng quy tắc đếm tổ hợp / chỉnh hợp cổ điển',
        recommendedMethod: {
          title: 'Phương pháp Xác suất Cổ điển kết hợp Tổ hợp',
          category: 'Xác suất cơ bản',
          formula: 'P(A) = \\frac{|A|}{|\\Omega|} = \\frac{C_M^k C_{N-M}^{n-k}}{C_N^n}',
          conditions: [
            'Các biến cố sơ cấp phải đồng khả năng',
            'Không gian mẫu Ω phải hữu hạn kết quả'
          ],
          steps: [
            'Bước 1: Xác định tổng số phần tử không gian mẫu n(Ω) (ví dụ chọn n từ N vật: C_N^n)',
            'Bước 2: Phân tích biến cố A thành các công đoạn độc lập (nhân) hoặc trường hợp rời nhau (cộng)',
            'Bước 3: Lập tỷ số m/n và rút gọn tối giản'
          ],
          casioGuide: 'Bấm n Shift ÷ k để tính tổ hợp nhanh trên Casio fx-580VN X'
        }
      },
      {
        label: 'Biến cố A phụ thuộc vào nguyên nhân xuất hiện trước đó (nhiều nhà máy, nhiều hộp)',
        description: 'Đã xuất hiện kết quả, cần tính xác suất do nguyên nhân nào gây ra',
        recommendedMethod: {
          title: 'Công thức Xác suất Toàn phần & Định lý Bayes',
          category: 'Xác suất toàn phần & Bayes',
          formula: 'P(B) = \\sum P(A_i)P(B|A_i), \\quad P(A_k|B) = \\frac{P(A_k)P(B|A_k)}{P(B)}',
          conditions: [
            'Các biến cố nguyên nhân A1, ..., An phải tạo thành hệ đầy đủ (tổng xác suất = 1)',
            'Các nguyên nhân phải xung khắc từng đôi'
          ],
          steps: [
            'Bước 1: Gọi hệ đầy đủ A1, A2... là các nguồn/nguyên nhân gốc (ví dụ tỷ lệ sản phẩm từng phân xưởng)',
            'Bước 2: Gọi B là biến cố kết quả ghi nhận được (ví dụ sản phẩm là phế phẩm)',
            'Bước 3: Xác định các xác suất điều kiện P(B|Ai)',
            'Bước 4: Áp dụng công thức toàn phần tính P(B), sau đó áp dụng Bayes nếu đề hỏi ngược xác suất nguyên nhân'
          ],
          casioGuide: 'Lưu các xác suất trung gian vào biến A, B, C (phím STO) để tránh sai số làm tròn'
        }
      },
      {
        label: 'Lặp lại n lần độc lập cùng một phép thử với xác suất p cố định',
        description: 'Bắn n phát đạn, kiểm tra n sản phẩm độc lập',
        recommendedMethod: {
          title: 'Công thức Bernoulli & Phân phối Nhị thức B(n, p)',
          category: 'Công thức Bernoulli',
          formula: 'P_n(k) = C_n^k p^k (1-p)^{n-k}',
          conditions: [
            'Các lần thử phải hoàn toàn độc lập',
            'Xác suất thành công p không đổi qua các lần'
          ],
          steps: [
            'Bước 1: Xác định cỡ n, xác suất thành công p và thất bại q = 1 - p',
            'Bước 2: Xác định số lần thành công k mong muốn',
            'Bước 3: Thay vào công thức Bernoulli hoặc bấm trực tiếp máy tính'
          ],
          casioGuide: 'Menu 7 → chọn 4 (Binomial PD) nhập Variable: k, n, p để nhận đáp số ngay lập tức'
        }
      }
    ]
  },

  step_rv: {
    id: 'step_rv',
    question: 'Bước 2: Biến ngẫu nhiên trong bài là rời rạc hay liên tục?',
    options: [
      {
        label: 'Biến ngẫu nhiên có phân phối Chuẩn N(μ, σ²)',
        description: 'Chiều cao, cân nặng, sai số đo, điểm thi, thời gian gia công...',
        recommendedMethod: {
          title: 'Chuẩn hóa Gauss & Tra bảng Laplace / Casio Menu 7',
          category: 'Phân phối liên tục',
          formula: 'Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1), \\quad P(a \\le X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
          conditions: [
            'Đề bài cho biết biến X có phân phối chuẩn hoặc áp dụng định lý giới hạn trung tâm (n ≥ 30)',
            'Phân biệt rõ giữa phương sai σ² và độ lệch chuẩn σ'
          ],
          steps: [
            'Bước 1: Xác định đúng giá trị kỳ vọng μ và độ lệch chuẩn σ (nếu cho phương sai nhớ khai căn)',
            'Bước 2: Chuyển đổi khoảng cần tính sang biến chuẩn tắc Z = (X - μ)/σ',
            'Bước 3: Tra bảng hàm Laplace Φ(z) hoặc bấm trực tiếp máy tính Menu 7 → 2'
          ],
          casioGuide: 'Menu 7 → 2 (Normal CD): Nhập Lower, Upper, σ, μ để ra ngay xác suất chính xác 100%'
        }
      },
      {
        label: 'Biến ngẫu nhiên rời rạc cho dưới dạng Bảng phân phối hoặc hàm khối',
        description: 'Cần tìm kỳ vọng E(X), phương sai Var(X), độ lệch chuẩn',
        recommendedMethod: {
          title: 'Tính số đặc trưng bằng định nghĩa & Menu 6 Thống kê',
          category: 'Số đặc trưng rời rạc',
          formula: 'E(X) = \\sum x_i p_i, \\quad Var(X) = E(X^2) - [E(X)]^2',
          conditions: [
            'Tổng xác suất ở hàng xác suất bắt buộc phải bằng 1: ∑ p_i = 1'
          ],
          steps: [
            'Bước 1: Kiểm tra tính chuẩn hóa ∑ p_i = 1 để tìm tham số còn thiếu (nếu có)',
            'Bước 2: Lập tích x_i * p_i và cộng lại để ra E(X)',
            'Bước 3: Tính E(X²) = ∑ x_i² * p_i, sau đó lấy E(X²) - (E(X))² để ra Var(X)'
          ],
          casioGuide: 'Bật cột tần số FREQ (Shift Menu ↓ 3 1), vào Menu 6 chọn 1 để nhập bảng x_i và p_i'
        }
      }
    ]
  },

  step_est: {
    id: 'step_est',
    question: 'Bước 2: Bạn cần ước lượng tham số nào của tổng thể?',
    options: [
      {
        label: 'Ước lượng kỳ vọng μ (trung bình tổng thể) khi BIẾT độ lệch chuẩn σ hoặc n ≥ 30',
        description: 'Dùng bảng phân phối chuẩn tắc Z',
        recommendedMethod: {
          title: 'Khoảng tin cậy Z cho Kỳ vọng μ',
          category: 'Ước lượng tham số',
          formula: '\\mu \\in \\left[ \\bar{x} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\; \\bar{x} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\right]',
          conditions: [
            'Độ lệch chuẩn tổng thể σ đã biết, hoặc cỡ mẫu lớn n ≥ 30 (khi đó thay σ bằng s)',
            'Độ tin cậy 1 - α (95% thì z_α/2 = 1.96; 99% thì z_α/2 = 2.576)'
          ],
          steps: [
            'Bước 1: Tính trung bình mẫu x̄ và độ lệch chuẩn mẫu s (nếu chưa cho)',
            'Bước 2: Tìm giá trị tới hạn z_α/2 từ độ tin cậy 1 - α',
            'Bước 3: Tính sai số ước lượng ε = z_α/2 * (s / √n)',
            'Bước 4: Viết khoảng tin cậy [x̄ - ε, x̄ + ε]'
          ],
          casioGuide: 'Nhập dữ liệu mẫu vào Menu 6 để lấy ngay x̄ và s_x'
        }
      },
      {
        label: 'Ước lượng kỳ vọng μ khi CHƯA BIẾT σ và cỡ mẫu NHỎ (n < 30)',
        description: 'Tổng thể chuẩn, dùng phân phối Student t',
        recommendedMethod: {
          title: 'Khoảng tin cậy Student t cho Kỳ vọng μ',
          category: 'Ước lượng tham số mẫu nhỏ',
          formula: '\\mu \\in \\left[ \\bar{x} - t_{\\alpha/2; n-1}\\frac{s}{\\sqrt{n}}, \\; \\bar{x} + t_{\\alpha/2; n-1}\\frac{s}{\\sqrt{n}} \\right]',
          conditions: [
            'Tổng thể gốc phải có phân phối chuẩn',
            'Số bậc tự do là df = n - 1'
          ],
          steps: [
            'Bước 1: Tính trung bình mẫu x̄ và độ lệch chuẩn mẫu hiệu chỉnh s (s_x trên máy)',
            'Bước 2: Tra bảng Student t với mức ý nghĩa α/2 và bậc tự do n - 1',
            'Bước 3: Tính độ chính xác ε = t_α/2 * (s / √n)',
            'Bước 4: Kết luận khoảng tin cậy'
          ],
          casioGuide: 'Chú ý lấy giá trị s_x (phương sai hiệu chỉnh chia n-1) trên máy tính'
        }
      },
      {
        label: 'Ước lượng tỷ lệ p của tổng thể (tỷ lệ phế phẩm, tỷ lệ ưa chuộng...)',
        description: 'Cần tìm khoảng tin cậy cho tỷ lệ p',
        recommendedMethod: {
          title: 'Khoảng tin cậy cho Tỷ lệ p',
          category: 'Ước lượng tỷ lệ',
          formula: 'p \\in \\left[ f - z_{\\alpha/2}\\sqrt{\\frac{f(1-f)}{n}}, \\; f + z_{\\alpha/2}\\sqrt{\\frac{f(1-f)}{n}} \\right]',
          conditions: [
            'Cỡ mẫu n đủ lớn sao cho nf ≥ 5 và n(1-f) ≥ 5'
          ],
          steps: [
            'Bước 1: Tính tần suất mẫu f = m/n',
            'Bước 2: Tra giá trị z_α/2 ứng với độ tin cậy đề cho',
            'Bước 3: Tính sai số ε = z_α/2 * √(f(1-f)/n)',
            'Bước 4: Kết luận khoảng [f - ε, f + ε]'
          ],
          casioGuide: 'Tính f trước, sau đó tính biểu thức căn bậc hai trên màn hình chính'
        }
      }
    ]
  },

  step_test: {
    id: 'step_test',
    question: 'Bước 2: Bài toán kiểm định của bạn kiểm tra khẳng định nào?',
    options: [
      {
        label: 'Kiểm định một kỳ vọng H₀: μ = μ₀ (định mức, tiêu chuẩn chất lượng)',
        description: 'So sánh trung bình thực tế với một con số lý thuyết',
        recommendedMethod: {
          title: 'Kiểm định Giả thuyết về Kỳ vọng μ (Z-test / T-test)',
          category: 'Kiểm định 1 tham số',
          formula: 'Z_{qs} = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} \\quad \\text{hoặc} \\quad T_{qs} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}',
          conditions: [
            'Biết σ hoặc n ≥ 30: dùng Z_qs',
            'Chưa biết σ, n < 30, chuẩn: dùng T_qs với bậc tự do n - 1'
          ],
          steps: [
            'Bước 1: Đặt giả thuyết H0: μ = μ0 và đối thuyết H1 (chọn đúng: khác ≠, lớn hơn >, nhỏ hơn <)',
            'Bước 2: Tính giá trị quan sát Z_qs hoặc T_qs',
            'Bước 3: Xác định miền bác bỏ W_α theo chiều của H1',
            'Bước 4: So sánh nếu Z_qs ∈ W_α thì Bác bỏ H0, ngược lại thì Chưa có cơ sở bác bỏ H0'
          ],
          casioGuide: 'Tính Z_qs bằng biểu thức phân số đơn giản trên Casio fx-580VN X'
        }
      },
      {
        label: 'So sánh hai kỳ vọng H₀: μ₁ = μ₂ (so sánh hai phương pháp, hai dây chuyền)',
        description: 'Xem xét sự khác biệt trung bình giữa 2 nhóm độc lập',
        recommendedMethod: {
          title: 'Kiểm định So sánh Hai Trung bình Mẫu Độc lập',
          category: 'Kiểm định 2 tham số',
          formula: 'Z_{qs} = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}} \\sim N(0, 1)',
          conditions: [
            'Hai mẫu phải độc lập với nhau',
            'Cỡ mẫu n1, n2 đủ lớn (≥ 30) hoặc tổng thể phân phối chuẩn'
          ],
          steps: [
            'Bước 1: Đặt H0: μ1 = μ2 (hay μ1 - μ2 = 0) vs H1 (≠, > hoặc <)',
            'Bước 2: Tính trung bình và phương sai của từng nhóm',
            'Bước 3: Tính Z_qs và đối chiếu với miền bác bỏ W_α'
          ],
          casioGuide: 'Lưu x̄1 vào A, s1 vào B, x̄2 vào C, s2 vào D để bấm công thức Z_qs chính xác'
        }
      }
    ]
  }
};
