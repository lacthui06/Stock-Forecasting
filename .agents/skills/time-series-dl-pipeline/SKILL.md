---
name: time-series-dl-pipeline
description: >-
  Guides end-to-end time-series exploratory data analysis (EDA), anti-leakage preprocessing,
  sliding window sequence generation, PyTorch deep learning training (LSTM, 1D-CNN),
  and multi-step regression evaluation. Use when analyzing financial time-series data,
  performing stationarity/ACF/PACF analysis, building PyTorch sequential Datasets/DataLoaders,
  training forecasting models, or evaluating multi-step prediction metrics (RMSE, MAE, MAPE, R2, Directional Accuracy).
---

# Time-Series Deep Learning Pipeline Skill

Quy trình chuẩn mực end-to-end cho bài toán dự đoán chuỗi thời gian tài chính (Financial Time-Series Forecasting) sử dụng học sâu (Deep Learning: LSTM, 1D-CNN) và mô hình đối chứng (Linear Regression, ARIMA).

Tài liệu tham chiếu chi tiết trong dự án:
- Phân tích chuỗi thời gian: [docs/time_series.md](../../../docs/time_series.md)
- Kiến trúc luồng Deep Learning: [docs/dl_flow.md](../../../docs/dl_flow.md)
- Quy trình huấn luyện & Tối ưu: [docs/dl_training.md](../../../docs/dl_training.md)
- Quản lý dữ liệu học sâu: [docs/dl_data.md](../../../docs/dl_data.md)
- Khám phá & Kỹ nghệ đặc trưng: [docs/eda.md](../../../docs/eda.md) & [docs/feature.md](../../../docs/feature.md)

---

## Giai đoạn 1: Khám phá Dữ liệu Chuỗi thời gian (Time-Series EDA)

Tuân thủ nghiêm ngặt lộ trình tại [docs/time_series.md](../../../docs/time_series.md):

1. **Kiểm tra tính toàn vẹn (Integrity & Calendar Scan)**:
   - Kiểm tra định dạng `DatetimeIndex`, sắp xếp tăng dần theo thời gian.
   - Nhận diện các ngày nghỉ giao dịch (Cuối tuần, Lễ Tết). Không tự ý nội suy điền giá nếu phiên giao dịch không mở cửa.
   - Xử lý các giá trị NaN/Null (nếu có do chia tách cổ tức hoặc lỗi dữ liệu nến).
2. **Khảo sát đặc trưng & Xu hướng (Trend & Seasonality)**:
   - Phân rã chuỗi thời gian (*Seasonal Decomposition* qua `statsmodels.tsa.seasonal_decompose`): tách thành Level, Trend, Seasonality và Residuals.
   - Phân tích chu kỳ tuần (Day-of-Week) và chu kỳ tháng (Monthly) thông qua biểu đồ hộp (*Boxplot*).
3. **Phân tích tương quan & Tính dừng (Autocorrelation & Stationarity)**:
   - Phân tích hàm tự tương quan **ACF** và tự tương quan riêng phần **PACF** (`plot_acf`, `plot_pacf`) để xác định bậc tự hồi quy phù hợp ($p, q$ cho ARIMA và lookback window $L$).
   - Kiểm định nghiệm đơn vị **Augmented Dickey-Fuller (ADF Test)**: Kiểm tra p-value ($p < 0.05$ là dừng).
   - Kiểm định phân phối chuẩn phần dư (*Residuals Normality & Q-Q Plot*).

---

## Giai đoạn 2: Tiền xử lý & Chống rò rỉ dữ liệu (No Data Leakage)

1. **Phân chia tập dữ liệu theo thời gian (Strict Time-based Split)**:
   - Tỷ lệ chuẩn: **70% Train | 15% Validation | 15% Test**.
   - Tuyệt đối **KHÔNG shuffle** hay dùng `train_test_split(shuffle=True)`. Trật tự thời gian phải được bảo toàn $t_1 < t_2 < \dots < t_N$.
2. **Chuẩn hóa độc lập (Strict Scaler Discipline)**:
   - Sử dụng `MinMaxScaler(feature_range=(0, 1))` hoặc `StandardScaler`.
   - **Quy tắc bắt buộc**: CHỈ gọi `scaler.fit(train_data)` hoặc `fit_transform(train_data)`.
   - Với Validation và Test set: CHỈ gọi `scaler.transform(val_data)` và `scaler.transform(test_data)`.
3. **Tạo cửa sổ trượt (Sliding Window Generation)**:
   - Input: $X = [x_{t-L+1}, x_{t-L+2}, \dots, x_t] \in \mathbb{R}^{L \times F}$ (với $L = 60$ là Lookback).
   - Target: $Y = [y_{t+1}, y_{t+2}, \dots, y_{t+k}] \in \mathbb{R}^k$ (với $k = 5$ là Horizon).
4. **PyTorch Dataset & DataLoader**:
   - Viết Custom `Dataset` kế thừa `torch.utils.data.Dataset`.
   - Đảm bảo `DataLoader(train_dataset, shuffle=False)` hoặc `shuffle=True` chỉ trong nội bộ các sliding window của tập Train (đã cắt độc lập), nhưng Validation/Test DataLoader luôn có `shuffle=False`.

---

## Giai đoạn 3: Huấn luyện & Tối ưu hóa Mô hình Học sâu

Áp dụng các hướng dẫn từ [docs/dl_training.md](../../../docs/dl_training.md):

1. **Sanity Check (Bắt buộc trước khi train full)**:
   - Chạy thử nghiệm overfit trên **1 batch duy nhất** (ví dụ 32 mẫu) trong 30-50 epochs.
   - Nếu Loss không giảm tiệm cận 0 $\rightarrow$ Có bug kiến trúc mô hình hoặc tensor shape, dừng lại sửa ngay trước khi tốn tài nguyên chạy full dataset.
2. **Kiến trúc mô hình**:
   - **Vanilla LSTM**: `nn.LSTM(input_size=F, hidden_size=H, num_layers=N, batch_first=True, dropout=p)` $\to$ lấy last time step `h_t` $\to$ `nn.Linear(H, k)`.
   - **1D-CNN**: `nn.Conv1d(in_channels=F, out_channels=C1, kernel_size=K)` $\to$ `BatchNorm1d` $\to$ `ReLU` $\to$ `MaxPool1d` $\to$ `AdaptiveAvgPool1d` $\to$ `nn.Linear(..., k)`.
3. **Tối ưu hóa (Optimization)**:
   - Hàm mất mát (Loss): `nn.MSELoss()` hoặc `nn.HuberLoss(delta=1.0)` để chống ảnh hưởng tiêu cực của outlier.
   - Optimizer: `torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)`.
   - Scheduler: `torch.optim.lr_scheduler.CosineAnnealingLR` hoặc `ReduceLROnPlateau`.
   - Gradient Clipping: `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` ngăn hiện tượng exploding gradient.
   - Early Stopping: Dừng huấn luyện khi `val_loss` không cải thiện sau `patience` epochs (mặc định 10 epochs), lưu lại `best_model.pt`.

---

## Giai đoạn 4: Đánh giá Đa bước & Phân tích Sai số

1. **Nghịch đảo chuẩn hóa (Inverse Scaling)**:
   - Chuyển đổi toàn bộ $\hat{Y}$ (dự đoán) và $Y$ (thực tế) từ khoảng $[0, 1]$ về đơn vị giá thực tế (VNĐ) bằng `scaler.inverse_transform()` trước khi tính metrics.
2. **Bộ chỉ số đo lường (Comprehensive Metrics)**:
   - **RMSE (Root Mean Squared Error)**:
     $$\text{RMSE} = \sqrt{\frac{1}{N \cdot k} \sum_{i=1}^N \sum_{j=1}^k (y_{i, j} - \hat{y}_{i, j})^2}$$
   - **MAE (Mean Absolute Error)**:
     $$\text{MAE} = \frac{1}{N \cdot k} \sum_{i=1}^N \sum_{j=1}^k |y_{i, j} - \hat{y}_{i, j}|$$
   - **MAPE (%) (Mean Absolute Percentage Error)**:
     $$\text{MAPE} = \frac{100\%}{N \cdot k} \sum_{i=1}^N \sum_{j=1}^k \left|\frac{y_{i, j} - \hat{y}_{i, j}}{y_{i, j}}\right|$$
   - **$R^2$ Score (Coefficient of Determination)**.
   - **Directional Accuracy (%)**: Tỷ lệ dự đoán đúng chiều biến động (tăng/giảm) của bước $t+1$ so với ngày $t$:
     $$\text{DA} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(\text{sgn}(y_{i, 1} - x_{i, t}) == \text{sgn}(\hat{y}_{i, 1} - x_{i, t})) \times 100\%$$
3. **Phân tích từng bước dự báo ($t+1 \dots t+k$)**:
   - Tính bảng sai số riêng cho từng bước $k=1, 2, 3, 4, 5$ để minh chứng quy luật tích lũy sai số theo thời gian.
4. **Trực quan hóa bắt buộc**:
   - Đường cong học tập: `train_loss` vs `val_loss` qua các epoch.
   - Biểu đồ giá thực tế vs dự đoán đa bước trên tập Test.
   - Biểu đồ phân phối phần dư (Residual distribution & Error vs Time).
