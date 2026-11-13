# DEFINE: ĐẶC TẢ BÀI TOÁN & YÊU CẦU DỰ ÁN

Tài liệu xác định bài toán, đối tượng sử dụng, tính năng và tiêu chí thành công cho đề tài dự đoán giá cổ phiếu.

---

## 1. Project Name (Tên dự án)
- **Tên chính thức**: Multi-Step Stock Price Forecasting with Deep Learning.
- **Tên mô tả**: Xây dựng mô hình Học sâu Dự đoán Giá Cổ phiếu NVIDIA (`NVDA`) Đa bước.
- **Mã cổ phiếu mục tiêu**: `NVDA` (NVIDIA Corporation - Sàn NASDAQ).
- **Loại bài toán**: Hồi quy chuỗi thời gian đa bước (Multi-step Time-Series Regression).

---

## 2. Problem (Vấn đề cần giải quyết)
1. **Biến động giật cục & Tính chất phi tuyến**: Cổ phiếu công nghệ như NVIDIA (`NVDA`) là tâm điểm của làn sóng AI toàn cầu. Giá cổ phiếu biến động rất nhanh, chịu ảnh hưởng lớn từ tin tức công nghệ và các kỳ báo cáo tài chính (Earnings), tạo ra các bước nhảy giá (Price Gaps) đột ngột mà các mô hình toán học đường thẳng không thể giải thích được.
2. **Dự đoán 1 ngày ($t+1$) là không đủ**: Dự đoán giá ngày mai tăng hay giảm quá ngắn, không đủ thời gian để nhà đầu tư lên kế hoạch quản trị rủi ro hoặc xây dựng chiến lược giao dịch ngắn hạn theo tuần.
3. **Giới hạn của các công cụ truyền thống**: Các phương pháp thống kê cổ điển (như trung bình động MA, hồi quy tuyến tính Linear Regression hay ARIMA) chỉ học tốt quan hệ tuyến tính, gặp rất nhiều khó khăn khi bắt các quy luật uốn lượn phi tuyến và tương quan dài hạn của chuỗi giá.

---

## 3. Target User (Đối tượng sử dụng & Kỳ vọng Vào/Ra)

### Ai là người sử dụng?
- **Nhà đầu tư cá nhân / Người lướt sóng (Swing Trader)**: Cần biết dải giá kỳ vọng trong 5 ngày tới để đặt các mức chốt lời (Take-profit) và cắt lỗ (Stop-loss) hợp lý.
- **Chuyên viên định lượng (Quant Analyst)**: Cần một pipeline dự báo chuẩn mực, không rò rỉ dữ liệu để làm tín hiệu (signal) cho các thuật toán giao dịch tự động.

### Hợp đồng Vào / Ra (Input & Output):
- **Đầu vào (Input)**:
  - Mã cổ phiếu: `NVDA`.
  - Chuỗi dữ liệu lịch sử của **60 ngày giao dịch gần nhất** ($L = 60$, tương đương khoảng 3 tháng), lấy theo giá đóng cửa (`Close`).
- **Đầu ra (Output)**:
  - Vector gồm **5 giá trị giá đóng cửa liên tiếp cho 5 ngày làm việc tiếp theo** ($t+1, t+2, t+3, t+4, t+5$) theo đơn vị USD.
  - Biểu đồ trực quan so sánh dải giá dự đoán với giá thực tế.
  - Bảng chỉ số sai số ước tính và dự báo xu hướng giá (Tăng / Giảm).

---

## 4. Core Features (Tính năng cốt lõi)
1. **Tự động tải & Lưu đệm dữ liệu (Auto Ingestion & Cache)**: Kéo nến ngày lịch sử từ Yahoo Finance qua thư viện `yfinance`, tự động lưu file CSV cục bộ để chạy offline mà không sợ lỗi mạng.
2. **Cắt lát dữ liệu chuỗi trượt (Sliding Window Generation)**: Tự động chia chuỗi giá thành từng cặp: 60 ngày quá khứ làm đầu vào ($X$) và 5 ngày kế tiếp làm nhãn mục tiêu ($Y$).
3. **Dự báo đa bước đồng thời (Direct Multi-Step Output)**: Mô hình xuất ra toàn bộ 5 ngày tương lai cùng lúc trong 1 lần tính toán, tránh việc lấy kết quả ngày 1 đoán tiếp ngày 2 gây tích lũy sai số dây chuyền.
4. **Đấu trường so sánh 4 mô hình (Model Benchmark)**:
   - *Baseline 1*: Linear Regression (Mốc tối thiểu kiểm tra tính phi tuyến).
   - *Baseline 2*: ARIMA (Mốc thống kê chuỗi thời gian chuẩn học thuật).
   - *Core Model 1*: Vanilla LSTM (Mạng nơ-ron có cổng nhớ, bắt phụ thuộc tuần tự dài hạn).
   - *Core Model 2*: 1D-CNN (Mạng tích chập 1 chiều, quét nhanh các mẫu hình biến động cục bộ).
5. **Đánh giá & Chẩn đoán sai số minh bạch**: Tự động tính các chỉ số đo lường độ lệch tiền thực tế (USD) và tỷ lệ đoán đúng xu hướng giá.

---

## 5. Tech Constraints (Ràng buộc kỹ thuật & Kỷ luật bất biến)
Để kết quả nghiên cứu hoàn toàn trung thực và dùng được trong thực tế, dự án tuân thủ nghiêm ngặt 4 kỷ luật:
- **Tuyệt đối không rò rỉ dữ liệu tương lai (No Data Leakage)**: Phân chia tập dữ liệu tuần tự theo thời gian: **70% ngày cũ làm tập Học (Train) $\to$ 15% ngày sau đó làm tập Căn chỉnh (Validation) $\to$ 15% ngày mới nhất làm tập Thi cử (Test)**. Tuyệt đối **cấm xáo trộn (no shuffle)**.
- **Kỷ luật chuẩn hóa độc lập (Strict Scaler)**: Bộ ép tỉ lệ giá (`MinMaxScaler`) chỉ được học giá trị Min và Max trên tập Train. Tập Validation và Test chỉ dùng lại thước đo này, cấm nhìn lén dữ liệu tương lai.
- **Tôn trọng lịch giao dịch sàn NASDAQ**: Bỏ qua các ngày thứ Bảy, Chủ Nhật và ngày lễ của Mỹ. Tuyệt đối không tự ý nội suy sinh giá ma cho những ngày sàn đóng cửa.
- **Môi trường & Công nghệ**: Viết bằng Python $\ge 3.10$, mô hình học sâu cài đặt bằng PyTorch.

---

## 6. Evaluation Criteria (Tiêu chuẩn nghiệm thu thành công)
Mô hình được nghiệm thu khi vượt qua các bài kiểm định số liệu trên tập Test (dữ liệu mới nhất chưa từng học):

| Tiêu chí | Chỉ số đo | Ngưỡng đạt yêu cầu | Diễn giải ý nghĩa |
| :--- | :--- | :---: | :--- |
| **Sai số phần trăm** | **MAPE (%)** | **$\le 3 - 5\%$** | Trung bình sai lệch không quá 3 đến 5% so với giá thực tế. |
| **Độ khớp xu hướng** | **$R^2$ Score** | **$> 0.85$** | Giải thích được trên 85% mức độ biến động của chuỗi giá. |
| **Đoán đúng chiều** | **Directional Accuracy** | **$> 55\%$** | Tỷ lệ đoán đúng chiều tăng/giảm giá ngày mai so với hôm nay phải tốt hơn tung đồng xu 50/50. |
| **Sai lệch tiền mặt** | **RMSE & MAE** | Thấp hơn Baseline | Sai lệch tính bằng USD của LSTM và 1D-CNN phải tốt hơn rõ rệt so với Linear Regression và ARIMA. |
| **Tính trung thực** | **Artifact Log** | $100\%$ số liệu thực | Tất cả số liệu phải xuất ra từ file log chạy code thật trong `outputs/runs/`, tuyệt đối cấm bịa số. |
