# Stock Forecasting — HTML Presentation Design Tokens

Cập nhật: 2026-11-13. Phạm vi: presentation HTML của Stock Forecasting. Human yêu cầu lưu tại `presentaition-HTML/`; giữ đúng tên thư mục này, không tự đổi chính tả hoặc di chuyển presentation hiện có.

Tài liệu này là nguồn tham chiếu thị giác cho các lần làm slide HTML. Không thay thế yêu cầu khoa học trong `DEFINE.md` hoặc thiết kế phần mềm trong `DESIGN.md`. Không chứng minh presentation đã được áp dụng theme hoặc kiểm tra trên trình duyệt.

## 1. Nguồn và trạng thái

- **Confirmed:** dùng nhận diện Light Mode, trắng/lavender, violet–purple, chữ tối; palette và các gradient theo brief human.
- **Confirmed:** ảnh tham chiếu là brand board Nextel human gửi trong chat, có panel lavender sáng, chữ đen lớn, gradient tím và lớp kính xuyên sáng. Chỉ lấy ngôn ngữ thị giác; không lấy logo, tên, slogan, chân dung, điện thoại hoặc số liệu của Nextel.
- **Confirmed:** human duyệt Be Vietnam Pro, deck10 slide, LaTeX, minh họa và tách architecture/modules. Layout hiện hành ở mục4 và10; đã rà browser nhưng chưa phải chứng nhận accessibility.
- **TBD:** các chart thực nghiệm và hình dữ liệu thật chờ artifacts; không tạo số liệu để lấp bố cục.
- Skill tham khảo: `brandkit`. Human đã thu hẹp deliverable thành HTML presentation; không tự sinh brand board raster hoặc bộ logo mới.

Ảnh tham chiếu không được chép vào repo trong lượt này. Đường dẫn clipboard chỉ là file tạm, không dùng làm `src` ảnh hay dependency của sản phẩm. Mô tả/palette trong file này là căn cứ lâu dài khi không còn truy cập được ảnh chat.

## 2. Visual direction

Một presentation công nghệ AI có sự rõ ràng của tài liệu khoa học và nhận diện tím thanh lịch. Một slide có một trọng tâm; khoảng trắng giúp đọc nội dung. Nội dung và biểu đồ phải rõ hơn hiệu ứng trang trí.

| Thành phần | Quy tắc |
|---|---|
| Nền chính | Trắng hoặc Light Lavender, phân vùng bằng panel/border/sắc nền |
| Tiêu đề | Chữ tối, cỡ lớn; violet chỉ nhấn một cụm quan trọng |
| Điểm nhấn | Primary Violet; gradient chỉ trên vùng cần tạo trọng tâm |
| Hình minh họa | Chuỗi thời gian, forecast window, neural layers hoặc dataflow liên quan Stock Forecasting |
| Kính/ánh sáng | Chỉ ở vùng minh họa/viền; không đặt nền kính thiếu tương phản sau bảng hay đoạn chữ dài |
| Bố cục | Grid và căn hàng nhất quán; thay đổi bố cục theo nội dung, không mọi slide đều ba card |

Định hướng phân bố: 65% trắng/lavender sáng, 20% điểm nhấn tím, 10% gradient mềm, 5% chữ tối/chi tiết tương phản. Đây là tỷ lệ cảm nhận, không ép diện tích CSS chính xác hoặc giảm lượng chữ cần thiết để đạt tỷ lệ.

## 3. Color tokens — Confirmed

| Token | Hex | Vai trò |
|---|---|---|
| primary-violet | #7A2CFF | Primary action, active state, từ khóa |
| electric-purple | #B84DFF | Gradient và accent phụ |
| soft-purple | #E097FF | Ánh sáng, highlight nền nhẹ |
| lavender | #E3CFFF | Panel phụ, diagram fills |
| light-lavender | #FAF7FF | Background sáng |
| white | #FFFFFF | Card/nền trung tính |
| deep-purple | #160A29 | Vùng tương phản/atmosphere có chọn lọc |
| dark-purple | #211335 | Chi tiết tối |
| text-primary | #111111 | Nội dung chính |
| text-secondary | #716B7D | Nội dung phụ; phải kiểm contrast trên nền thực tế |
| border | #EAE3F5 | Border phân vùng; không dùng thay focus indicator |
| section-surface | #F4EEFF | Vùng nền section theo brief |

Không tự lấy màu bằng mắt từ ảnh rồi thay hex đã chốt. Không giữ teal/cam làm màu nhận diện chính chỉ vì CSS cũ đang dùng.

### Gradient — Confirmed stops, Proposed hướng

| Tên | Stops | Cách dùng |
|---|---|---|
| Primary | #7A2CFF → #B84DFF | CTA/điểm nhấn/hình chủ đạo |
| Soft | #B84DFF → #E097FF → #FAF7FF | Vùng minh họa/chuyển nền nhẹ |
| Atmospheric | #160A29 → #7A2CFF → #B84DFF | Một phần minh họa có độ sâu; không biến deck thành dark theme |

Không dùng gradient cho body text, từng ô bảng hoặc mọi card. Gradient text nếu có chỉ ở từ khóa lớn, có màu fallback và kiểm contrast.

## 4. Typography và layout — Sau human review

| Thành phần | Giá trị khởi đầu cho slide 1280 × 720 |
|---|---|
| Heading font | Be Vietnam Pro, fallback system sans-serif |
| Body font | Be Vietnam Pro, fallback system sans-serif |
| Code/số cần thẳng cột | ui-monospace; số dùng tabular-nums khi phù hợp |
| Cover heading | 52px, line-height1.15, weight700 |
| Slide heading | 32px, line-height1.28, weight700 |
| Section/subheading | 20–24px, weight600 |
| Body | 15–20px theo bảng/diagram; phần giải thích dài ở notes |
| Caption/chart label | 11–16px; không dùng metadata nhỏ để chứa luận điểm chính |
| Footer/page number | 10px, metadata phụ |
| Safe margin | 52px ngang,34px trên,26px dưới |
| Grid gap | 18px giữa header/title/content/footer; nhóm12–24px |
| Spacing scale | 4, 8, 12, 16, 24, 32, 40, 48, 56, 64px |
| Panel radius | 24px; card nhỏ 16px; control 12px |

Font Be Vietnam Pro đã được human duyệt, lưu local trong assets/fonts/ (400/600/700 + OFL). Nếu dùng fallback, kiểm lại xuống dòng và chiều cao. Tiếng Việt phải có đầy đủ dấu. Không thu nhỏ chữ liên tục để nhét nội dung: ưu tiên rút gọn, chuyển ghi chú người thuyết trình hoặc tách slide theo nội dung được duyệt.

Slide nền tảng: 16:9, 1280 × 720 theo presentation hiện có; scale toàn stage khi viewport nhỏ, không để toolbar che nội dung. Reading/print mode có bố cục đọc riêng, không cắt mất nội dung để giữ tỷ lệ slide.

## 5. Component rules

| Component | Quy tắc |
|---|---|
| Navigation/toolbar | Nền sáng, active violet, controls có nhãn; không tạo sidebar ứng dụng không liên quan |
| Card/panel | White, border lavender, shadow nhẹ; không mọi card đều glow |
| Primary button | Violet với nhãn tương phản đủ; hover/pressed/focus-visible phân biệt |
| Secondary button | Nền sáng, chữ tối/violet, border rõ |
| Disabled | Có trạng thái disabled thật, giảm nhấn; không chỉ đổi màu khiến vẫn bấm được |
| Tabs/page dots | Active có thêm hình/underline/aria state, không chỉ màu |
| Inputs nếu có | Label rõ, focus ring, lỗi bằng text; không tự thêm form sản phẩm |
| Dataset/model badge | Tên trạng thái text; AI identity violet, status semantic dùng đúng màu |
| Training progress | %/epoch chỉ khi có dữ liệu thật; minh họa phải gắn nhãn |
| Scientific table | Header rõ, số thẳng cột, đơn vị tại header, nền ít hiệu ứng |

### Semantic colors — vai trò Confirmed, hex Proposed

| Vai trò | Hex đề xuất | Ghi chú |
|---|---|---|
| Success | #15803D | Xanh lá, có text/icon nghĩa rõ |
| Warning | #A16207 | Amber, không nhầm accent thương hiệu |
| Error | #B91C1C | Đỏ, có thông báo nguyên nhân |
| Information | #1D4ED8 | Xanh dương |
| AI/Neural | #7A2CFF | Violet là nhận diện AI, không đồng nghĩa thành công |

Không dùng màu làm phương tiện duy nhất để truyền trạng thái. Body text không dùng soft-purple/electric-purple trên nền nhạt khi chưa kiểm contrast.

## 6. Data visualization — Proposed mapping

| Series | Màu | Cách phân biệt thêm |
|---|---|---|
| Actual | #211335 | Nét liền, nhãn Actual |
| LSTM | #7A2CFF | Nét liền, nhãn LSTM |
| CNN | #1D4ED8 | Nét đứt, nhãn CNN |
| Linear Regression | #716B7D | Nét chấm/gạch khác, nhãn LR |
| ARIMA | #A16207 | Nét dash-dot, nhãn ARIMA |

Màu ngoài tím dành cho phân biệt dữ liệu/semantic, không thay nhận diện chính. Khi chart quá nhiều series, tách panel hoặc dùng direct labels; không gom mọi series thành các sắc tím khó phân biệt.

- Trục có tên/đơn vị: Close USD, Epoch, Forecast Step, MAE/RMSE USD, MAPE %, v.v.
- Actual/predicted khớp target date và cùng đơn vị, dựa hợp đồng DEFINE.
- Future region chưa có actual phải được phân biệt; không vẽ actual giả.
- Số liệu minh họa phải ghi rõ “Minh họa — chưa phải kết quả thực nghiệm”. Không dùng số giả để chứng minh mô hình tốt hơn baseline.
- Không tự vẽ confidence band nếu chưa có phương pháp ước lượng được duyệt.
- Không glow/blur trên nét dữ liệu, tick labels hoặc legend. Không dùng trục méo để làm nổi ưu thế.
- Dùng nền trắng, grid nhẹ; giữ contrast đường chart và labels khi trình chiếu.

## 7. HTML slide guidelines

Đây là hướng thị giác, không chốt thêm nội dung khoa học/số slide:

| Kiểu slide | Hướng bố cục |
|---|---|
| Cover | Stock Forecasting và câu chủ đề lớn, một hình chuỗi giá/neural layers tím, nhiều khoảng thở |
| Problem / mục tiêu | Một luận điểm chính; ví dụ forecast window rõ hơn paragraph dài |
| Data | Dataset facts có nguồn/trạng thái; hình 60 phiên input → 1/5 phiên output |
| Architecture / dataflow | Sơ đồ Python/module đúng DESIGN, split trước EDA, human gate thấy rõ |
| Models | So sánh trách nhiệm/shape/luồng, tránh liệt kê tất cả code trên slide |
| Evaluation | Chart/table đọc được, metrics và baseline đúng DEFINE, nhãn chưa chạy khi cần |
| Milestones / risks | Ít dòng, thứ tự phụ thuộc và tình trạng thực tế; không đánh dấu done giả |
| Closing | Kết luận có bằng chứng hoặc mục tiêu dự kiến, không hứa lợi nhuận |

Giữ các chức năng hiện có như next/previous, keyboard navigation, notes, timer, fullscreen, reading mode khi redesign presentation. Hiệu ứng nên ngắn, nhẹ, không lặp liên tục cạnh biểu đồ/đoạn chữ. Tôn trọng prefers-reduced-motion; nội dung luôn đọc được khi animation tắt. Không thêm GSAP/animation dependency chỉ để đổi theme.

## 8. CSS tokens — bản đề xuất triển khai

Các hex palette/gradient stops kế thừa Confirmed ở mục 3. Các alias, semantic hex và kích thước là Proposed từ mục 4–6. Đây là snippet tham chiếu, chưa được áp dụng vào CSS sản phẩm.

```css
:root {
  color-scheme: light;
  --sv-violet: #7A2CFF;
  --sv-electric: #B84DFF;
  --sv-soft-purple: #E097FF;
  --sv-lavender: #E3CFFF;
  --sv-light-lavender: #FAF7FF;
  --sv-white: #FFFFFF;
  --sv-deep-purple: #160A29;
  --sv-dark-purple: #211335;
  --sv-text: #111111;
  --sv-muted: #716B7D;
  --sv-border: #EAE3F5;
  --sv-section: #F4EEFF;

  --sv-bg: var(--sv-light-lavender);
  --sv-surface: var(--sv-white);
  --sv-accent: var(--sv-violet);
  --sv-success: #15803D;
  --sv-warning: #A16207;
  --sv-error: #B91C1C;
  --sv-info: #1D4ED8;
  --sv-focus: #7A2CFF;

  --sv-gradient-primary: linear-gradient(135deg, #7A2CFF, #B84DFF);
  --sv-gradient-soft: linear-gradient(135deg, #B84DFF, #E097FF, #FAF7FF);
  --sv-gradient-atmospheric: linear-gradient(135deg, #160A29, #7A2CFF, #B84DFF);
  --sv-font-heading: "Be Vietnam Pro", system-ui, sans-serif;
  --sv-font-body: "Be Vietnam Pro", system-ui, sans-serif;
  --sv-font-code: ui-monospace, SFMono-Regular, Consolas, monospace;
  --sv-type-cover: 52px;
  --sv-type-heading: 32px;
  --sv-type-subheading: 24px;
  --sv-type-body: 17px;
  --sv-type-caption: 13px;
  --sv-type-footer: 10px;
  --sv-space-1: 4px;
  --sv-space-2: 8px;
  --sv-space-3: 12px;
  --sv-space-4: 16px;
  --sv-space-6: 24px;
  --sv-space-8: 32px;
  --sv-space-10: 40px;
  --sv-space-12: 48px;
  --sv-space-14: 56px;
  --sv-space-16: 64px;
  --sv-slide-width: 1280px;
  --sv-slide-height: 720px;
  --sv-safe-x: 52px;
  --sv-safe-y: 34px;
  --sv-gap: 18px;
  --sv-radius-panel: 24px;
  --sv-radius-card: 16px;
  --sv-radius-control: 12px;
  --sv-shadow-panel: 0 12px 36px rgb(22 10 41 / 6%);
  --sv-glow: 0 0 40px rgb(122 44 255 / 10%);
  --sv-motion-duration: 240ms;
  --sv-motion-easing: cubic-bezier(0.22, 1, 0.36, 1);
  --sv-chart-actual: #211335;
  --sv-chart-lstm: #7A2CFF;
  --sv-chart-cnn: #1D4ED8;
  --sv-chart-lr: #716B7D;
  --sv-chart-arima: #A16207;
}
```

Nếu presentation cũ dùng --ink/--teal/--orange, map sang role tương ứng khi triển khai; không replace màu mù vì màu có thể mang semantic/series khác nhau. Không ghi đè CSS bằng snippet mà bỏ styles/layout/control hiện có.

## 9. Consistency và review

- Trước làm slide: đọc file này, DEFINE/DESIGN liên quan, kiểm nội dung và trạng thái thí nghiệm.
- Không tự đổi palette, typography hoặc token theo từng slide. Lựa chọn mới cần giải thích và cập nhật tài liệu sau khi duyệt.
- Được thay bố cục theo nội dung, nhưng dùng cùng spacing, màu role, chữ và labels.
- Kiểm contrast thực tế: mục tiêu 4.5:1 cho chữ thường và 3:1 cho chữ lớn; controls/đồ họa cần tương phản phù hợp. Chưa claim đạt accessibility chỉ từ palette.
- Mở từng slide trên trình duyệt: không overflow/cắt chữ, glyph tiếng Việt đúng, chart đọc được, notes/toolbar không che nội dung.
- Kiểm next/previous, phím tắt, fullscreen, timer, notes, reading/print và reduced motion sau thay đổi.
- Rà số liệu/diagram với DEFINE/DESIGN, phân biệt minh họa với evidence, không đổi nội dung khoa học để khớp hình đẹp.
- Dùng patch/edit, cập nhật tracking, mở diff; không tự commit/push hoặc sửa source mô hình khi chỉ làm slide.

**Trạng thái hiện tại:** HTML tại `presentaition-HTML/index.html` đã được thiết kế lại10 slide theo human review. Các thông số bảng cũ là điểm khởi đầu; override đã duyệt dưới đây là nguồn hiện hành.


## 10. Override sau human review — 2026-11-13

- Tên cover: **Stock Price Forecasting For Deep Learning**. Tiêu đề phụ: **Dự báo giá cổ phiếu, thực nghiệm trên NVIDIA (NVDA).**
- Font thống nhất: **Be Vietnam Pro**, font local Regular400/SemiBold600/Bold700; không cần Google Fonts request lúc trình chiếu.
- Grid1280×720: padding34px trên,52px ngang,26px dưới; hàng header28px/title96px/content co giãn/footer24px, gap18px. Cover không dùng title-row riêng.
- Cover52px; H2=32px; subtitle16px; nội dung bảng15–17px, diagram labels11–16px. Metadata nhỏ không mang luận điểm chính. Ưu tiên hình giải thích, không thêm chữ để lấp chỗ trống.
- Title/header/footer giữ cùng tọa độ trên các slide2–10; không căn giữa nội dung dọc tùy ý.
- LaTeX render bằng MathJax3.2.2 SVG local; không dùng ảnh chụp công thức hoặc mã LaTeX thô.
- Visuals: cover có hình SVG dữ liệu→mạng→5 đầu ra; timeline cho input/target; pipeline cho preprocessing; lane cho mạng; layer map cho architecture; contract table cho modules; matrix/protocol cho evaluation.
- Các series/chart chỉ khi có dữ liệu thực. Hình cover ghi “Minh họa khái niệm”, không phải forecast NVDA thật.
- Skill System Design dùng làm nguồn tham khảo tổ chức hệ thống/contracts; chuyển đổi HTML theo deviation human đã duyệt. Không claim clone fidelity DOCX.
