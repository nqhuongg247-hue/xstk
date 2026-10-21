import { ChapterInfo } from '../types';

export const CHAPTERS_DATA: ChapterInfo[] = [
  {
    id: 1,
    title: "Bài 1: Xác suất và Công thức tính Xác suất",
    pdfPath: "/assets/aistudio/B_i_1_X_c_Su_t_V__C_ng_Th_c_T_nh_X_c_Su_t_2_BUOI_ab2f0d0a.pdf",
    description: "Khái niệm xác suất trong ngân hàng & phòng ngừa rủi ro tín dụng; Phép thử, không gian mẫu Ω; Xác suất cổ điển, xác suất thống kê; Công thức cộng, nhân, điều kiện, Bernoulli, xác suất đầy đủ & Bayes.",
    sections: [
      {
        id: "1.1",
        title: "1.1 Khái niệm cơ bản & Ý nghĩa trong phòng ngừa rủi ro",
        keyFormulas: [
          "P(A) = \\frac{n_A}{n_\\Omega} = \\frac{\\text{Số biến cố thuận lợi cho } A}{\\text{Tổng số biến cố đồng khả năng}}",
          "P(A) = \\lim_{n \\to \\infty} \\frac{m}{n} \\approx \\frac{m}{n} \\quad (\\text{Định nghĩa thống kê khi } n \\text{ đủ lớn})",
          "0 \\le P(A) \\le 1, \\quad P(\\Omega) = 1, \\quad P(\\emptyset) = 0"
        ],
        content: "Xác suất là tỷ lệ dự đoán về một hiện tượng chưa biết trước kết quả. Trong quản trị rủi ro ngân hàng, xác suất doanh nghiệp không trả được nợ (ví dụ 5%) là căn cứ pháp lý để trích lập quỹ dự phòng rủi ro tín dụng. Biến cố chắc chắn là Ω, biến cố không thể là ∅, biến cố ngẫu nhiên là A, B, C.",
        examples: [
          {
            problem: "Một ngân hàng cho 200 doanh nghiệp vay vốn với tổng số tiền 4.512 tỷ đồng. Xác suất không trả được nợ là 5% và khả năng thu hồi tài sản đạt 80%. Hãy xác định số tiền cần trích lập dự phòng rủi ro?",
            solution: "Số tiền nợ rủi ro tiềm ẩn = 4.512 tỷ * 5% = 225.6 tỷ đồng. Vì thu hồi tài sản đạt 80% nên tổn thất thực tế là 20%. Số tiền cần lập quỹ dự phòng = 225.6 tỷ * (1 - 80%) = 45.12 tỷ đồng.",
            tips: "Ứng dụng trực tiếp trong nghiệp vụ ngân hàng thương mại và chuẩn mực IFRS 9."
          }
        ]
      },
      {
        id: "1.2",
        title: "1.2 Công thức Cộng xác suất, Biến cố xung khắc & Biến cố đối",
        keyFormulas: [
          "P(A + B) = P(A) + P(B) - P(AB)",
          "A \\cap B = \\emptyset \\implies P(A + B) = P(A) + P(B) \\quad (\\text{Biến cố xung khắc})",
          "P(\\bar{A}) = 1 - P(A) \\quad (\\text{Biến cố đối})"
        ],
        content: "Biến cố tổng A + B xảy ra khi có ít nhất một trong hai biến cố xảy ra. Biến cố tích A.B xảy ra khi cả hai đồng thời xảy ra. Nếu A và B xung khắc (không thể xảy ra đồng thời) thì xác suất tổng bằng tổng các xác suất. Dùng biến cố đối khi đề bài có từ 'có ít nhất một'.",
        examples: [
          {
            problem: "Một nhà đầu tư xem xét cổ phiếu và trái phiếu. Xác suất cổ phiếu sinh lợi trong năm tới là 60%, trái phiếu sinh lợi là 50%, cả hai đều sinh lợi là 30%. Tính xác suất để nhà đầu tư có ít nhất một khoản đầu tư sinh lợi?",
            solution: "Gọi A: 'Cổ phiếu sinh lợi', B: 'Trái phiếu sinh lợi'. Ta có P(A) = 0.6; P(B) = 0.5; P(AB) = 0.3. Xác suất có ít nhất một khoản sinh lời là P(A + B) = P(A) + P(B) - P(AB) = 0.6 + 0.5 - 0.3 = 0.8 (80%).",
            tips: "Chú ý trừ đi phần giao P(AB) nếu hai khoản đầu tư không xung khắc."
          }
        ]
      },
      {
        id: "1.3",
        title: "1.3 Xác suất có điều kiện & Công thức nhân",
        keyFormulas: [
          "P(A|B) = \\frac{P(AB)}{P(B)} \\quad (P(B) > 0)",
          "P(AB) = P(B) \\cdot P(A|B) = P(A) \\cdot P(B|A)",
          "A, B \\text{ độc lập} \\iff P(AB) = P(A) \\cdot P(B)"
        ],
        content: "Xác suất của biến cố A với điều kiện biến cố B đã xảy ra là P(A|B). Hai biến cố độc lập khi việc xảy ra của biến cố này không ảnh hưởng đến xác suất xảy ra của biến cố kia. Lưu ý phân biệt: độc lập (P(AB) = P(A)P(B)) khác với xung khắc (AB = ∅).",
        examples: [
          {
            problem: "Trong 100 lần công ty công bố lợi nhuận, có 60 lần lợi nhuận cao hơn kỳ vọng (B). Trong các lần đó có 40 lần cổ phiếu tăng giá trên 5% ở tuần tiếp theo (A.B). Tính xác suất cổ phiếu tăng giá trên 5% biết công ty đã công bố lợi nhuận cao hơn kỳ vọng?",
            solution: "P(B) = 60/100 = 0.6. P(AB) = 40/100 = 0.4. Áp dụng xác suất có điều kiện: P(A|B) = P(AB)/P(B) = 0.4 / 0.6 ≈ 0.67 (67%). Ý nghĩa: Tin tức lợi nhuận tốt đẩy xác suất tăng giá lên 67%.",
            tips: "Dùng để phân tích tác động của sự kiện tin tức tài chính."
          }
        ]
      },
      {
        id: "1.4",
        title: "1.4 Công thức Bernoulli, Xác suất đầy đủ & Công thức Bayes",
        keyFormulas: [
          "P_n(k) = C_n^k p^k q^{n-k} \\quad (q = 1 - p)",
          "P(A) = \\sum_{i=1}^n P(H_i) \\cdot P(A|H_i) \\quad (\\{H_i\\} \\text{ là hệ đầy đủ})",
          "P(H_k|A) = \\frac{P(H_k) \\cdot P(A|H_k)}{\\sum_{i=1}^n P(H_i) \\cdot P(A|H_i)}"
        ],
        content: "Công thức Bernoulli áp dụng cho dãy n phép thử độc lập với xác suất thành công p cố định. Hệ biến cố đầy đủ chia không gian mẫu thành các lát cắt xung khắc. Công thức Bayes cho phép cập nhật xác suất tiên nghiệm thành xác suất hậu nghiệm sau khi quan sát hiện tượng.",
        examples: [
          {
            problem: "Một ngân hàng cho vay với xác suất khách hàng trả nợ đúng hạn p = 0.9. Chọn ngẫu nhiên 5 khách hàng, tính xác suất có đúng 4 khách hàng trả nợ đúng hạn?",
            solution: "Dãy phép thử Bernoulli với n = 5, k = 4, p = 0.9, q = 0.1. P_5(4) = C_5^4 (0.9)^4 (0.1)^1 = 5 * 0.6561 * 0.1 = 0.32805 (32.81%).",
            tips: "Dùng phím nCr trên máy tính cầm tay để tính tổ hợp C_n^k."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Bài 2: Biến Ngẫu Nhiên & Các Đặc Trưng Số",
    pdfPath: "/assets/aistudio/B_i_2__BI_N_NG_U_NHI_N_c813f7d9.pdf",
    description: "Khái niệm biến ngẫu nhiên rời rạc & liên tục; Bảng phân phối xác suất; Hàm mật độ f(x); Các đặc trưng số: Mode, Kỳ vọng E(X) (điểm cân bằng, doanh thu kỳ vọng), Phương sai Var(X) và Độ lệch chuẩn (đo lường rủi ro danh mục đầu tư).",
    sections: [
      {
        id: "2.1",
        title: "2.1 Phân loại Biến ngẫu nhiên & Hàm mật độ xác suất",
        keyFormulas: [
          "\\text{Bảng phân phối BNN rời rạc: } \\sum_{i=1}^n p_i = 1",
          "\\text{Hàm mật độ BNN liên tục: } f(x) \\ge 0, \\quad \\int_{-\\infty}^{+\\infty} f(x)dx = 1",
          "P(a \\le X \\le b) = \\int_a^b f(x) dx"
        ],
        content: "Biến ngẫu nhiên là hàm số gán cho mỗi kết quả phép thử một giá trị thực. BNN rời rạc nhận các giá trị đếm được (số máy hỏng, số khách vay). BNN liên tục lấp đầy khoảng thực (tỷ suất sinh lời, thời gian, lãi suất). Xác suất tại một điểm của BNN liên tục luôn bằng 0: P(X = c) = 0.",
        examples: [
          {
            problem: "Cho BNN liên tục X có hàm mật độ f(x) = a*x^2 nếu 0 <= x <= 1 và bằng 0 ở nơi khác. Tìm hằng số a và tính P(0 <= X <= 0.5)?",
            solution: "Điều kiện chuẩn hóa: ∫_0^1 a*x^2 dx = a [x^3/3]_0^1 = a/3 = 1 => a = 3. Khi đó P(0 <= X <= 0.5) = ∫_0^{0.5} 3x^2 dx = [x^3]_0^{0.5} = (0.5)^3 = 0.125.",
            tips: "Tích phân của hàm mật độ trên toàn trục số bắt buộc bằng 1."
          }
        ]
      },
      {
        id: "2.2",
        title: "2.2 Kỳ vọng toán E(X) — Giá trị trung bình & Cân bằng",
        keyFormulas: [
          "E(X) = \\sum x_i p_i \\quad (\\text{Rời rạc}) \\qquad E(X) = \\int_{-\\infty}^{+\\infty} x f(x) dx \\quad (\\text{Liên tục})",
          "E(C) = C, \\quad E(CX) = C \\cdot E(X), \\quad E(X + Y) = E(X) + E(Y)",
          "X, Y \\text{ độc lập} \\implies E(XY) = E(X) \\cdot E(Y)"
        ],
        content: "Kỳ vọng biểu thị điểm cân bằng trọng tâm của phân phối. Ứng dụng: Dự báo doanh thu trung bình, đánh giá tỷ suất sinh lời kỳ vọng của cổ phiếu, định phí bảo hiểm nhân thọ dựa trên xác suất tử vong.",
        examples: [
          {
            problem: "Một cổ phiếu sau 1 năm có 3 kịch bản: Lãi 20% (xác suất 0.3), Lãi 10% (xác suất 0.5), Lỗ 5% (xác suất 0.2). Tính lợi nhuận kỳ vọng?",
            solution: "E(X) = 0.3 * (20%) + 0.5 * (10%) + 0.2 * (-5%) = 6% + 5% - 1% = 10%. Nhà đầu tư có thể kỳ vọng mức sinh lời 10%/năm để so sánh với lãi suất trái phiếu chính phủ.",
            tips: "Lỗ tương ứng với giá trị âm trong công thức kỳ vọng."
          }
        ]
      },
      {
        id: "2.3",
        title: "2.3 Phương sai Var(X) & Độ lệch chuẩn — Đo lường rủi ro đầu tư",
        keyFormulas: [
          "Var(X) = E[(X - E(X))^2] = E(X^2) - [E(X)]^2",
          "\\sigma(X) = \\sqrt{Var(X)} \\quad (\\text{Độ lệch chuẩn})",
          "Var(C) = 0, \\quad Var(CX) = C^2 Var(X), \\quad Var(X+Y) = Var(X) + Var(Y) \\ (X, Y \\text{ độc lập})"
        ],
        content: "Phương sai đại diện cho mức độ biến động/phân tán xung quanh kỳ vọng. Trong tài chính, phương sai và độ lệch chuẩn chính là thước đo rủi ro biến động giá. Danh mục có phương sai thấp hơn được ưu tiên khi lợi nhuận kỳ vọng ngang nhau.",
        examples: [
          {
            problem: "Cổ phiếu A có lợi nhuận kỳ vọng 10%, phương sai 0.04 (độ lệch chuẩn 20%). Cổ phiếu B có lợi nhuận kỳ vọng 5%, phương sai 0.01 (độ lệch chuẩn 10%). Nhận xét về rủi ro?",
            solution: "Cổ phiếu A mang lại lợi nhuận kỳ vọng cao gấp đôi B (10% vs 5%) nhưng rủi ro biến động (phương sai 0.04 so với 0.01) cao gấp 4 lần. Nhà đầu tư ngại rủi ro sẽ cân nhắc đa dạng hóa danh mục để triệt tiêu phương sai riêng lẻ.",
            tips: "Nhớ công thức tính nhanh: Var(X) = E(X^2) - (EX)^2."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Bài 3: Một số Phân phối Xác suất Thông dụng",
    pdfPath: "/assets/aistudio/B_i_3__M_T_S__PH_N_PH_I_X_C_SU_T_C_A_BI_N_NG_U_NHI_N_TH_NG_D_NG_ddf9d177.pdf",
    description: "Phân phối rời rạc (Nhị thức, Poisson, Siêu bội); Phân phối liên tục (Chuẩn N(μ, σ²), Đều, Mũ); Phân phối dùng trong kiểm định (Student t, Chi-bình phương χ², Fisher F); Tra bảng Laplace và xấp xỉ Poisson/Chuẩn.",
    sections: [
      {
        id: "3.1",
        title: "3.1 Phân phối Chuẩn N(μ, σ²) & Phân phối Chuẩn tắc Z ~ N(0, 1)",
        keyFormulas: [
          "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}, \\quad EX = \\mu, \\ Var(X) = \\sigma^2",
          "Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1) \\quad (\\text{Chuẩn hóa})",
          "P(a < X < b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)"
        ],
        content: "Phân phối chuẩn có đồ thị hình chuông đối xứng qua x = μ. Định lý giới hạn trung tâm giải thích tại sao phần lớn hiện tượng tự nhiên và kinh tế (chiều cao, sai số gia công, điểm thi, chỉ số IQ) tuân theo luật phân phối chuẩn. Lưu ý tính đối xứng hàm Laplace: Φ(-z) = -Φ(z) hoặc Φ(-z) = 1 - Φ(z) tùy bảng tra.",
        examples: [
          {
            problem: "Tuổi thọ của sản phẩm có phân phối chuẩn với trung bình μ = 2000 giờ, phương sai 400 (độ lệch chuẩn σ = 20 giờ). Thời gian bảo hành miễn phí là dưới 1950 giờ. Tính tỷ lệ sản phẩm phải bảo hành?",
            solution: "Chuẩn hóa: Z = (1950 - 2000) / 20 = -50 / 20 = -2.5. P(X < 1950) = Φ(-2.5) = 0.5 - Φ_0(2.5) = 0.5 - 0.4938 = 0.0062 (0.62%). Khoảng 0.62% sản phẩm bị lỗi trong thời hạn bảo hành.",
            tips: "Lưu ý phương sai = 400 thì độ lệch chuẩn σ = √400 = 20."
          }
        ]
      },
      {
        id: "3.2",
        title: "3.2 Phân phối Poisson P(λ) & Ứng dụng Rủi ro tín dụng",
        keyFormulas: [
          "P(X = k) = \\frac{e^{-\\lambda} \\cdot \\lambda^k}{k!} \\quad (k = 0, 1, 2, \\dots)",
          "E(X) = \\lambda, \\quad Var(X) = \\lambda",
          "\\text{Định lý Poisson: } B(n, p) \\approx P(\\lambda = np) \\quad (n \\ge 50, p \\le 0.1, np \\le 5)"
        ],
        content: "Mô tả số lần xuất hiện của biến cố hiếm trong khoảng thời gian hoặc không gian cố định (số cuộc gọi đến tổng đài, số lỗi phần mềm, số khách vỡ nợ tín dụng). Khi n lớn và p rất nhỏ, phân phối Nhị thức được xấp xỉ chính xác bằng Poisson.",
        examples: [
          {
            problem: "Một ngân hàng có 10.000 khoản vay nhỏ, xác suất vỡ nợ của mỗi khoản vay là p = 0.0005. Tính số khoản vỡ nợ trung bình và xác suất có đúng 4 khoản vỡ nợ trong năm tới?",
            solution: "Tham số λ = n*p = 10.000 * 0.0005 = 5. Số khoản vỡ nợ trung bình E(X) = 5. Xác suất có đúng 4 khoản: P(X = 4) = (e^{-5} * 5^4) / 4! = (0.006738 * 625) / 24 ≈ 0.1755 (17.55%).",
            tips: "Poisson giúp tính toán nhanh mà không cần khai triển tổ hợp số lớn C_{10000}^4."
          }
        ]
      },
      {
        id: "3.3",
        title: "3.3 Các phân phối Student (t), Chi-bình phương (χ²), Fisher (F)",
        keyFormulas: [
          "T = \\frac{Z}{\\sqrt{\\chi^2(n)/n}} \\sim t(n) \\quad (\\text{Phân phối Student bậc } n)",
          "\\chi^2(n) = \\sum_{i=1}^n Z_i^2 \\sim \\chi^2(n) \\quad (\\text{Chi-bình phương bậc } n)",
          "F = \\frac{\\chi_1^2/m}{\\chi_2^2/n} \\sim F(m, n) \\quad (\\text{Phân phối Fisher})"
        ],
        content: "Bộ ba phân phối nền tảng của thống kê suy diễn: Student t dùng khi mẫu nhỏ n < 30 chưa biết phương sai tổng thể; Chi-bình phương dùng để kiểm định phương sai và độ phù hợp; Fisher dùng để so sánh phương sai của 2 mẫu độc lập trong phân tích ANOVA.",
        examples: [
          {
            problem: "Khi nào đồ thị phân phối Student tiến dần về đồ thị phân phối chuẩn tắc Z?",
            solution: "Khi bậc tự do n (cỡ mẫu) tiến ra vô cùng (thực tế n >= 30), đuôi của phân phối Student mỏng dần và hội tụ chính xác về phân phối chuẩn tắc N(0, 1).",
            tips: "Quy tắc kiểm định n >= 30 giúp xác định dùng Z-test hay T-test."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Bài 4: Mẫu Ngẫu Nhiên và Các Số Đặc Trưng của Mẫu",
    pdfPath: "/assets/aistudio/B_i_4_M_U_NG_U_NHI_N_V__C_C_S____C_TR_NG_C_A_M_U_9fff1599.pdf",
    description: "Khái niệm mẫu (Sample) vs Tổng thể (Population); Mẫu ngẫu nhiên & mẫu cụ thể; Trung bình mẫu x̄, tỷ lệ mẫu f, phương sai mẫu s² và phương sai mẫu hiệu chỉnh; Định lý giới hạn trung tâm (CLT) áp dụng cho mẫu.",
    sections: [
      {
        id: "4.1",
        title: "4.1 Khái niệm Tổng thể, Mẫu & Bảng tần số ghép lớp",
        keyFormulas: [
          "\\bar{x} = \\frac{1}{n} \\sum_{i=1}^k n_i x_i \\quad (x_i \\text{ là điểm giữa khoảng } [a, b))",
          "s^2 = \\frac{1}{n-1} \\sum_{i=1}^k n_i (x_i - \\bar{x})^2 \\quad (\\text{Phương sai mẫu hiệu chỉnh})",
          "s = \\sqrt{s^2} \\quad (\\text{Độ lệch chuẩn mẫu hiệu chỉnh})"
        ],
        content: "Nghiên cứu toàn bộ tổng thể tốn kém và bất khả thi nên khoa học thống kê suy diễn từ mẫu con đại diện. Phân biệt nghiên cứu về lượng (trung bình, phương sai) và về chất (tỷ lệ). Với dữ liệu phân tổ khoảng [a, b), điểm đại diện x_i = (a + b)/2.",
        examples: [
          {
            problem: "Thống kê dư nợ 100 khách hàng: [0-20) có 15 người; [20-40) có 25 người; [40-60) có 35 người; [60-80) có 15 người; [80-100] có 10 người. Xác định dư nợ trung bình mẫu?",
            solution: "Điểm giữa các khoảng: x_i = {10, 30, 50, 70, 90}. Dư nợ trung bình x̄ = (15*10 + 25*30 + 35*50 + 15*70 + 10*90) / 100 = (150 + 750 + 1750 + 1050 + 900) / 100 = 4600 / 100 = 46 triệu đồng.",
            tips: "Có thể nhập dữ liệu vào Casio fx-580VN X bằng Menu 6 (Thống kê 1 biến) để tính nhanh x̄ và s."
          }
        ]
      },
      {
        id: "4.2",
        title: "4.2 Phân phối của Trung bình mẫu & Định lý Giới hạn Trung tâm",
        keyFormulas: [
          "\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad (\\text{Khi } n \\ge 30)",
          "Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\sim N(0, 1)",
          "T = \\frac{\\bar{X} - \\mu}{s / \\sqrt{n}} \\sim T(n-1) \\quad (\\text{Khi } n < 30, \\sigma \\text{ chưa biết})"
        ],
        content: "Bất kể tổng thể gốc có phân phối thế nào, trung bình của mẫu ngẫu nhiên đủ lớn (n >= 30) luôn hội tụ về phân phối chuẩn với kỳ vọng μ và phương sai σ²/n. Độ phân tán của trung bình mẫu giảm tỷ lệ nghịch với căn bậc hai của cỡ mẫu √n.",
        examples: [
          {
            problem: "Độ dài chi tiết máy có phân phối chuẩn trung bình 200mm, độ lệch chuẩn 20mm. Kiểm tra mẫu n = 25 chi tiết. Tính xác suất độ dài trung bình mẫu không nhỏ hơn 200mm?",
            solution: "Vì tổng thể chuẩn nên x̄ ~ N(200, 20^2 / 25) = N(200, 16). Độ lệch chuẩn của mẫu = 20 / √25 = 4mm. P(x̄ >= 200) = 0.5 (do tính đối xứng của phân phối chuẩn quanh kỳ vọng μ = 200).",
            tips: "Sai số chuẩn của trung bình mẫu là SE = σ / √n."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Bài 5: Ước Lượng Khoảng (Khoảng Tin Cậy)",
    pdfPath: "/assets/aistudio/B_I_5_kho_ng___c_l__ng_1080ca13.pdf",
    description: "Độ tin cậy 1 - α, độ chính xác (sai số biên ϵ); Khoảng tin cậy cho Tỷ lệ p; Khoảng tin cậy cho Trung bình μ (TH n >= 30 và TH n < 30); Khoảng tin cậy cho Phương sai σ²; Hướng dẫn bấm máy tính Casio fx-580VN X Menu 7 Distribution.",
    sections: [
      {
        id: "5.1",
        title: "5.1 Khoảng tin cậy cho Tỷ lệ p & Xác định cỡ mẫu",
        keyFormulas: [
          "p \\in [f - \\epsilon, f + \\epsilon] \\quad \\text{với } \\epsilon = z_{\\alpha/2} \\sqrt{\\frac{f(1-f)}{n}}",
          "\\text{Cỡ mẫu cần thiết: } n \\ge \\frac{z_{\\alpha/2}^2 \\cdot f(1-f)}{\\epsilon^2}",
          "\\text{Bảng giá trị: } 90\\% \\implies z_{0.05} = 1.65; \\quad 95\\% \\implies z_{0.025} = 1.96; \\quad 99\\% \\implies z_{0.005} = 2.58"
        ],
        content: "Dùng để ước lượng tỷ lệ khách hàng ưa thích sản phẩm, tỷ lệ phế phẩm hoặc tỷ lệ nợ xấu trên toàn thị trường từ khảo sát mẫu f. Khi chưa biết f trước để tính cỡ mẫu n, có thể chọn f = 0.5 để đảm bảo cận trên an toàn nhất.",
        examples: [
          {
            problem: "Kiểm tra 50 sọt trái cây (mỗi sọt 100 trái) thấy 450 trái không đạt chuẩn. Ước lượng tỷ lệ trái không đạt chuẩn với độ tin cậy 95%?",
            solution: "Cỡ mẫu n = 50 * 100 = 5000 trái. Tỷ lệ mẫu f = 450 / 5000 = 0.09 (9%). Độ tin cậy 95% => z_{α/2} = 1.96. Sai số biên: ϵ = 1.96 * √(0.09 * 0.91 / 5000) ≈ 0.0079. Khoảng tin cậy: [0.09 - 0.0079, 0.09 + 0.0079] = [0.0821, 0.0979] (từ 8.21% đến 9.79%).",
            tips: "Trình bày theo cấu trúc: Tính f -> Tìm z_{α/2} -> Tính ϵ -> Kết luận khoảng."
          }
        ]
      },
      {
        id: "5.2",
        title: "5.2 Khoảng tin cậy cho Trung bình μ & Phương sai σ²",
        keyFormulas: [
          "n \\ge 30: \\quad \\mu \\in \\left[ \\bar{x} - z_{\\alpha/2} \\frac{s}{\\sqrt{n}}, \\bar{x} + z_{\\alpha/2} \\frac{s}{\\sqrt{n}} \\right]",
          "n < 30: \\quad \\mu \\in \\left[ \\bar{x} - t_{\\alpha/2}^{(n-1)} \\frac{s}{\\sqrt{n}}, \\bar{x} + t_{\\alpha/2}^{(n-1)} \\frac{s}{\\sqrt{n}} \\right]",
          "\\sigma^2 \\in \\left[ \\frac{(n-1)s^2}{\\chi_{\\alpha/2}^2(n-1)}, \\frac{(n-1)s^2}{\\chi_{1-\\alpha/2}^2(n-1)} \\right]"
        ],
        content: "Ước lượng trung bình tổng thể dựa trên mẫu. Chú ý: Khi n < 30 và chưa biết phương sai tổng thể thì bắt buộc dùng phân phối Student với bậc tự do df = n - 1. Khoảng ước lượng phương sai dùng phân phối Chi-bình phương với cận đảo chiều.",
        examples: [
          {
            problem: "Cân thử 100 sản phẩm thấy trọng lượng trung bình x̄ = 500g, độ lệch chuẩn mẫu hiệu chỉnh s = 150g. Ước lượng trọng lượng trung bình với độ tin cậy 95%?",
            solution: "n = 100 >= 30, z_{0.025} = 1.96. Độ chính xác ϵ = 1.96 * (150 / √100) = 1.96 * 15 = 29.4g. Khoảng tin cậy: [500 - 29.4, 500 + 29.4] = [470.6g, 529.4g].",
            tips: "Có thể bấm máy Casio fx-580VN X Menu 7: 1-Normal PD, 2-Normal CD, 3-Inverse Normal."
          }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Bài 6: Kiểm Định Giả Thiết trong Thống Kê",
    pdfPath: "/assets/aistudio/B_i_6__KI_M___NH_GI__THI_T_TRONG_TH_NG_K___AutoRecovered__45ff1036.pdf",
    description: "Nguyên lý kiểm định H0 và đối thiết H1; Mức ý nghĩa α; Miền bác bỏ W_α; Tiêu chuẩn kiểm định Zqs, Tqs, χ²qs; Kiểm định tỷ lệ p; Kiểm định giá trị trung bình μ (1 phía và 2 phía); Kiểm định phương sai σ².",
    sections: [
      {
        id: "6.1",
        title: "6.1 Nguyên lý chung & Kiểm định Tỷ lệ p",
        keyFormulas: [
          "Z_{qs} = \\frac{f - p_0}{\\sqrt{\\frac{p_0 q_0}{n}}} \\quad (q_0 = 1 - p_0)",
          "H_1: p \\ne p_0 \\implies W_\\alpha = (-\\infty, -z_{\\alpha/2}) \\cup (z_{\\alpha/2}, +\\infty)",
          "H_1: p > p_0 \\implies W_\\alpha = (z_\\alpha, +\\infty), \\qquad H_1: p < p_0 \\implies W_\\alpha = (-\\infty, -z_\\alpha)"
        ],
        content: "Đặt giả thiết H0: tham số bằng giá trị chuẩn. Đối thiết H1 là điều nghi ngờ cần kiểm chứng. Mức ý nghĩa α là xác suất bác bỏ H0 khi H0 đúng (sai lầm loại I). Nếu giá trị thống kê kiểm định Zqs rơi vào miền bác bỏ W_α thì bác bỏ H0, ngược lại thì chấp nhận H0.",
        examples: [
          {
            problem: "Tỷ lệ phế phẩm trước đây là 5%. Sau cải tiến kỹ thuật, kiểm tra 400 sản phẩm thấy có 16 phế phẩm. Với mức ý nghĩa α = 0.01, cải tiến kỹ thuật có thực sự làm giảm tỷ lệ phế phẩm không?",
            solution: "H0: p = 0.05 vs H1: p < 0.05 (1 phía trái). n = 400, f = 16/400 = 0.04. Mức ý nghĩa α = 0.01 => z_α = 2.33 => Miền bác bỏ W_α = (-∞, -2.33). Tiêu chuẩn: Zqs = (0.04 - 0.05) / √(0.05 * 0.95 / 400) = -0.01 / 0.0109 ≈ -0.92. Vì -0.92 không thuộc W_α, ta chấp nhận H0. Chưa đủ cơ sở kết luận cải tiến làm giảm phế phẩm.",
            tips: "Lưu ý kiểm định 1 phía tra z_α (không chia 2)."
          }
        ]
      },
      {
        id: "6.2",
        title: "6.2 Kiểm định Trung bình μ (Z-test & T-test)",
        keyFormulas: [
          "Z_{qs} = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} \\quad (n \\ge 30 \\text{ hoặc } \\sigma \\text{ đã biết})",
          "T_{qs} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} \\sim T(n-1) \\quad (n < 30, \\sigma \\text{ chưa biết})",
          "\\text{Bác bỏ } H_0 \\iff |T_{qs}| > t_{\\alpha/2}^{(n-1)} \\quad (\\text{Kiểm định 2 phía})"
        ],
        content: "Kiểm tra xem trung bình tổng thể có thay đổi so với quy định hay không. Ví dụ: kiểm tra trọng lượng đóng gói sản phẩm, thời gian phục vụ khách hàng, nồng độ tạp chất xả thải.",
        examples: [
          {
            problem: "Trọng lượng bao gạo quy định là 50kg. Cân thử 25 bao thấy trung bình x̄ = 49.52kg và s = 0.5kg. Với mức ý nghĩa α = 0.01, trọng lượng trung bình có thay đổi so với quy định không?",
            solution: "H0: μ = 50 vs H1: μ ≠ 50 (2 phía). n = 25 < 30, tra Student bậc 24: t_{0.005}^{(24)} = 2.797. Miền bác bỏ W_α = (-∞, -2.797) ∪ (2.797, +∞). Tiêu chuẩn: Tqs = (49.52 - 50) / (0.5 / √25) = -0.48 / 0.1 = -4.8. Vì -4.8 ∈ W_α nên bác bỏ H0. Kết luận: Trọng lượng thực tế bị thiếu so với quy định.",
            tips: "Mẫu nhỏ n < 30 bắt buộc tra phân phối Student."
          }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Bài 7: So Sánh Các Tham Số (2 Mẫu)",
    pdfPath: "/assets/aistudio/B_i_7__SO_S_NH_C_C_THAM_S__6fd26d59.pdf",
    description: "So sánh 2 tỷ lệ p1 và p2 (Tỷ lệ chung f_gộp); So sánh 2 giá trị trung bình μ1 và μ2; Phương sai gộp (Pooled Variance s²); Kiểm định Student t cho 2 mẫu; So sánh 2 phương sai bằng tiêu chuẩn Fisher F.",
    sections: [
      {
        id: "7.1",
        title: "7.1 So sánh 2 Tỷ lệ tổng thể (p1 vs p2)",
        keyFormulas: [
          "f = \\frac{k_1 + k_2}{n + m} \\quad (\\text{Tỷ lệ gộp chung})",
          "Z_{qs} = \\frac{f_1 - f_2}{\\sqrt{f(1-f)\\left(\\frac{1}{n} + \\frac{1}{m}\\right)}}",
          "W_\\alpha = (-\\infty, -z_{\\alpha/2}) \\cup (z_{\\alpha/2}, +\\infty) \\quad (H_1: p_1 \\ne p_2)"
        ],
        content: "So sánh tỷ lệ giữa hai nhóm khách hàng, hai phân xưởng hoặc hai thị trường. Giả thiết H0: p1 = p2, dưới H0 ta gộp hai mẫu lại để có ước lượng tỷ lệ chung f.",
        examples: [
          {
            problem: "Kiểm tra 100 sản phẩm máy 1 thấy 20 phế phẩm (f1 = 0.2). Kiểm tra 150 sản phẩm máy 2 thấy 15 phế phẩm (f2 = 0.1). Với mức ý nghĩa α = 5%, chất lượng 2 máy có khác nhau không?",
            solution: "Tỷ lệ gộp f = (20 + 15) / (100 + 150) = 35 / 250 = 0.14. Tiêu chuẩn: Zqs = (0.2 - 0.1) / √[0.14 * 0.86 * (1/100 + 1/150)] = 0.1 / 0.0448 ≈ 2.232. Mức α = 0.05 => z_{0.025} = 1.96. Do 2.232 > 1.96, ta bác bỏ H0. Kết luận: Tỷ lệ phế phẩm máy 1 cao hơn máy 2 rõ rệt.",
            tips: "Nhớ tính tỷ lệ gộp f = (k1 + k2)/(n + m) trước."
          }
        ]
      },
      {
        id: "7.2",
        title: "7.2 So sánh 2 Trung bình & Phương sai gộp (Pooled Variance)",
        keyFormulas: [
          "s^2 = \\frac{(n-1)s_1^2 + (m-1)s_2^2}{n + m - 2} \\quad (\\text{Phương sai gộp khi } \\sigma_1^2 = \\sigma_2^2)",
          "t = \\frac{\\bar{x} - \\bar{y}}{\\sqrt{s^2 \\left(\\frac{1}{n} + \\frac{1}{m}\\right)}} \\sim T(n + m - 2)",
          "\\text{So sánh 2 phương sai: } F_{qs} = \\frac{s_{max}^2}{s_{min}^2} \\sim F(n_1-1, n_2-1)"
        ],
        content: "So sánh hiệu quả giữa 2 phương pháp giảng dạy, chi phí tiếp khách giữa 2 phòng ban hoặc năng suất 2 giống vật nuôi. Khi chưa biết phương sai nhưng giả định phương sai bằng nhau, ta tính phương sai gộp s² và dùng kiểm định Student t với bậc tự do df = n + m - 2.",
        examples: [
          {
            problem: "Khảo sát chi phí tiếp khách: Bán hàng có n = 15, x̄ = 42.5 USD, s1 = 9.5 USD; Sản xuất có m = 15, ȳ = 31.75 USD, s2 = 8.2 USD. Với α = 1%, chi phí có khác nhau không?",
            solution: "df = 15 + 15 - 2 = 28. Phương sai gộp s² = [14*(9.5)^2 + 14*(8.2)^2] / 28 ≈ 78.745. Thống kê t = (42.5 - 31.75) / √[78.745 * (1/15 + 1/15)] = 10.75 / 3.24 ≈ 3.319. Tra bảng t_{0.005}^{(28)} = 2.763. Vì 3.319 > 2.763 nên bác bỏ H0. Chi phí bán hàng cao hơn sản xuất có ý nghĩa thống kê.",
            tips: "Phương sai gộp s² là trung bình có trọng số theo bậc tự do của 2 phương sai mẫu."
          }
        ]
      }
    ]
  }
];
