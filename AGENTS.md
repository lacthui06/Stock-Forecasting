# Project Agent Rules & Development Standards

Dự án này tuân theo quy chuẩn kỹ thuật phần mềm và nghiên cứu thực nghiệm nghiêm ngặt được định nghĩa trong `.agents/`.

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Spec First**: Mọi thay đổi logic hay mô hình đều phải cập nhật và phản ánh trong [walkthrough.md](./walkthrough.md) trước khi code.
- **Tài liệu sống duy nhất**: [walkthrough.md](./walkthrough.md) là tài liệu duy nhất theo dõi bài toán, phương pháp và kết quả thực nghiệm. Không tạo các file `SPEC.md` hay `REPORT.md` rời rạc.
- **Chống rò rỉ dữ liệu (No Data Leakage)**: Với dữ liệu chuỗi thời gian, phân chia tập Train / Val / Test TUYỆT ĐỐI theo trục thời gian (`time-based split`), không shuffle. Khởi tạo và fit `MinMaxScaler` chỉ trên tập Train.
- **Tính xác thực của số liệu (Numerical Accuracy)**: Không bịa đặt chỉ số hay dùng placeholder giả định. Mọi kết quả RMSE, MAE, MAPE, R2 phải được ghi nhận từ log chạy thực nghiệm (`outputs/runs/<run_id>/`).

## 2. Checklists áp dụng
- Khởi tạo & Cấu trúc thư mục: Tuân thủ [.agents/checklists/new_lab_bootstrap.md](.agents/checklists/new_lab_bootstrap.md).
- Trước khi commit: Tuân thủ [.agents/checklists/pre_commit.md](.agents/checklists/pre_commit.md).
- Trước khi nghiệm thu: Tuân thủ [.agents/checklists/pre_submission.md](.agents/checklists/pre_submission.md) (quy đổi chỉ số sang bài toán Hồi quy).

## 3. Quy ước định dạng bài toán (Regression Context)
- **Target**: Giá đóng cửa (`Close`).
- **Mã cổ phiếu chính**: `FPT.VN`.
- **Lookback Window**: Mặc định 60 ngày (có thể tùy biến qua config).
- **Forecast Horizon**: $k = 5$ ngày (đa bước).
- **Metrics chuẩn**: RMSE, MAE, MAPE (%), $R^2$ Score, Directional Accuracy (%).
- **Visualizations bắt buộc**:
  - Actual vs Predicted Multi-step curves.
  - Residual Error Distribution.
  - Training & Validation Loss curves.
