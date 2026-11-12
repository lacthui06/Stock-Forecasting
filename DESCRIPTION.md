# **Mẫu đăng ký đề tài**
1. Tên đề tài: Nghiên cứu và Xây dựng Mô hình Học sâu Dự đoán Giá Cổ phiếu Đa bước (Multi-step Stock Price Forecasting) với LSTM và CNN: Thực nghiệm trên Cổ phiếu NVIDIA (`NVDA`).
2. Hướng chính: AI dự đoán chuỗi thời gian (Time-series Forecasting).
3. Người sử dụng và vấn đề:
   - **Người sử dụng**: Nhà đầu tư cá nhân, chuyên viên phân tích kỹ thuật và định lượng (Quant Analyst).
   - **Vấn đề khó khăn**: Biến động giá cổ phiếu công nghệ (đặc biệt là làn sóng bán dẫn/AI của NVIDIA) mang tính phi tuyến cực cao với các đợt bùng nổ xu hướng và biến động mạnh; các mô hình thống kê truyền thống khó bắt trọn các phụ thuộc phi tuyến dài hạn; dự đoán đơn bước (single-step: ngày mai) chưa đủ cơ sở để xây dựng kế hoạch quản trị rủi ro hoặc giao dịch ngắn hạn theo tuần.
4. Mục tiêu: Dự đoán giá đóng cửa (`Close`) đa bước trong $k = 5$ ngày giao dịch tiếp theo dựa trên chuỗi dữ liệu lịch sử (Lookback window mặc định 60 ngày, có khả năng cấu hình mở rộng 90/120 ngày).
5. Dữ liệu:
   - **Nguồn**: [Yahoo Finance via `yfinance`](https://pypi.org/project/yfinance/).
   - **Mã cổ phiếu chính**: `NVDA` (NVIDIA Corporation - Sàn NASDAQ); hệ thống hỗ trợ cấu hình tải bất kỳ mã cổ phiếu nào khác.
   - **Trường dữ liệu**: Open, High, Low, Close, Adj Close, Volume (nến ngày `1d`).
   - **Quy mô dự kiến**: Dữ liệu lịch sử 5 năm gần nhất (USD).
   - **Quyền sử dụng & Dự phòng**: Dữ liệu công khai, lưu bản cache cục bộ (CSV) để dự phòng ngắt kết nối mạng hoặc rate-limit.
6. Phạm vi:
   - Bài toán hồi quy đa bước (Multi-step Time-series Regression, $k=5$).
   - Lookback window: Mặc định 60 ngày (tùy biến tăng lên 90, 120 ngày).
   - Mô hình lõi (Core Models): Vanilla LSTM vs 1D-CNN (đánh giá hiệu năng và thời gian huấn luyện).
   - Mô hình mốc (Baselines): Linear Regression và ARIMA.
7. Phương pháp:
   - Chuẩn hóa dữ liệu (MinMax Scaling), phân tách chuỗi dạng trượt (Sliding Window).
   - Chia tập dữ liệu theo thời gian (Time-based split, không xáo trộn) để tránh rò rỉ thông tin (Data Leakage).
   - Huấn luyện và tinh chỉnh siêu tham số cho LSTM và 1D-CNN.
   - Đánh giá chéo và so sánh trực tiếp với 2 baseline: Linear Regression và ARIMA.
8. Sản phẩm:
   - Mã nguồn hoàn chỉnh: Pipeline thu thập, tiền xử lý, huấn luyện, kiểm thử và vẽ đồ thị trực quan.
   - Trọng số mô hình đã huấn luyện (model checkpoints).
   - Giao diện/Bản demo trực quan kết quả dự đoán (Jupyter Notebook / Web Demo tối thiểu).
   - Báo cáo phân tích hiệu nghiệm, so sánh chỉ số và tài liệu hướng dẫn cài đặt.
9. Đánh giá:
   - **Chỉ số định lượng**: RMSE (Root Mean Squared Error), MAE (Mean Absolute Error), MAPE (Mean Absolute Percentage Error), $R^2$ Score.
   - **Chỉ số xu hướng**: Directional Accuracy (độ chính xác dự đoán hướng tăng/giảm giá).
   - **Kịch bản**: Đánh giá trên tập kiểm thử Test Set (dữ liệu mới nhất chưa từng học).
10. Kế hoạch và rủi ro:
    - **Phân công & Timeline**: Tuân thủ kế hoạch 3 tuần (Tuần 1: Dữ liệu & Baseline, Tuần 2: Tối ưu Core Models & So sánh, Tuần 3: Đóng gói báo cáo & demo).
    - **Rủi ro**: Lỗi mạng API `yfinance` -> Xử lý bằng cơ chế offline cache. Biến động dị thường thị trường -> Phân tích giới hạn mô hình trong báo cáo.

# **Báo cáo nên có** 
- Báo cáo vấn đề và phạm vi; 
- dữ liệu mẫu và mô tả; 
- mã nguồn; 
- hướng dẫn cài đặt/chạy; 
- demo; 
- kết quả so sánh với baseline; 
- phân tích lỗi và giới hạn.

# **Thời gian | Công việc | Kết quả cần có**

Tuần 1 | Khảo sát nghiệp vụ, chốt phạm vi, Chuẩn bị dữ liệu, thiết kế đánh giá, Xây dựng baseline, Xây dựng giải pháp và sản phẩm tối thiểu | Phiếu đăng ký, tình huống sử dụng, Dữ liệu mẫu, mô tả trường, kịch bản test, Luồng xử lý hoàn chỉnh, Kết quả làm mốc so sánh

Tuần 2 | Tích hợp, xử lý tình huống lỗi, Đánh giá trên cùng điều kiện với baseline | Bản demo ổn định, Bảng kết quả, phân tích lỗi

Tuần 3 | Hoàn thiện báo cáo và bàn giao | Demo, mã nguồn, hướng dẫn chạy
