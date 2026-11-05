# Báo cáo Đề tài: Dự đoán Giá Cổ phiếu Đa bước (Multi-step Stock Price Forecasting) với LSTM và CNN: Thực nghiệm trên Cổ phiếu FPT (`FPT.VN`)

Tài liệu sống duy nhất của dự án. Viết bằng văn phong học thuật, sử dụng số liệu và hình ảnh thực từ artifacts được sinh ra trong quá trình thực nghiệm.

---

## 1. Bài toán và thiết kế tổng thể

### 1.0. Đề bài và phạm vi đã thống nhất
- **Bối cảnh & Mục tiêu**: Thị trường chứng khoán Việt Nam có tính biến động cao và phi tuyến tính. Mục tiêu của đề tài là xây dựng pipeline dự đoán giá đóng cửa (`Close`) đa bước trong $k = 5$ ngày giao dịch kế tiếp dựa trên chuỗi dữ liệu lịch sử $L = 60$ ngày (Lookback window) của cổ phiếu FPT (`FPT.VN`).
- **Phạm vi phương pháp**:
  - Bài toán: Hồi quy chuỗi thời gian đa bước (Multi-step Time-series Regression).
  - Mô hình cốt lõi (Core Models): Vanilla LSTM vs 1D-CNN.
  - Mô hình đối chứng (Baselines): Linear Regression và ARIMA.
- **Ràng buộc & Chống rò rỉ thông tin**:
  - Toàn bộ dữ liệu được phân chia theo trình tự thời gian (Time-based split: 70% Train, 15% Validation, 15% Test). Không xáo trộn (no shuffle).
  - Bộ chuẩn hóa `MinMaxScaler` chỉ được fit trên tập Train, sau đó transform cho tập Validation và Test.

### 1.1. Dữ liệu và hợp đồng tensor (Data & Tensor Contract)
- **Nguồn dữ liệu**: Yahoo Finance qua thư viện `yfinance`, ticker `FPT.VN`.
- **Độ phân giải**: Nến ngày (`1d`), quy mô 5 năm lịch sử gần nhất.
- **Trường dữ liệu thô**: `Open`, `High`, `Low`, `Close`, `Adj Close`, `Volume`.
- **Target Variable**: `Close` price.
- **Tensor Shapes**:
  - Đầu vào mô hình (X): `(Batch_Size, Lookback=60, Num_Features=1)` (hoặc đa biến nếu mở rộng feature).
  - Đầu ra mô hình (Y): `(Batch_Size, Horizon=5)`.
  - Kiểu dữ liệu: `torch.float32`.

### 1.2. Pipeline Execution Roadmap
- Thu thập & Lưu cache: [data_loader.py](src/data/data_loader.py) -> Lưu trữ tại `data/raw/FPT_VN_5y.csv`.
- Tiền xử lý & Tạo chuỗi trượt: [dataset.py](src/data/dataset.py) -> Sinh PyTorch `DataLoader`.
- Xây dựng mô hình Baseline: [baseline_lr.py](src/models/baseline_lr.py) & [baseline_arima.py](src/models/baseline_arima.py).
- Xây dựng mô hình Học sâu: [lstm_model.py](src/models/lstm_model.py) & [cnn_model.py](src/models/cnn_model.py).
- Huấn luyện & Đánh giá: [train.py](scripts/train.py) & [eval.py](scripts/eval.py).

### 1.3. Thiết kế so sánh và tiêu chí đánh giá
- **Câu hỏi thực nghiệm**:
  1. Mô hình Deep Learning (LSTM, CNN) có cải thiện đáng kể sai số dự đoán đa bước so với các baseline thống kê (Linear Regression, ARIMA) không?
  2. Kiến trúc 1D-CNN (trích xuất đặc trưng không gian cục bộ) có đạt độ chính xác tương đương hoặc tốc độ huấn luyện nhanh hơn so với LSTM (nắm bắt phụ thuộc tuần tự dài hạn) không?
- **Bộ chỉ số đo lường**:
  - RMSE (Root Mean Squared Error): Phạt nặng các lỗi sai lớn.
  - MAE (Mean Absolute Error): Độ lệch giá trung bình thực tế (VNĐ).
  - MAPE (Mean Absolute Percentage Error): Sai số tỷ lệ phần trăm (%).
  - $R^2$ Score: Hệ số xác định mức độ giải thích phương sai của mô hình.
  - Directional Accuracy (%): Tỷ lệ dự đoán đúng xu hướng giá tăng/giảm so với ngày $t$.

---

## 2. Phương pháp và thiết kế thí nghiệm

### 2.1. Phân tích khám phá dữ liệu (EDA)
*(Sẽ được cập nhật sau khi tải và phân tích dữ liệu FPT.VN)*

### 2.2. Tiền xử lý dữ liệu (Preprocessing)
*(Chi tiết các bước scale, xử lý ngày nghỉ giao dịch, sliding window)*

### 2.3. Kiến trúc mô hình chi tiết
*(Bảng tham số, số layer, tensor flow chi tiết của LSTM và 1D-CNN)*

### 2.4. Quy trình huấn luyện & Tối ưu
*(Loss function, Optimizer Adam, Learning rate, Early Stopping)*

---

## 3. Kết quả, thảo luận và kết luận

### 3.1. Bảng so sánh tổng hợp (Master Results Table)
*(Sẽ được cập nhật từ outputs thực nghiệm)*

| Mô hình | Input Dim | Params | Test RMSE (VNĐ) | Test MAE (VNĐ) | Test MAPE (%) | Test $R^2$ | Directional Acc (%) | Train Time (s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Linear Regression** | $60$ | - | - | - | - | - | - | - |
| **ARIMA** | $60$ | - | - | - | - | - | - | - |
| **Vanilla LSTM** | $(60, 1)$ | - | - | - | - | - | - | - |
| **1D-CNN** | $(60, 1)$ | - | - | - | - | - | - | - |

### 3.2. Đường cong hội tụ & Huấn luyện
*(Biểu đồ Train vs Validation Loss qua các Epochs)*

### 3.3. Đồ thị dự đoán đa bước (Actual vs Predicted)
*(Biểu đồ so sánh giá đóng cửa thực tế và dải dự đoán $k=5$ ngày trên tập Test)*

### 3.4. Phân tích sai số (Residual Error Analysis)
*(Phân tích các khoảng thời gian thị trường biến động mạnh khiến sai số tăng cao)*

### 3.5. Kết luận và Hướng phát triển
*(Tổng kết kết quả thực nghiệm và các hạn chế cần khắc phục)*
