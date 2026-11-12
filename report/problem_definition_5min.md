---
marp: true
paginate: true
---

## DEFINE / 01 · PROJECT NAME & PROBLEM

# Dự đoán giá cổ phiếu đa bước

NVDA · LSTM và 1D-CNN · Multi-step Stock Forecasting

PROBLEM

Người dùng cần tham khảo diễn biến giá cả tuần; dự báo một ngày chưa thể hiện chuỗi 5 phiên.



MỤC TIÊU

Từ 60 giá Close quá khứ, dự báo 5 giá Close tiếp theo và kiểm chứng so với LR, ARIMA.





Câu hỏi: học sâu có giảm sai số đa bước so với baseline?

Trạng thái: thiết kế đề xuất · Chưa có kết quả thực nghiệm



<!-- 25 giây. Lời nói: Tên đề tài là dự đoán giá cổ phiếu đa bước với LSTM và CNN trên NVDA. Vấn đề là người dùng muốn tham khảo diễn biến cả tuần giao dịch thay vì một ngày. Mục tiêu cụ thể là dùng 60 giá đóng cửa quá khứ dự báo năm phiên tiếp theo, rồi kiểm chứng với Linear Regression và ARIMA. Đây là thiết kế đề xuất, chưa có kết quả thực nghiệm. -->

---
## DEFINE / 02 · TARGET USER · INPUT / OUTPUT · CORE FEATURES

# Ai dùng? Nhập gì? Nhận gì?

TARGET USER

Nhà đầu tư cá nhân và chuyên viên phân tích định lượng.



CORE FEATURES

Tải/cache dữ liệu · Dự báo 5 phiên · So sánh 4 mô hình · Xuất biểu đồ và metrics.





INPUT60 CloseNVDA · nến ngày

→MODEL60 → 5Hồi quy đa bước

→OUTPUT5 CloseNgày giao dịch + USD



Tensor X: (B, 60, 1) → Y: (B, 5) · B là số mẫu trong batch.



<!-- 35 giây. Lời nói: Người dùng là nhà đầu tư cá nhân và chuyên viên phân tích. Đầu vào ban đầu chỉ là giá Close theo ngày của NVDA, không dùng tin tức hay toàn bộ OHLCV. Sau 60 phiên đã quan sát, đầu ra là năm cặp ngày giao dịch và giá USD, không phải lệnh mua bán. Các chức năng chính gồm tải dữ liệu có cache, dự báo đa bước, so sánh bốn mô hình và xuất đồ thị cùng chỉ số. Tensor đầu vào là B, 60, 1 và đầu ra là B, 5. -->

---
## DEFINE / 03 · TECH CONSTRAINTS · EVALUATION / SUCCESS

# Ràng buộc và tiêu chí thành công

TECH CONSTRAINTS

Python / PyTorch; CPU hoặc GPU.Yahoo Finance · dự kiến 5 năm.Split thời gian 70 / 15 / 15.Scaler chỉ fit trên Train.



EVALUATION CRITERIA

MAE, RMSE (USD), MAPE, R².Directional Accuracy so với Close tại t.Đo từng horizon và tổng hợp.Ghi thời gian huấn luyện.





SUCCESS: trả đúng 5 giá hợp lệ, tái lập được.Chỉ nói DL cải thiện khi MAE và RMSE thấp hơn baseline tốt nhất.



<!-- 35 giây. Lời nói: Ràng buộc gồm Python PyTorch, phần cứng CPU hoặc GPU, dữ liệu dự kiến năm năm và chia theo thời gian 70, 15, 15. Scaler chỉ fit trên train. Tiêu chí chức năng là trả đúng năm giá hợp lệ và tái lập được từ bộ artifact. Đánh giá gồm các metric giá và hướng, riêng từng horizon lẫn tổng hợp. Muốn kết luận học sâu cải thiện, MAE và RMSE phải thấp hơn baseline tốt nhất theo từng chỉ số trên test độc lập. Nếu không đạt, vẫn báo cáo kết quả và bác bỏ giả thuyết cải thiện, không sửa tiêu chí theo test. -->

---
## DESIGN / 04 · SYSTEM / MODEL ARCHITECTURE

# Kiến trúc hệ thống và mô hình

DATAValidateCache · split · scale

→MODELSTrain / PredictChọn bằng Validation

→OUTPUTEvaluateGiá USD · plots · logs



LSTM(B,60,1) → LSTM 2 tầng, hidden 64 → Linear → (B,5)

1D-CNN(B,1,60) → Conv1D → Pool → Linear → (B,5)

BASELINESLinear Regression và ARIMA; cùng mốc dự báo trên Test.



Kiến trúc dự kiến; CNN chuyển trục đầu vào trước Conv1D.



<!-- 35 giây. Lời nói: Kiến trúc tách dữ liệu, mô hình và đầu ra đánh giá. LSTM nhận tensor B, 60, 1, đi qua hai tầng LSTM với hidden 64 rồi chiếu về năm bước. CNN cần đổi trục thành B, 1, 60 để convolve trên thời gian, sau đó pooling và linear cũng trả năm bước. Hai baseline là Linear Regression và ARIMA. Mọi mô hình phải dự báo tại cùng forecast origins trên test. Đây là thiết kế, các module chưa được triển khai trong repository. -->

---
## DESIGN / 05 · MODULES / FOLDER STRUCTURE

# Module rõ trách nhiệm

config/Cấu hình ticker, lookback, horizon, model, training.

src/data/data_loader.py: tải/cache; dataset.py: split/scale/window.

src/models/baseline_lr.py · baseline_arima.py · lstm_model.py · cnn_model.py

src/utils/metrics.py: chỉ số; visualizer.py: đồ thị.

scripts/ · tests/train / eval / predict; kiểm thử shape, cutoff, input lỗi.

outputs/ · report/Run artifacts; HTML trình bày. Báo cáo chính: walkthrough.md.



Các file Python nêu trên là cấu trúc đề xuất; hiện repo mới có khung và config.



<!-- 25 giây. Lời nói: Tổ chức module theo trách nhiệm. Config quản lý tham số. Data chịu trách nhiệm tải cache, chia tập, scaler và window. Models tách bốn kiến trúc. Utils chứa metrics và đồ thị. Scripts điều phối train eval predict, tests kiểm tra shape và leakage. Outputs lưu artifact theo run, report chứa trình bày, còn walkthrough là báo cáo thực nghiệm chính. Tên file ở đây là cấu trúc dự kiến, không phải module đã có. -->

---
## DESIGN / 06 · DATA FLOW · TRAINING PHASE

# Training: học từ quá khứ

01 · CHUẨN BỊYahoo Finance → CSV cache → kiểm tra ngày và Close.

02 · TIỀN XỬ LÝSplit thời gian → fit scaler trên Train → tạo window 60/5.

03 · HUẤN LUYỆNTrain → chọn siêu tham số / checkpoint bằng Validation.

04 · ĐÁNH GIÁChốt mô hình → Test độc lập → inverse scale → metrics.

05 · LƯU ARTIFACTCheckpoint + scaler + config + cutoff + metrics theo run_id.



Không để 5 nhãn của một cửa sổ vượt ranh giới tập.



<!-- 35 giây. Lời nói: Training bắt đầu bằng tải dữ liệu, cache và kiểm tra chất lượng. Chia theo thời gian trước khi fit scaler và sinh cửa sổ. Mỗi nhãn năm ngày phải nằm trọn trong một tập. Có thể lấy lịch sử đầu vào từ tập trước nếu nó đã quan sát được tại mốc dự báo. Huấn luyện trên train và chọn siêu tham số bằng validation, dùng early stopping. Chỉ sau khi chốt mô hình mới đánh giá test, đổi về USD để tính metric. Lưu checkpoint cùng scaler, config, cutoff và metric để inference có thể dùng đúng bộ tương ứng. -->

---
## DESIGN / 07 · INFERENCE PHASE · API CONTRACT

# Inference: dùng lại model đã chốt

INPUT60 phiên ≤ tKiểm tra dữ liệu

→INFERENCEScale → Predicteval + no_grad

→RESPONSE5 phiên > tInverse scale → USD



Python API nội bộ — đề xuất

predict(close_history, model_bundle)Trả: as_of, model_version, forecasts[{date, close_usd}].

Lỗi: thiếu lịch sử · dữ liệu lỗi · artifact không khớp.



Không refit scaler khi inference. Hiện chưa có HTTP service.



<!-- 35 giây. Lời nói: Inference khác training: không học lại từ dữ liệu mới. Nhận 60 phiên ở hoặc trước cutoff, kiểm tra input, tải đúng checkpoint scaler rồi chạy eval và no_grad. Sau dự báo phải inverse transform và gán đúng năm phiên theo lịch sàn, không cộng năm ngày lịch. API nội bộ đề xuất là predict nhận lịch sử Close và model bundle, trả ngày cutoff, phiên bản mô hình và năm cặp ngày giá USD. Nếu thiếu dữ liệu, dữ liệu sai hay artifact không khớp, trả lỗi rõ ràng. Hiện chưa triển khai HTTP service; Yahoo Finance là nguồn dữ liệu bên ngoài. -->

---
## DESIGN / 08 · LOGIC & EDGE CASES

# Đầu vào lỗi phải có cách xử lý

Dưới 60 phiênTừ chối dự báo; thông báo số phiên còn thiếu.

NaN / Inf / Close ≤ 0Từ chối; yêu cầu kiểm tra nguồn, không tự tạo giá.

Ngày trùng / sai thứ tựSắp xếp; bản ghi xung đột phải được xử lý trước.

Cuối tuần / nghỉ lễDùng lịch phiên giao dịch; không nội suy ngày nghỉ.

Split / cache cũ / model lỗiThống nhất điều chỉnh giá, kiểm tra timestamp và model bundle.



Output phải có đúng 5 ngày tăng dần và 5 giá hữu hạn, dương.



<!-- 25 giây. Lời nói: Các edge case được xử lý tường minh. Dưới 60 phiên thì từ chối. NaN, vô cực hoặc giá không dương phải kiểm tra nguồn, không tự điền bừa. Ngày được sắp xếp, nhưng bản ghi trùng xung đột cần xử lý trước khi chạy. Ngày nghỉ theo lịch sàn. Với chia tách cổ phiếu, phải nhất quán cách điều chỉnh giá. Cache có timestamp và checkpoint phải khớp scaler. Kiểm tra đầu ra đúng năm ngày, đúng thứ tự và giá hợp lệ. -->

---
## DESIGN / 09 · SECURITY · PERFORMANCE · READABILITY

# An toàn, hiệu quả và dễ bảo trì

SECURITY

Whitelist ticker; giới hạn input.Chỉ nạp checkpoint tin cậy.Giới hạn đường dẫn artifact.HTTP mở rộng: auth + rate limit.



PERFORMANCE

Cache dữ liệu; load model một lần.Batch inference, eval/no_grad.Đo latency p50/p95 và train time.Ghi rõ phần cứng benchmark.



READABILITY

Một module, một trách nhiệm.Config tập trung; type/shape rõ.Thông báo lỗi có ý nghĩa.Test ranh giới và input lỗi.





Chưa benchmark: không tuyên bố tốc độ hoặc độ chính xác đã đạt.



<!-- 25 giây. Lời nói: Thiết kế bảo mật giới hạn ticker, kích thước input và đường dẫn artifact, chỉ nạp checkpoint tin cậy, không nhận pickle tùy ý. Nếu có HTTP service thì cần xác thực và rate limit. Hiệu năng dùng cache, tải model một lần và batch inference; đo p50 p95 cùng thời gian train trên phần cứng công bố. Về readability, module có trách nhiệm riêng, cấu hình tập trung, shape rõ và thông báo lỗi có ý nghĩa. Chưa benchmark nên không tuyên bố nhanh hơn. -->

---
## DESIGN / 10 · MILESTONES & TECH RISKS

# Kế hoạch và rủi ro kỹ thuật

TUẦN 1Dữ liệu + split/scaler đúng + baseline chạy được.

TUẦN 2LSTM / CNN + chọn checkpoint bằng Validation.

TUẦN 3Test + phân tích lỗi + demo và artifact tái lập.



API lỗi / rate limitCache có timestamp; retry có giới hạn.

Leakage / overfitTest cutoff/window; early stopping trên Validation.

Thị trường đổi chế độPhân tích sai số theo giai đoạn; nêu giới hạn.



Bàn giao: pipeline tái lập + dự báo 5 phiên + so sánh thực nghiệm.



<!-- 25 giây. Lời nói: Tuần một hoàn thành dữ liệu, chia tập và baseline. Tuần hai hoàn thành LSTM CNN và chọn checkpoint bằng validation. Tuần ba test, phân tích lỗi và đóng gói demo. Rủi ro API được giảm bằng cache có timestamp và retry giới hạn, không lặng lẽ dùng cache quá cũ. Leakage được kiểm tra bằng cutoff window, overfit bằng early stopping. Thị trường đổi chế độ phải thể hiện qua phân tích lỗi theo giai đoạn. Sản phẩm cuối là pipeline tái lập, dự báo năm phiên và so sánh có bằng chứng. -->
