# Báo cáo Đề tài: Dự đoán Giá Cổ phiếu Đa bước (Multi-step Stock Price Forecasting) với LSTM và CNN: Thực nghiệm trên Cổ phiếu NVIDIA (`NVDA`)

Tài liệu sống duy nhất của dự án. Viết bằng văn phong học thuật, sử dụng số liệu và hình ảnh thực từ artifacts được sinh ra trong quá trình thực nghiệm.

---

## 1. Bài toán và thiết kế tổng thể

### 1.0. Đề bài và phạm vi đã thống nhất
- **Bối cảnh & Mục tiêu**: Cổ phiếu công nghệ bán dẫn NVIDIA (`NVDA` - Sàn NASDAQ) có tính biến động cực lớn, thanh khoản kỷ lục và chịu ảnh hưởng mạnh mẽ từ làn sóng bùng nổ Trí tuệ Nhân tạo. Mục tiêu của đề tài là xây dựng pipeline dự đoán giá đóng cửa (`Close`) đa bước trong $k = 5$ ngày giao dịch kế tiếp dựa trên chuỗi dữ liệu lịch sử $L = 60$ ngày (Lookback window).
- **Phạm vi phương pháp**:
  - Bài toán: Hồi quy chuỗi thời gian đa bước (Multi-step Time-series Regression).
  - Mô hình cốt lõi (Core Models): Vanilla LSTM vs 1D-CNN.
  - Mô hình đối chứng (Baselines): Linear Regression và ARIMA.
- **Ràng buộc & Chống rò rỉ thông tin**:
  - Toàn bộ dữ liệu được phân chia theo trình tự thời gian (Time-based split: 70% Train, 15% Validation, 15% Test). Không xáo trộn (no shuffle).
  - Bộ chuẩn hóa `MinMaxScaler` chỉ được fit trên tập Train, sau đó transform cho tập Validation và Test.

### 1.1. Dữ liệu và hợp đồng tensor (Data & Tensor Contract)
- **Nguồn dữ liệu**: Yahoo Finance qua thư viện `yfinance`, ticker `NVDA`.
- **Độ phân giải**: Nến ngày (`1d`), quy mô 5 năm lịch sử gần nhất.
- **Trường dữ liệu thô**: `Open`, `High`, `Low`, `Close`, `Adj Close`, `Volume`.
- **Target Variable**: `Close` price (USD).
- **Tensor Shapes**:
  - Đầu vào mô hình (X): `(Batch_Size, Lookback=60, Num_Features=1)` (hoặc đa biến nếu mở rộng feature).
  - Đầu ra mô hình (Y): `(Batch_Size, Horizon=5)`.
  - Kiểu dữ liệu: `torch.float32`.

### 1.2. Pipeline Execution Roadmap
Các đường dẫn module dưới đây là dự kiến, chưa tồn tại trong repo.
- Thu thập & Lưu cache: `data_loader.py` -> Lưu trữ tại `data/raw/NVDA_5y.csv`.
- Tiền xử lý & Tạo chuỗi trượt: `dataset.py` -> Sinh PyTorch `DataLoader`.
- Xây dựng mô hình Baseline: `baseline_lr.py` & `baseline_arima.py`.
- Xây dựng mô hình Học sâu: `lstm_model.py` & `cnn_model.py`.
- Huấn luyện & Đánh giá: `train.py` & `eval.py`.

### 1.3. Thiết kế so sánh và tiêu chí đánh giá
- **Câu hỏi thực nghiệm**:
  1. Mô hình Deep Learning (LSTM, CNN) có cải thiện đáng kể sai số dự đoán đa bước so với các baseline thống kê (Linear Regression, ARIMA) không?
  2. Kiến trúc 1D-CNN (trích xuất đặc trưng không gian cục bộ) có đạt độ chính xác tương đương hoặc tốc độ huấn luyện nhanh hơn so với LSTM (nắm bắt phụ thuộc tuần tự dài hạn) không?
- **Bộ chỉ số đo lường**:
  - RMSE (Root Mean Squared Error): Phạt nặng các lỗi sai lớn.
  - MAE (Mean Absolute Error): Độ lệch giá trung bình thực tế (USD).
  - MAPE (Mean Absolute Percentage Error): Sai số tỷ lệ phần trăm (%).
  - $R^2$ Score: Hệ số xác định mức độ giải thích phương sai của mô hình.
  - Directional Accuracy (%): Tỷ lệ dự đoán đúng xu hướng giá tăng/giảm so với ngày $t$.

---

### 1.4. Hợp đồng thiết kế và tiêu chí nghiệm thu đề xuất

Trạng thái: repository hiện có khung thư mục và cấu hình; các module, API và luồng dưới đây là thiết kế cần triển khai, chưa phải tính năng đã được kiểm chứng.

- **Core features**: tải/cache NVDA, kiểm tra dữ liệu, dự báo Close 5 phiên từ 60 phiên lịch sử, so sánh LR/ARIMA/LSTM/CNN, xuất biểu đồ và metrics.
- **Success criteria chức năng**: mỗi đầu vào hợp lệ trả đúng 5 giá trị hữu hạn theo đúng thứ tự phiên; từ chối đầu vào thiếu/không hợp lệ; có nguồn dữ liệu, ngày cutoff, model version và scaler đi kèm để tái lập.
- **Success criteria nghiên cứu**: so sánh trên cùng forecast origins và Test độc lập; chỉ kết luận DL cải thiện khi MAE và RMSE tổng hợp thấp hơn baseline tốt nhất theo từng chỉ số; vẫn công bố kết quả từng horizon, MAPE, R², Directional Accuracy và thời gian huấn luyện. Nếu không đạt thì kết luận giả thuyết chưa được hỗ trợ, không sửa tiêu chí theo Test.
- **Training**: cache/validate, chia thời gian 70/15/15, fit scaler trên Train, tạo windows với nhãn không vượt ranh giới tập, chọn bằng Validation, đánh giá Test sau khi chốt mô hình; lưu checkpoint, scaler, config và metrics theo run_id.
- **Inference**: chỉ dùng 60 Close tại hoặc trước cutoff; tải đúng checkpoint/scaler đã lưu, không refit, eval + no_grad, inverse transform, gán 5 phiên hợp lệ theo lịch sàn; từ chối output không hữu hạn hoặc giá không hợp lệ.
- **API nội bộ đề xuất**: `predict(close_history, model_bundle)` nhận chuỗi gồm date và Close, checkpoint cùng scaler/config; trả `as_of`, `model_version`, `forecasts[{date, close_usd}]`. Đây là Python interface; chưa có HTTP service. Các lỗi dự kiến: insufficient_history, invalid_data, artifact_mismatch, data_unavailable.
- **Edge cases**: dưới 60 phiên; ngày trùng, sai thứ tự, NaN/Inf, giá không dương; cache cũ; ngày nghỉ; cổ phiếu chia tách; thiếu checkpoint hoặc scaler không tương thích. Không tự tạo dữ liệu tương lai hay âm thầm thay ticker/cách điều chỉnh giá.
- **Security**: ticker whitelist, giới hạn độ dài đầu vào và đường dẫn artifact trong thư mục cho phép; chỉ nạp checkpoint tin cậy, không nhận pickle do người dùng tải lên; không ghi secrets vào repo/log. Xác thực và rate limit là điều kiện nếu mở HTTP service về sau.
- **Performance**: cache dữ liệu, load model một lần, batch inference, eval/no_grad; đo latency p50/p95 trên phần cứng công bố và cùng điều kiện, không tuyên bố tốc độ khi chưa benchmark.
- **Readability**: trách nhiệm module tách rõ, cấu hình tập trung, shape/type contract, lỗi có thông điệp rõ và kiểm thử các ranh giới dữ liệu.
- **Milestones**: tuần 1 dữ liệu/split/scaler/baselines; tuần 2 LSTM/CNN và chọn bằng Validation; tuần 3 đánh giá Test, phân tích lỗi, demo và tái lập. Rủi ro chính: API lỗi/rate limit (cache có timestamp, retry giới hạn), leakage (test cutoff/window), overfit (early stopping), regime shift (phân tích lỗi theo giai đoạn).

---

## 2. Phương pháp và thiết kế thí nghiệm

### 2.1. Phân tích khám phá dữ liệu (EDA)
Theo quy chuẩn tại [docs/time_series.md](docs/time_series.md):
- **Phân rã chuỗi thời gian**: Decomposition (Trend, Seasonality, Residuals).
- **Phân tích chu kỳ**: Boxplot biến động theo thứ trong tuần (Day-of-Week) và theo tháng (Monthly).
- **Tương quan chuỗi**: Biểu đồ tự tương quan ACF và PACF để xác định độ trễ tối ưu.
- **Kiểm định tính dừng**: Rolling Statistics (Mean/Std trượt) và kiểm định nghiệm đơn vị Augmented Dickey-Fuller (ADF Test).
- *(Các biểu đồ thực tế sẽ được nhúng vào sau khi chạy EDA)*

### 2.2. Tiền xử lý dữ liệu (Preprocessing)
Theo quy chuẩn chống rò rỉ dữ liệu tại [docs/dl_data.md](docs/dl_data.md):
- Xử lý ngày nghỉ giao dịch (không nội suy sai lệch giá).
- Phân chia tập thời gian: 70% Train, 15% Validation, 15% Test.
- `MinMaxScaler` chỉ fit trên tập Train, transform cho Val và Test.
- Trượt cửa sổ: $X \in (B, 60, 1)$, $Y \in (B, 5)$.

### 2.3. Kiến trúc mô hình chi tiết
- **Baseline 1 (Linear Regression)**: Đa biến đầu vào 60 điểm giá trượt dự báo 5 bước độc lập.
- **Baseline 2 (ARIMA)**: Mô hình chuỗi thời gian thống kê cổ điển $ARIMA(p, d, q)$.
- **Vanilla LSTM**: 2 tầng LSTM (`hidden_dim=64`, `dropout=0.2`) kết nối Fully-Connected Layer chiếu về 5 bước.
- **1D-CNN**: 2 tầng Conv1d (`kernel_size=3`), Batch Normalization, ReLU, MaxPool1d, AdaptiveAvgPool1d chiếu về 5 bước.

### 2.4. Quy trình huấn luyện & Tối ưu
Theo quy chuẩn tại [docs/dl_training.md](docs/dl_training.md):
- **Sanity Overfit Test**: Overfit 1 batch duy nhất trước khi huấn luyện toàn bộ.
- **Loss Function**: `MSELoss` (hoặc `HuberLoss` chống nhiễu outlier).
- **Optimizer**: `AdamW(lr=1e-3, weight_decay=1e-2)`.
- **LR Scheduler**: `CosineAnnealingLR`.
- **Gradient Clipping**: `max_norm=1.0`.
- **Early Stopping**: Giám sát `val_loss`, `patience=10`.

---

## 3. Kết quả, thảo luận và kết luận

### 3.1. Bảng so sánh tổng hợp (Master Results Table)
*(Sẽ được cập nhật từ outputs thực nghiệm)*

| Mô hình | Input Dim | Params | Test RMSE (USD) | Test MAE (USD) | Test MAPE (%) | Test $R^2$ | Directional Acc (%) | Train Time (s) |
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
