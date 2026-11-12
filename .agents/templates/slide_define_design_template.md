# Template Trình Bày Slide — Phần Bài Toán và Thiết Kế Tổng Thể (Define & Design Problem)

> **Mục đích**: Cung cấp khung cấu trúc chuẩn cho bài thuyết trình (Slide Deck) bảo vệ đề cương, báo cáo giữa kỳ hoặc thuyết trình giải pháp kỹ thuật.  
> **Định dạng**: Tương thích với trình render Markdown (Marp, Slidev) hoặc dễ dàng sao chép sang PowerPoint, Google Slides, Canva.  
> **Quy chuẩn nội dung**: Ngắn gọn, tập trung vào sơ đồ/bảng số liệu, mỗi slide đi kèm đề xuất bố cục trực quan (*Visual Layout*) và lời thoại gợi ý (*Presenter Notes*).

---

<!-- slide -->
## Slide 1: Bìa Báo Cáo (Title Slide)
- **Tiêu đề lớn**: DỰ ĐOÁN GIÁ CỔ PHIẾU ĐA BƯỚC VỚI HỌC SÂU (MULTI-STEP STOCK FORECASTING)
- **Tiêu đề phụ**: Thực nghiệm trên chuỗi thời gian cổ phiếu NVIDIA (`NVDA` - NASDAQ) với mô hình LSTM và 1D-CNN
- **Thông tin**:
  - Người thực hiện / Nhóm nghiên cứu: `[Tên thành viên]`
  - Giảng viên / Người hướng dẫn: `[Tên GVHD]`
  - Ngày báo cáo: `[Ngày / Tháng / Năm]`

> **Visual Layout**: Bố cục nền tối hoặc tối giản (Minimalist Corporate), logo trường/công ty ở góc trên, biểu đồ nến mờ ở background.  
> **Presenter Notes**: *"Kính chào thầy cô và các bạn, hôm nay nhóm xin phép trình bày về đề tài nghiên cứu và xây dựng pipeline học sâu dự đoán giá cổ phiếu đa bước cho mã NVIDIA (NVDA)..."*

---

<!-- slide -->
## Slide 2: Bối Cảnh Thị Trường & Động Lực Nghiên Cứu (Motivation)
- **Thực trạng**: Cổ phiếu NVIDIA (`NVDA`) là trung tâm của làn sóng bán dẫn & Trí tuệ Nhân tạo toàn cầu, thanh khoản khổng lồ và biên độ dao động cực mạnh.
- **Nỗi đau (Pain Point)**:
  - Sự bùng nổ của tin tức công nghệ và các chu kỳ báo cáo tài chính tạo ra các bước nhảy giá (gaps) phi tuyến khó lường.
  - Dự đoán đơn bước ($t+1$) không đáp ứng được nhu cầu nắm bắt chuỗi biến động theo tuần làm việc.
  - Các phương pháp thống kê cổ điển (ARIMA, MA) kém linh hoạt trước các pha biến động phi tuyến tính mạnh mẽ.
- **Mục tiêu cốt lõi**: Xây dựng mô hình học sâu có khả năng dự đoán dải giá liên tục trong 5 ngày tiếp theo ($k = 5$) với sai số thấp và độ chính xác xu hướng tin cậy.

> **Visual Layout**: 2 cột — Cột trái: 3 gạch đầu dòng ngắn gọn; Cột phải: Đồ thị biến động giá NVDA minh họa sự bùng nổ xu hướng.  
> **Presenter Notes**: *"NVIDIA hiện là một trong những mã cổ phiếu có tính thanh khoản và biến động cao nhất thế giới. Dự đoán dải giá 5 ngày tiếp theo cho NVDA là một bài toán đầy thử thách và có giá trị thực tiễn rất lớn..."*

---

<!-- slide -->
## Slide 3: Người Dùng & Bài Toán Nghiệp Vụ (User & Problem Scope)
- **Đối tượng sử dụng**:
  - Nhà đầu tư cá nhân & Quỹ đầu tư: Hỗ trợ ước lượng dải giá kỳ vọng và quản trị rủi ro biến động ngắn hạn.
  - Chuyên viên định lượng (Quant Analyst): Tích hợp làm tín hiệu (signal) cho chiến lược giao dịch tự động.
- **Phạm vi bài toán**:
  - **Mã cổ phiếu mục tiêu**: `NVDA` (NVIDIA Corporation - Sàn NASDAQ).
  - **Khung thời gian**: Dữ liệu nến ngày (`1d`) trong 5 năm gần nhất từ Yahoo Finance (USD).
  - **Biến mục tiêu**: Giá đóng cửa (`Close`).

> **Visual Layout**: 2 cards song song: [Thẻ Đối Tượng Người Dùng] và [Thẻ Phạm Vi Dữ Liệu].  
> **Presenter Notes**: *"Đề tài tập trung toàn bộ dữ liệu 5 năm gần nhất của NVIDIA từ Yahoo Finance, với mục tiêu dự đoán giá Close đa bước."*

---

<!-- slide -->
## Slide 4: Hợp Đồng Dữ Liệu & Bài Toán Toán Học (Problem Formulation & Tensor Contract)
- **Dạng bài toán**: Hồi quy chuỗi thời gian đa bước (Multi-step Time-series Regression).
- **Cửa sổ trượt (Sliding Window Contract)**:
  - **Input Tensor ($X$)**: $\mathbf{X} \in \mathbb{R}^{B \times L \times F}$
    - $L = 60$ (Lookback window — quan sát 60 ngày giao dịch trước đó $\approx 3$ tháng).
    - $F = 1$ (Biến Close, hỗ trợ mở rộng sang đa biến OHLCV).
  - **Target Tensor ($Y$)**: $\mathbf{Y} \in \mathbb{R}^{B \times k}$
    - $k = 5$ (Horizon — dự báo giá đóng cửa từ ngày $t+1$ đến $t+5$).
- **Hàm tối ưu**: $f_\theta: \mathbb{R}^{60 \times 1} \to \mathbb{R}^5$ với tham số $\theta$ được học qua Mean Squared Error (MSE) hoặc Huber Loss.

> **Visual Layout**: Sơ đồ trực quan minh họa Cửa sổ quá khứ 60 ngày trượt sang Dải dự đoán 5 ngày tương lai.  
> **Presenter Notes**: *"Chúng tôi cụ thể hóa bài toán bằng hợp đồng tensor: sử dụng 60 bước quá khứ làm đầu vào để dự phóng một vector 5 chiều đại diện cho 5 ngày liên tiếp..."*

---

<!-- slide -->
## Slide 5: Kỷ Luật Dữ Liệu & Chống Rò Rỉ (Anti-Leakage Discipline)
- **Nguyên tắc "No Data Leakage" (Bắt buộc trong Time-Series)**:
  - **Phân chia theo thời gian (Time-based split)**: 70% Train, 15% Validation, 15% Test. Tuyệt đối **không xáo trộn (no shuffle)** để loại trừ thiên kiến nhìn trước tương lai (Lookahead bias).
  - **Kỷ luật chuẩn hóa (Strict Scaling)**: `MinMaxScaler` chỉ học `fit` trên tập Train; tập Val và Test chỉ áp dụng `transform`.
  - **Không nội suy giá ma**: Ngày nghỉ lễ/cuối tuần được xử lý theo lịch giao dịch thực tế sàn HOSE.

```text
[------------- 70% Train -------------] [--- 15% Val ---] [--- 15% Test ---]
  (Scaler FIT & LEARN ở đây)              (CHỈ TRANSFORM)   (CHỈ TRANSFORM)
  --------------------------------- Trục Thời Gian ------------------------>
```

> **Visual Layout**: Sơ đồ phân chia trục thời gian 3 đoạn rõ ràng, kèm icon ổ khóa bảo vệ ở tập Validation và Test.  
> **Presenter Notes**: *"Một trong những rủi ro lớn nhất của dự đoán chuỗi thời gian là rò rỉ dữ liệu. Chúng tôi áp dụng quy chuẩn nghiêm ngặt: chỉ fit scaler trên train và chia tập theo thời gian tuần tự."*

---

<!-- slide -->
## Slide 6: Kiến Trúc Hệ Thống Tổng Thể (System Architecture)
- **Pipeline 5 giai đoạn liên hoàn**:
  1. **Data Ingestion**: Gọi API Yahoo Finance, cache dữ liệu cục bộ CSV (`data/raw/`).
  2. **Preprocessing**: Khử khuyết, scale MinMax, cắt sliding window $L=60, k=5$.
  3. **Modeling**: DataLoader PyTorch truyền batch vào các mô hình đối chứng và học sâu.
  4. **Evaluation Engine**: Nghịch đảo scale (Inverse transform), tính toán bộ 5 metrics.
  5. **Reporting**: Tự động lưu log số liệu và trực quan hóa vào `walkthrough.md`.

> **Visual Layout**: Flowchart ngang (Mermaid diagram) thể hiện 5 khối hộp từ Dữ liệu thô $\to$ Tiền xử lý $\to$ Mô hình $\to$ Đánh giá $\to$ Báo cáo.  
> **Presenter Notes**: *"Kiến trúc toàn pipeline được module hóa rõ ràng, từ nạp dữ liệu, tiền xử lý, huấn luyện đến đánh giá và xuất báo cáo tự động."*

---

<!-- slide -->
## Slide 7: Thiết Kế So Sánh & Mô Hình Đối Chứng (Experimental Design)
- **Thiết kế so sánh đối chứng 4 chiều**:

| Nhóm | Mô hình | Vai trò | Điểm mạnh kỳ vọng |
| :--- | :--- | :--- | :--- |
| **Statistical Baseline** | **Linear Regression** | ML mốc tối thiểu | Nhanh, trực quan, kiểm tra tính phi tuyến |
| **Statistical Baseline** | **ARIMA $(p, d, q)$** | Chuẩn học thuật kinh điển | Bắt xu hướng và tự tương quan chuỗi đơn biến |
| **Deep Learning (Core)** | **Vanilla LSTM** | Mô hình lõi chuỗi | Bắt phụ thuộc dài hạn qua các cổng nhớ (Gates) |
| **Deep Learning (Core)** | **1D-CNN** | Mô hình lõi không gian | Trích xuất mẫu hình cục bộ, tốc độ train vượt trội |

> **Visual Layout**: Bảng so sánh 4 dòng làm nổi bật sự đối lập giữa Baseline Thống kê vs Deep Learning.  
> **Presenter Notes**: *"Để chứng minh giá trị của Deep Learning, chúng tôi thiết kế so sánh song song với 2 baseline: Linear Regression và ARIMA cổ điển trước khi so sánh LSTM và 1D-CNN."*

---

<!-- slide -->
## Slide 8: Bộ Chỉ Số Đo Lường & Tiêu Chí Nghiệm Thu (Evaluation & Acceptance Criteria)
- **Chỉ số sai số biên độ (Magnitude Error)**:
  - **RMSE** (VNĐ): Đo lường độ lệch chuẩn phần dư, phạt nặng sai số đột biến.
  - **MAE** (VNĐ): Đo độ lệch giá trung bình thực tế dễ diễn giải cho nhà đầu tư.
  - **MAPE** (%): Sai số phần trăm tương đối; **Mục tiêu: MAPE $\le 3 - 5\%$**.
- **Chỉ số giải thích & Chiều hướng (Directional & Fit)**:
  - **$R^2$ Score**: Đo tỷ lệ phương sai chuỗi giá giải thích được; **Mục tiêu: $R^2 > 0.85$**.
  - **Directional Accuracy (DA %)**: Tỷ lệ đoán đúng chiều tăng/giảm giá; **Mục tiêu: DA $> 55\%$**.
- **Nguyên tắc số liệu**: 100% chỉ số trích xuất từ artifact log thực tế, tuyệt đối không dùng placeholder.

> **Visual Layout**: 4 ô chỉ số (Metric Cards) với biểu tượng mũi tên và ngưỡng kỳ vọng in đậm.  
> **Presenter Notes**: *"Chúng tôi không chỉ đo lường sai số khoảng giá bằng RMSE và MAPE, mà còn đặc biệt chú trọng chỉ số Directional Accuracy — yếu tố quyết định khả năng sinh lời trong thực tế."*

---

<!-- slide -->
## Slide 9: Kế Hoạch Triển Khai & Quản Trị Rủi Ro (Roadmap & Risk Management)
- **Kế hoạch 3 tuần (Tuân thủ mô tả đề tài)**:
  - **Tuần 1**: Hoàn thiện EDA, chống rò rỉ dữ liệu, dựng baseline LR & ARIMA, kiểm thử TDD.
  - **Tuần 2**: Huấn luyện LSTM & 1D-CNN, tối ưu siêu tham số, phân tích hội tụ.
  - **Tuần 3**: Đánh giá toàn diện, phân tích phần dư, đóng gói báo cáo và demo.
- **Rủi ro & Phương án dự phòng**:
  - *Rủi ro API yfinance bị chặn/lỗi mạng*: Cơ chế cache cục bộ CSV tự động.
  - *Rủi ro mô hình bị Overfitting*: Áp dụng Early Stopping (`patience=10`), Dropout $0.2$, AdamW weight decay.

> **Visual Layout**: Timeline ngang 3 chặng kèm bảng ma trận rủi ro nhỏ gọn.  
> **Presenter Notes**: *"Kế hoạch triển khai được chia làm 3 tuần rõ ràng, đi kèm kịch bản dự phòng đầy đủ cho rủi ro ngắt mạng API và hiện tượng overfitting."*

---

<!-- slide -->
## Slide 10: Tóm Tắt & Hỏi Đáp (Summary & Q&A)
- **Tóm tắt 3 thông điệp chính**:
  1. Đề tài giải quyết bài toán dự báo đa bước 5 ngày thực tiễn cho cổ phiếu NVIDIA (`NVDA`).
  2. Quy trình dữ liệu chuẩn mực, loại bỏ 100% rò rỉ thông tin (No Leakage).
  3. So sánh công bằng giữa Baseline thống kê và 2 kiến trúc học sâu (LSTM vs 1D-CNN).
- **Sẵn sàng nhận câu hỏi đóng góp từ Hội đồng / Giảng viên**.

> **Visual Layout**: 3 bullet to rõ ràng, chữ "Cảm ơn & Hỏi đáp (Q&A)" nổi bật kèm thông tin liên hệ/repo GitHub.  
> **Presenter Notes**: *"Xin chân thành cảm ơn thầy cô và các bạn đã lắng nghe. Nhóm rất mong nhận được những góp ý để hoàn thiện đề tài trong các tuần tiếp theo."*
