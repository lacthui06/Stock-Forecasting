# Dự án Dự đoán Giá Cổ phiếu Đa bước (Multi-step Stock Price Forecasting) với LSTM và CNN

> **Mã cổ phiếu thực nghiệm chính**: `FPT.VN` (Tập đoàn FPT - Sàn HOSE)  
> **Bài toán**: Hồi quy chuỗi thời gian đa bước (Multi-step Time-series Regression, $k = 5$ ngày) với cửa sổ quan sát (Lookback window, $L = 60$ ngày).  
> **Mô hình**: Baseline (Linear Regression, ARIMA) vs Deep Learning (Vanilla LSTM, 1D-CNN).

---

## 1. Cấu trúc thư mục dự án (Project Directory Tree)

```text
Stock-Forecasting/
├── .agents/                                # Quy chuẩn, kỹ năng và biểu mẫu tự động hóa
│   ├── checklists/                         # Checklists kiểm soát chất lượng
│   │   ├── new_lab_bootstrap.md            # Checklist khởi tạo cấu trúc dự án
│   │   ├── pre_commit.md                   # Checklist kiểm tra trước khi commit code
│   │   └── pre_submission.md               # Checklist nghiệm thu bài toán hồi quy
│   ├── skills/                             # 25 bộ kỹ năng kỹ thuật phần mềm (TDD, EDA, Review...)
│   └── templates/                          # Biểu mẫu báo cáo walkthrough và README chuẩn
│
├── config/                                 # Cấu hình tập trung cho toàn bộ pipeline
│   └── default_config.yaml                 # Tham số dữ liệu, mô hình, siêu tham số huấn luyện
│
├── data/                                   # Dữ liệu chuỗi thời gian (loại trừ khỏi Git)
│   ├── raw/                                # Dữ liệu nến ngày gốc tải từ Yahoo Finance (CSV cache)
│   └── processed/                          # Dữ liệu sau chuẩn hóa (MinMaxScaler) và tạo window
│
├── notebooks/                              # Jupyter Notebooks phục vụ EDA và phân tích nhanh
│
├── outputs/                                # Kết quả thực nghiệm và báo cáo trực quan
│   ├── runs/                               # Lưu vết theo run_id (weights, snapshot môi trường, log)
│   └── published/                          # Biểu đồ và bảng số liệu thực tế đưa vào báo cáo
│
├── scripts/                                # Các script dòng lệnh điều phối thực thi (CLI)
│   ├── train.py                            # Huấn luyện mô hình Deep Learning (LSTM, 1D-CNN)
│   ├── eval.py                             # Đánh giá và so sánh mô hình với Baseline
│   └── predict.py                          # Dự đoán giá 5 ngày tiếp theo từ dữ liệu mới nhất
│
├── src/                                    # Thư viện mã nguồn module hóa tái sử dụng
│   ├── data/                               # Phân hệ nạp dữ liệu và xử lý chuỗi trượt
│   │   ├── data_loader.py                  # Tải nến OHLCV qua yfinance và lưu cache
│   │   └── dataset.py                      # Tạo Time-series Sliding Window và PyTorch DataLoader
│   ├── models/                             # Phân hệ kiến trúc mô hình
│   │   ├── baseline_lr.py                  # Baseline 1: Hồi quy tuyến tính (Linear Regression)
│   │   ├── baseline_arima.py               # Baseline 2: Mô hình thống kê ARIMA
│   │   ├── lstm_model.py                   # Mô hình chính: Vanilla LSTM đa bước
│   │   └── cnn_model.py                    # Mô hình chính: 1D-CNN trích xuất đặc trưng không gian
│   └── utils/                              # Tiện ích bổ trợ
│       ├── metrics.py                      # Tính RMSE, MAE, MAPE, R2, Directional Accuracy
│       └── visualizer.py                   # Vẽ biểu đồ Actual vs Predicted, Loss, Residuals
│
├── tests/                                  # Bộ kiểm thử tự động với PyTest
│   ├── test_data.py                        # Kiểm tra tính toàn vẹn dữ liệu và không rò rỉ (leakage)
│   └── test_models.py                      # Kiểm thử tensor shape đầu vào/đầu ra của các mô hình
│
├── .gitignore                              # Danh sách file/thư mục bỏ qua khi commit Git
├── AGENTS.md                               # Quy chuẩn kỹ thuật và chỉ dẫn nghiêm ngặt cho Agent
├── DESCRIPTION.md                          # Phiếu đăng ký đề tài chính thức
├── requirements.txt                        # Danh sách thư viện phụ thuộc Python
├── walkthrough.md                          # Tài liệu sống duy nhất theo dõi phương pháp & kết quả
└── README.md                               # Hướng dẫn tổng quan và vận hành dự án
```

---

## 2. Bảng tham chiếu các tệp cốt lõi (Key Files Reference)

Bạn có thể giữ **Ctrl + Click** vào tên tệp bên dưới để mở trực tiếp trong trình soạn thảo:

| Tệp / Đường dẫn | Phân loại | Mô tả vai trò |
| :--- | :--- | :--- |
| [walkthrough.md](./walkthrough.md) | **Tài liệu sống (Living Doc)** | Nguồn báo cáo duy nhất ghi nhận đặc tả, phương pháp, bảng số liệu thực nghiệm và đồ thị. |
| [DESCRIPTION.md](./DESCRIPTION.md) | **Đăng ký đề tài** | Phiếu mô tả mục tiêu, đối tượng sử dụng, dữ liệu và timeline 3 tuần. |
| [AGENTS.md](./AGENTS.md) | **Quy chuẩn Agent** | Bộ luật bắt buộc cho Agent: cấm rò rỉ dữ liệu (No Data Leakage), cấm bịa số liệu. |
| [config/default_config.yaml](./config/default_config.yaml) | **Cấu hình** | Quản lý tập trung thông số `ticker: FPT.VN`, `lookback: 60`, `horizon: 5`, batch size, learning rate. |
| [requirements.txt](./requirements.txt) | **Môi trường** | Định nghĩa phiên bản thư viện cần thiết (`torch`, `yfinance`, `statsmodels`...). |
| [.agents/checklists/new_lab_bootstrap.md](.agents/checklists/new_lab_bootstrap.md) | **Checklist** | Tiêu chuẩn dựng khung dự án ngay từ đầu. |
| [.agents/checklists/pre_commit.md](.agents/checklists/pre_commit.md) | **Checklist** | Tiêu chuẩn rà soát code và tests trước khi commit. |
| [.agents/checklists/pre_submission.md](.agents/checklists/pre_submission.md) | **Checklist** | Tiêu chuẩn kiểm toán số liệu và nghiệm thu trước khi nộp đề tài. |

---

## 3. Luồng xử lý dữ liệu và huấn luyện (Pipeline Architecture)

```mermaid
flowchart TD
    A["Yahoo Finance API (yfinance)"] -->|"Tải nến OHLCV (5 năm)"| B["src/data/data_loader.py"]
    B -->|"Lưu cache CSV"| C[("data/raw/FPT_VN_5y.csv")]
    C --> D["src/data/dataset.py"]
    
    subgraph Data_Processing["Tiền xử lý & Chống rò rỉ dữ liệu (No Leakage)"]
        D --> E["Time-based Split (Train 70% | Val 15% | Test 15%)"]
        E --> F["Fit MinMaxScaler CHỈ trên tập Train"]
        F --> G["Sliding Window (Lookback=60, Horizon=5)"]
    end

    G --> H["PyTorch DataLoader"]
    
    subgraph Modeling["Mô hình đối chứng & Mô hình học sâu"]
        H --> M1["Baseline 1: Linear Regression"]
        H --> M2["Baseline 2: ARIMA(p,d,q)"]
        H --> M3["Core Model 1: Vanilla LSTM"]
        H --> M4["Core Model 2: 1D-CNN"]
    end

    M1 & M2 & M3 & M4 --> EVAL["scripts/eval.py & src/utils/metrics.py"]
    
    subgraph Evaluation["Đánh giá định lượng & Trực quan hóa"]
        EVAL --> METRICS["Metrics: RMSE, MAE, MAPE, R2, Directional Acc"]
        EVAL --> PLOTS["Plots: Actual vs Pred, Residuals, Loss Curves"]
    end

    METRICS & PLOTS --> REPORT["walkthrough.md (Báo cáo thực nghiệm)"]
```

---

## 4. Hướng dẫn cài đặt và vận hành

### 4.1. Khởi tạo môi trường
Dự án yêu cầu **Python $\ge 3.10$**:
```bash
pip install -r requirements.txt
```

### 4.2. Chạy kiểm thử tự động
Xác thực tính toàn vẹn dữ liệu và tensor contract trước khi huấn luyện:
```bash
pytest tests/ -v
```

### 4.3. Huấn luyện mô hình
```bash
python scripts/train.py --config config/default_config.yaml
```

### 4.4. Đánh giá và so sánh mô hình
```bash
python scripts/eval.py --config config/default_config.yaml
```

---

## 5. Tiêu chuẩn đánh giá và nghiệm thu
Dự án tuân thủ nghiêm ngặt các tiêu chí sau:
1. **Phân chia dữ liệu theo thời gian (Time-based split)**: Tuyệt đối không xáo trộn (no shuffle) để tránh Lookahead Bias.
2. **Chuẩn hóa độc lập**: Scaler chỉ học tham số `min` và `max` trên tập Train; tập Validation và Test dùng lại scaler này.
3. **Tính xác thực số liệu**: Toàn bộ chỉ số đánh giá (RMSE, MAE, MAPE, $R^2$) phải được trích xuất trực tiếp từ log thực nghiệm trong `outputs/runs/`, không dùng số liệu giả lập.
