---
marp: true
paginate: true
theme: gaia
_class: lead
backgroundColor: #f4f7f3
color: #102733
---

## DEFINE / 01 · TÊN ĐỀ TÀI & VẤN ĐỀ

# Dự báo giá cổ phiếu NVDA
**Multi-Step Stock Price Forecasting với LSTM & 1D-CNN**

### Vấn đề cần giải quyết
- Cổ phiếu NVDA biến động phi tuyến cực mạnh theo làn sóng AI bán dẫn.
- Dự đoán 1 ngày ($t+1$) là quá ngắn, không đủ để nhà đầu tư lập kế hoạch giao dịch theo tuần.
- Các công thức toán học đường thẳng truyền thống (Linear, MA) bị đuối sức.

### Mục tiêu cụ thể
- Nhận diện 60 ngày giá Close quá khứ $\to$ Dự báo đồng thời 5 ngày giá đóng cửa kế tiếp (USD).
- Đấu trường 4 mô hình: So sánh trực diện Baseline (LR, ARIMA) vs Deep Learning (LSTM, 1D-CNN).

<!-- 25 giây. Lời nói: Kính chào thầy cô và hội đồng. Tên đề tài là dự đoán giá cổ phiếu đa bước trên mã NVIDIA (NVDA). Vấn đề là cổ phiếu NVDA biến động rất mạnh theo làn sóng AI; dự đoán một ngày không đủ để lập kế hoạch tuần, còn các công thức đường thẳng truyền thống thì không bắt được tính phi tuyến. Mục tiêu là dùng 60 ngày quá khứ dự báo đồng thời 5 ngày tiếp theo. -->

---

## DEFINE / 02 · NGƯỜI DÙNG & HỢP ĐỒNG VÀO / RA

# Đúng người dùng · Rõ Vào / Ra

### Đối tượng sử dụng
- **Nhà đầu tư cá nhân (lướt sóng ngắn hạn)**: Cần dải giá kỳ vọng để đặt lệnh Take-profit / Stop-loss.
- **Chuyên viên định lượng (Quant Analyst)**: Cần pipeline chuẩn mực làm tín hiệu giao dịch.

### Hợp đồng Vào / Ra (Input & Output)
- **Đầu vào (Input)**: 60 ngày giá đóng cửa (`Close`) gần nhất của NVDA.
- **Xử lý (Process)**: Cắt cửa sổ trượt Tensor $X \in (B, 60, 1) \to Y \in (B, 5)$.
- **Đầu ra (Output)**: 5 giá đóng cửa liên tiếp tính bằng USD kèm đồ thị trực quan và xu hướng.

<!-- 35 giây. Lời nói: Người dùng là nhà đầu tư cá nhân và chuyên viên định lượng. Đầu vào là 60 ngày giá đóng cửa liên tiếp của NVDA, tương đương 3 tháng giao dịch. Đầu ra là một vector gồm đúng 5 giá đóng cửa cho 5 phiên làm việc tiếp theo bằng tiền USD, kèm biểu đồ trực quan để người dùng nhìn thấy ngay xu hướng thay vì chỉ đọc các con số rời rạc. -->

---

## DEFINE / 03 · TÍNH NĂNG CƠ BẢN & MỞ RỘNG

# Phân tầng tính năng: Cơ bản & Mở rộng

### 1. Phạm vi Cơ bản (Core / Basic Scope)
1. **Dữ liệu & EDA chống rò rỉ**: Kéo nến ngày Yahoo Finance, lưu cache offline, kiểm định dừng ADF, split 70/15/15.
2. **LSTM 1-Step & Đối chứng Baseline**: Dự báo phiên kế tiếp ($t+1$) bằng LSTM, so sánh sòng phẳng với Linear Regression và ARIMA(5,1,0).
3. **Optuna Tuning trên Kaggle GPU**: Tự động hóa tìm kiếm siêu tham số với TPE Sampler và cơ chế tỉa sớm MedianPruner.
4. **Bảng chấm điểm USD minh bạch**: Đo sai số giá thực tế ($MAE, RMSE, MAPE, R^2$) và tỷ lệ đoán đúng hướng giá ($DA$).

### 2. Phạm vi Mở rộng chuyên sâu (Extended Research Scope)
5. **Dự báo đa bước 5 ngày ($t+1 \dots t+5$)**: Thực nghiệm so sánh 2 chiến lược **Recursive** (tự hồi quy) vs **Direct Multi-Output** (xuất cùng lúc 5 ngày).
6. **Mở rộng mô hình 1D-CNN**: Mạng tích chập 1 chiều quét mẫu hình nến cục bộ so sánh toàn diện với LSTM.

<!-- 35 giây. Lời nói: Tính năng được phân định rõ hai tầng: Tầng cơ bản hoàn thành trọn vẹn pipeline chống rò rỉ, mô hình LSTM một bước cùng hai baseline, đặc biệt tích hợp sẵn Optuna tuning trên Kaggle GPU với cơ chế tỉa sớm. Tầng mở rộng chuyên sâu nâng cấp lên bài toán đa bước 5 ngày so sánh giữa Recursive và Direct, đồng thời bổ sung kiến trúc 1D-CNN để lấy điểm nghiên cứu tối đa. -->

---

## DEFINE / 04 · RÀNG BUỘC KỸ THUẬT & TIÊU CHUẨN THÀNH CÔNG

# Kỷ luật kỹ thuật & Tiêu chuẩn nghiệm thu

### Kỷ luật chống rò rỉ dữ liệu (No Data Leakage)
- Chia thời gian tuần tự: **70% Train $\to$ 15% Validation $\to$ 15% Test** (Cấm tuyệt đối lệnh shuffle).
- Scaler độc lập: `MinMaxScaler` **chỉ được fit trên tập Train**.
- Tôn trọng lịch sàn NASDAQ: Không tự ý nội suy sinh giá ma ngày nghỉ lễ.

### Tiêu chuẩn nghiệm thu thành công (Test Set)
- **MAPE $\le 3 - 5\%$**: Sai lệch phần trăm dưới 5%.
- **$R^2 > 0.85$**: Độ khớp xu hướng giải thích trên 85% phương sai.
- **Directional Accuracy $> 55\%$**: Đoán đúng chiều tăng/giảm tốt hơn tung đồng xu 50/50.
- **100% số liệu thực**: Trích xuất trực tiếp từ run log trong `outputs/runs/`, cấm điền số ảo.

<!-- 35 giây. Lời nói: Ràng buộc kỹ thuật quan trọng nhất là chống rò rỉ dữ liệu: chia tập 70-15-15 theo thời gian không shuffle, Scaler chỉ fit trên Train. Về tiêu chí thành công, mô hình phải đạt MAPE dưới 5 phần trăm, R2 trên 0.85 và đoán đúng hướng trên 55 phần trăm. Đặc biệt, Deep Learning phải thắng Baseline trên tập Test và toàn bộ số liệu phải lấy từ file log thực tế, cấm điền số ảo. -->

---

## DESIGN / 05 · KIẾN TRÚC MÔ HÌNH ĐỐI CHỨNG

# Một hệ thống · Bốn mô hình đối chứng

### Đấu trường kiểm chứng giá trị thực tế của AI
- **Baseline 1 (Linear Regression)**: Mức sàn tối thiểu (Nếu AI không thắng nổi đường thẳng thì AI vô nghĩa).
- **Baseline 2 (ARIMA)**: Mô hình tự hồi quy sai phân cổ điển (Chuẩn học thuật kinh điển).
- **Core DL 1 (Vanilla LSTM)**: 2 tầng LSTM (hidden 64, dropout 0.2), cổng nhớ dài hạn nắm bắt xu hướng lớn.
- **Core DL 2 (1D-CNN)**: Bộ lọc tích chập 1 chiều quét nhanh các mẫu hình biến động nến cục bộ.

*Cả 4 mô hình đều nhận đầu vào 60 ngày và xuất ra 5 ngày trên cùng một tập Test độc lập.*

<!-- 35 giây. Lời nói: Kiến trúc thiết kế đấu trường 4 mô hình: hai mô hình thống kê là Linear Regression làm mức sàn và ARIMA làm chuẩn cổ điển; hai mô hình học sâu là LSTM với cổng nhớ bắt phụ thuộc tuần tự, và 1D-CNN dùng bộ lọc tích chập trích xuất mẫu hình nến cục bộ với tốc độ cao. Cả 4 mô hình đều nhận đầu vào 60 ngày và xuất ra 5 ngày trên cùng một tập Test. -->

---

## DESIGN / 06 · KIẾN TRÚC 6 LỚP THEO CLEAN ARCHITECTURE

# Tổ chức 6 lớp: Tách biệt trách nhiệm

> **Nguyên tắc Clean Architecture:** Tách biệt tuyệt đối giữa xử lý dữ liệu ($L1$), mô hình & tuning ($L2$), dự báo ($L3$) và đánh giá ($L4$) để code không bị rối và dễ kiểm thử độc lập.

```text
Stock-Forecasting/
├── config/             # L0: default_config.yaml (quản lý tham số tập trung)
├── src/
│   ├── datasets/       # L1: Thu thập, kiểm định ADF, split 70/15/15, scale, window
│   ├── models/         # L2: LSTM, LR, ARIMA, 1D-CNN
│   ├── training/       # L2: Trainer, Optuna Tuning trên Kaggle GPU, checkpoint
│   ├── predict/        # L3: Động cơ Single-step, Recursive, Direct, Backtest
│   ├── evaluation/     # L4: Tính metrics USD và xuất 9 biểu đồ (cấm import ngược L2)
│   └── utils/          # L0: Logging, IO, provenance, seed
├── notebooks/          # L5: Demo trực quan và phân tích kết quả
└── outputs/runs/       # Lưu vết tự động weights .pt, loss log, metrics CSV
```

<!-- 25 giây. Lời nói: Nhóm thiết kế hệ thống theo chuẩn Clean Architecture phân tầng 6 lớp: L0 quản lý cấu hình, L1 tiền xử lý dữ liệu, L2 mô hình và Optuna tuning, L3 động cơ suy luận, L4 đánh giá và xuất biểu đồ, và L5 là tầng giao tiếp demo. Các lớp độc lập một chiều, đảm bảo code sạch sẽ, không bị rối và cực kỳ dễ kiểm thử. -->

---

## DESIGN / 07 · LUỒNG DỮ LIỆU KHÉP KÍN

# Luồng dữ liệu: Từ API đến Báo cáo

```text
[Yahoo Finance API] ──► 1. Tải 5 năm nến ngày NVDA
         │
         ▼
[data/raw/NVDA_5y.csv] ──► 2. Lưu trữ đệm (Cache cục bộ chạy offline)
         │
         ▼
[src/data/dataset.py] ──► 3. Chia tập 70/15/15 tuần tự ──► Fit Scaler chỉ trên Train
         │
         ▼
[PyTorch DataLoader] ──► 4. Cắt trượt X (60 ngày) ➔ Y (5 ngày), Batch=32
         │
         ▼
[4 Mô Hình (LR, ARIMA, LSTM, CNN)] ──► 5. Tính toán dự báo dải giá
         │
         ▼
[outputs/runs/ & walkthrough.md] ──► 6. Inverse scale về USD ──► Xuất bảng số liệu & Đồ thị
```

<!-- 35 giây. Lời nói: Luồng dữ liệu gồm 4 chặng: bắt đầu kéo nến từ Yahoo Finance và lưu cache CSV; chặng hai chia tập thời gian và fit scaler độc lập; chặng ba cắt cửa sổ trượt đóng gói DataLoader; chặng bốn đưa vào mô hình tính toán, đổi về tiền USD và xuất báo cáo. Mọi kết quả đều sinh ra gói artifact hoàn chỉnh để ai clone về cũng tái lập được. -->

---

## DESIGN / 08 · HAI GIAI ĐOẠN VẬN HÀNH

# Huấn luyện & Dự đoán: Quy trình tách biệt

### Giai đoạn 1: Huấn Luyện (Training Phase)
1. **Sanity Check**: Ép overfit trên 1 batch nhỏ (32 mẫu) trước để loại trừ bug code.
2. **Bộ tối ưu AdamW & CosineAnnealingLR**: Điều tiết tốc độ học êm dịu, chống bẫy overfitting.
3. **Early Stopping**: Tự động ngắt cầu dao nếu sau 10 vòng mà tập Validation không cải thiện.
4. **Lưu Checkpoint**: Lưu phiên bản mô hình có val_loss thấp nhất vào `best_model.pt`.

### Giai đoạn 2: Dự Đoán (Inference Phase)
1. Nạp tệp trọng số xuất sắc nhất `best_model.pt`.
2. Đưa chuỗi 60 ngày giá gần nhất vào mô hình (chế độ `torch.no_grad()`).
3. Dùng `scaler.inverse_transform` đổi kết quả ngược về giá tiền USD.
4. Xuất bảng giá 5 ngày tiếp theo và vẽ đồ thị nối tiếp.

<!-- 35 giây. Lời nói: Hệ thống tách rõ 2 giai đoạn: Huấn luyện bắt buộc có bước Sanity check overfit trên 1 batch trước để phát hiện lỗi kiến trúc sớm, dùng AdamW và Early stopping phanh tự động khi mô hình học vẹt. Giai đoạn dự đoán chỉ nạp checkpoint tốt nhất, nhận 60 ngày gần nhất và tính toán một lượt để xuất 5 ngày giá USD mà không cần train lại. -->

---

## DESIGN / 09 · CỘT MỐC & QUẢN TRỊ RỦI RO

# Ba tuần triển khai & Giải quyết rủi ro

### Lộ trình 3 tuần (Milestones)
- **Tuần 1**: Kéo dữ liệu NVDA, lưu cache CSV, EDA kiểm định dừng ADF, dựng baseline LR và ARIMA.
- **Tuần 2**: Cài đặt LSTM & 1D-CNN, chạy Sanity check 1-batch, huấn luyện với Early Stopping.
- **Tuần 3**: Đánh giá đa bước chi tiết từng ngày ($t+1 \dots t+5$), phân tích phần dư, hoàn thiện báo cáo living doc.

### Quản trị rủi ro kỹ thuật (Tech Risks)
- **Lỗi mạng API yfinance** $\to$ Cache CSV cục bộ, chạy hoàn toàn offline.
- **Học vẹt (Overfitting)** $\to$ Tầng Dropout 0.2, Weight Decay $1e-2$, Early Stopping.
- **Tích tụ sai số đa bước** $\to$ Kiến trúc Direct Multi-Output dự báo đồng thời 5 ngày.
- **Rò rỉ dữ liệu** $\to$ Cấm shuffle, Scaler fit-on-train only.

<!-- 25 giây. Lời nói: Kế hoạch triển khai gói gọn trong 3 tuần: Tuần một làm dữ liệu, EDA và dựng baseline. Tuần hai xây dựng LSTM, 1D-CNN và huấn luyện. Tuần ba đánh giá đa bước chi tiết và đóng gói bàn giao. Bốn rủi ro lớn gồm lỗi mạng API, overfitting, tích tụ sai số và rò rỉ dữ liệu đều có giải pháp kỹ thuật phòng ngừa triệt để. -->

---

## SUMMARY / 10 · TỔNG KẾT & HỎI ĐÁP

# Tổng kết đề tài & Sẵn sàng trao đổi (Q&A)

### Ba thông điệp cốt lõi
1. **Bài toán thực tế**: Dự báo dải giá 5 ngày liên tiếp cho cổ phiếu NVDA phục vụ kế hoạch giao dịch tuần.
2. **Kỷ luật dữ liệu**: 100% không rò rỉ thông tin (No Data Leakage), scaler fit-on-train và chia tập theo thời gian.
3. **So sánh sòng phẳng**: Kiểm chứng thực tế xem Deep Learning có thắng được toán thống kê truyền thống hay không.

### Cảm ơn Thầy Cô & Hội Đồng!
*Nhóm sẵn sàng lắng nghe nhận xét và trả lời các câu hỏi phản biện.*

<!-- 20 giây. Lời nói: Tóm lại, đề tài giải quyết bài toán dự báo 5 ngày thiết thực cho NVDA, tuân thủ kỷ luật dữ liệu nghiêm ngặt và so sánh công bằng giữa thống kê với học sâu. Em xin kết thúc bài báo cáo tại đây và rất mong nhận được câu hỏi phản biện từ thầy cô. Em xin cảm ơn! -->
