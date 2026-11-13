# Stock Price Forecasting For Deep Learning
## Dự báo giá cổ phiếu, thực nghiệm trên NVIDIA (NVDA).

**10-Minute Project Presentation — Content Specification**
Cập nhật: 2026-11-13. Nội dung đã tái cấu trúc theo human review; HTML được đồng bộ trong cùng lượt triển khai.

## 1. Presentation Overview

- **Mục tiêu:** giải thích bài toán, dữ liệu, thiết kế học sâu, kiến trúc và cách kiểm chứng của chính dự án.
- **Đối tượng:** giảng viên và sinh viên học Deep Learning.
- **Ngôn ngữ:** tiếng Việt; giữ thuật ngữ kỹ thuật cần thiết. Tên tiếng Anh giữ đúng câu human chốt, gồm từ “For”.
- **Thời lượng:** ngân sách 600 giây = 10:00; Q&A ngoài thời lượng.
- **Core narrative:** FROM PROBLEM TO PREDICTION.
- **Mạch:** Problem → Data → Task Definition → Data Preparation → Deep Learning Model → System Implementation → Experimental Evidence → Conclusion. Thứ tự mới đã duyệt: Cover → Data → Formulation → Preparation → Model → Architecture → Modules → Evaluation → Milestones → Conclusion. WHAT–WHY–WHO được lồng vào cover/lời dẫn, không còn slide riêng.
- **Phương pháp:** kết hợp chữ và visual thông tin + các Card UI, hay bảng hay cách thức nào đó hợp lí. bố cục hợp lí phải chia nằm gọn trong 1 trang
chia thành header, section và footer
- **Phạm vi chỉnh sửa được duyệt:** đồng bộ Markdown, HTML/CSS/JS và design tokens trong thư mục hiện tại; thêm font Be Vietnam Pro và MathJax local, hình minh họa SVG; không sửa code ML hoặc thay yêu cầu DEFINE/DESIGN.
- **Quy ước HTML tương lai:** chỉ On-slide Content là chữ chính trên slide; không dồn speaker script, source evidence và checklist lên màn hình.
- **Trạng thái nội dung:** yêu cầu đã chốt được tách khỏi hiện thực. Các stage ML mang nhãn **[PLANNED]** dù thiết kế đã xác nhận; **[IMPLEMENTED]** chỉ dùng cho artifact thực tồn tại và được kiểm tra. Thiếu evidence ghi **[NEEDS VERIFICATION: …]**.

## 2. Project Facts & Verification

### 2.1. Facts đã đối chiếu

| Nội dung | Quyết định / evidence | Trạng thái |
|---|---|---|
| Tên trình bày | Tên và tiêu đề phụ đầu tài liệu, theo human mới nhất | CONFIRMED; tên cũ trong tài liệu khác chưa đổi |
| Task | Hồi quy Close NVDA; single-step và multi-step | CONFIRMED |
| Dữ liệu | Yahoo Finance/yfinance, 5y mới nhất lấy được, 1d, USD, auto_adjust=False (không tự điều chỉnh OHLC theo Adj Close; Close Yahoo vẫn split-adjusted) | CONFIRMED |
| Feature/target | Lịch sử Close, F=1 → Close tương lai; raw OHLCV (giá mở/cao/thấp/đóng cửa và khối lượng) không tự thành features | CONFIRMED |
| IO | L=60, H=1/5; X=(B,60,1), CNN chuyển (B,1,60), Y=(B,H) | CONFIRMED|
| Split | 70/15/15 theo thời gian, khóa biên trước EDA; giữ biên sau cleaning | CONFIRMED |
| Mạng | LSTM 2 lớp, hidden64/dropout0.2 cơ sở; CNN C→C/2, kernel3, padding1 | Thiết kế xác nhận; [PLANNED] code |
| Multi-step | Recursive reuse H=1; Direct multi-output học H=5 | CONFIRMED / [PLANNED] |
| Baseline | LR dùng 60 Close; ARIMA A fit toàn train, (5,1,0), trend='n', append(refit=False) khi có actual mới | CONFIRMED / [PLANNED] |
| Tuning | Optuna, 4 study × 10 trial, tổng tối đa 40; không còn giới hạn 4 cấu hình/họ | CONFIRMED / [PLANNED] |
| Training | AdamW, MSE scaled, batch32, seed42, tối đa50 epoch/trial, patience10 | CONFIRMED / [PLANNED] |
| Evaluation | Rolling-origin, chung cohort đủ H5; không retrain bằng test; inverse scaling trước metric | CONFIRMED / [PLANNED] |
| Artifacts hiện có | Config, tài liệu; src/__init__.py, tests/__init__.py; README module | [IMPLEMENTED] khung, không phải ML pipeline |
| Kết quả | Không có run/checkpoint/dataset snapshot được thấy trong inventory; walkthrough để bảng trống | [NEEDS VERIFICATION: kết quả chưa có evidence] |

### 2.2. Chi tiết kỹ thuật cho người soạn slide

- **Search space:** learning rate 1e-4…1e-2 log; AdamW weight decay 1e-6…1e-3 log; LSTM hidden/CNN channels trong {32,64,128}. Cấu hình cơ sở hidden64/C64 nằm trong phạm vi, không gọi là tối ưu.
- **Sampler/pruner:** TPE seed42, startup3; MedianPruner startup5 trial hoàn thành, warmup10. Không hứa trial6 chắc chắn bị xét/cắt hoặc pruning sẽ tiết kiệm bao nhiêu.
- **Scheduler/gradient:** CosineAnnealingLR, T_max50, eta_min0; clip norm1.0 theo DESIGN. Chưa kiểm qua runtime.
- **Checkpoint:** chọn theo validation; test không được chọn checkpoint. Thiết kế dùng best checkpoint train-only chưa mở thêm bước refit train+val; chi tiết gate/schema là thiết kế cần triển khai.
- **Metrics:** MAE=mean(|e|), MSE=mean(e²), RMSE=sqrt(MSE), với e=actual−predicted. MAE/RMSE đơn vị USD; MSE giá gốc USD², loss MSE scaled phải ghi nhãn riêng.
- MAE/MSE/RMSE/MAPE báo từng h và gộp N×H cặp. RMSE gộp là căn của MSE gộp, không trung bình RMSE từng bước. R² gộp là trung bình đều R² theo bước; undefined không bỏ ngầm.
- MAPE actual=0 ghi undefined/lý do; không thêm epsilon hay bỏ mẫu ngầm. Gần0 phải nêu độ nhạy.
- DA so hướng dự báo và actual so với Close tại forecast origin, sign(0)=0; bước1 là chính, bước2…5 bổ sung. DA không đo lợi nhuận.
- Rolling-origin dùng actual mới khi thời gian tiến tới origin sau; trong một forecast H5, recursive không nhìn actual của năm bước chưa xuất hiện.
- Cùng snapshot/split/target/origins để so sánh; công bố ARIMA dùng lịch sử fit toàn train khác window60 của DL/LR. Không gọi mọi model có cùng độ dài lịch sử.
- Không thêm Naive, mô hình mới hoặc feature mới chỉ để khớp dàn ý chung.

### 2.3. Missing information và inconsistencies

| Vấn đề | Bằng chứng / cách xử lý trong bản trình bày |
|---|---|
| Tên cũ trong DEFINE và tài liệu ngoài presentation | Dùng tên cover mới đã duyệt; Markdown/HTML/tokens đã đồng bộ. Không sửa DEFINE/DESIGN trong lượt redesign |
| Prompt đính kèm vẫn có STOCKVISION và đường dẫn mới | Chỉ dẫn trực tiếp và câu trả lời human ưu tiên: tên mới, cập nhật file hiện tại |
| README/5min/walkthrough roadmap dùng src/data và tên file cũ | Dùng phân lớp và src/datasets của DESIGN hiện hành; gọi rõ là thiết kế. Thư mục thực có README nhưng chưa có file thuật toán |
| DEFINE một số chỗ storage còn TBD trong khi DESIGN duyệt SQLite | Ghi lựa chọn thiết kế Optuna SQLite trong run, chưa claim có database/resume đã chạy; không tự sửa nguồn |
| Skills generic đặt EDA trước split, đơn vị VNĐ, Huber hoặc ngưỡng overfit về0 | Không áp dụng các phần trái yêu cầu đã chốt: split trước EDA, USD, MSE; ngưỡng sanity còn cần plan kiểm thử |
| Snapshot/data quality | [NEEDS VERIFICATION: range thực tế, số dòng, schema nguồn, missing/duplicate/outlier]; không suy ra 5 năm bằng một số phiên cố định |
| Cleaning/features | [NEEDS VERIFICATION: findings EDA và human policy]; không tự chọn fill, drop, IQR, Z-score hoặc thêm chỉ báo |
| Runtime | requirements chỉ lower bounds; thiếu Optuna. [NEEDS VERIFICATION: phiên bản tương thích, Kaggle GPU/runtime và thư viện lịch NASDAQ] |
| Chi tiết triển khai | [NEEDS VERIFICATION: rounding split, policy gap/window, tolerance save/load, ngưỡng sanity overfit, UI Notebook]; không biến proposed contract thành code |
| Experiments | Chưa có log, checkpoint, benchmark hoặc metrics; không kết luận thắng, nhanh hơn hay ý nghĩa thống kê |

## 3. Slide-by-Slide Content

Nội dung dưới đây theo plan đã duyệt: ưu tiên sơ đồ/bảng, mỗi slide một trọng tâm, font Be Vietnam Pro. On-slide Content là thông tin cần có; HTML có thể chia chúng thành labels, nodes, table cells và công thức, không chép nguyên bullet dài.

### Slide 01 - Stock Price Forecasting For Deep Learning

**Duration:** 00:20

**Main message:** Dự báo giá cổ phiếu, thực nghiệm trên NVIDIA (NVDA).

**Objective:** Giới thiệu đề tài: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Stock Price Forecasting For Deep Learning
- Dự báo giá cổ phiếu, thực nghiệm trên NVIDIA (NVDA).
- Bài toán: Time-series Regression — Hồi quy chuỗi thời gian.
- Mô hình: LSTM / 1D-CNN. Đối chứng: Linear Regression / ARIMA.
- Mục tiêu: từ 60 phiên Close, dự báo và kiểm chứng 5 phiên tiếp theo.

**Visual Direction:** Tiêu đề trái, hình dữ liệu→mạng→5 đầu ra bên phải; footer ba thông tin regression/models/baselines. Hình chỉ minh họa khái niệm, không phải đường giá hoặc kết quả.

**Diagram / Chart Specification:** Tiêu đề trái, hình dữ liệu→mạng→5 đầu ra bên phải; footer ba thông tin regression/models/baselines. Hình chỉ minh họa khái niệm, không phải đường giá hoặc kết quả. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Kính chào thầy cô và các bạn. Đề tài nghiên cứu dự báo giá cổ phiếu bằng học sâu, thực nghiệm trên NVIDIA. Đây là bài toán hồi quy chuỗi thời gian, phục vụ tham khảo diễn biến giá cho người phân tích. Nhóm so sánh LSTM và CNN một chiều với Linear Regression và ARIMA. Nội dung hôm nay trình bày thiết kế; chưa có kết quả huấn luyện.

**Source Evidence:** DEFINE §2–4; DESCRIPTION mục 3–6; human duyệt tên và bố cục mới.

**Transition:** Trước tiên, dữ liệu nào sẽ được sử dụng?

### Slide 02 - Nguồn dữ liệu và đặc điểm bộ dữ liệu

**Duration:** 01:00

**Main message:** Phân biệt dữ liệu thu thập, feature được chọn và chất lượng cần kiểm tra.

**Objective:** Data Understanding: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Nguồn dự kiến: Yahoo Finance qua yfinance, phục vụ dự báo Close NVDA.
- Bảng: NVDA — NASDAQ; 5 năm gần nhất lấy được; interval=1d; kích thước/ngày đầu-cuối: chờ snapshot.
- Raw dự kiến: Date, Open, High, Low, Close, Adj Close, Volume; corporate actions đối chiếu.
- OHLCV: giá mở/cao/thấp/đóng cửa và khối lượng. Feature cơ sở chỉ Close.
- auto_adjust=False: không tự điều chỉnh OHLC theo Adj Close; Close Yahoo vẫn điều chỉnh chia tách.
- Quality checklist: missing, duplicate, outlier, calendar gaps — chưa có findings thực.

**Visual Direction:** Đoạn giới thiệu ngắn; bảng facts trái; sơ đồ raw→Close phải; quality strip ở đáy. Không có dòng dữ liệu NVDA giả.

**Diagram / Chart Specification:** Đoạn giới thiệu ngắn; bảng facts trái; sơ đồ raw→Close phải; quality strip ở đáy. Không có dòng dữ liệu NVDA giả. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Nguồn dự kiến là Yahoo Finance thông qua yfinance. Mã nghiên cứu là NVDA trên NASDAQ, đơn vị USD, lấy năm năm gần nhất có thể thu thập. Interval một ngày nghĩa là một dòng mỗi phiên giao dịch, không phải mọi ngày lịch. Bảng bên trái nêu phạm vi đã chốt; số dòng cùng ngày đầu và cuối chỉ được điền sau khi có snapshot. OHLCV là giá mở cửa, cao nhất, thấp nhất, đóng cửa và khối lượng. Dữ liệu có nhiều cột nhưng feature cơ sở chỉ là lịch sử Close. Auto adjust bằng false nghĩa là không yêu cầu yfinance tự điều chỉnh các cột OHLC theo Adj Close; Close Yahoo vẫn có điều chỉnh chia tách. Missing, trùng phiên và outlier hiện là danh sách cần kiểm tra, chưa phải lỗi đã phát hiện.

**Source Evidence:** DEFINE §4.1; config/default_config.yaml data; DESCRIPTION mục 5; inventory data/.

**Transition:** Sau khi xác định nguồn, ta phát biểu chính xác mô hình nhận gì và dự báo gì.

### Slide 03 - Phát biểu bài toán dự báo chuỗi thời gian

**Duration:** 00:55

**Main message:** Lookback L=60 là lịch sử đầu vào; horizon H=5 là độ dài chuỗi cần dự báo.

**Objective:** Problem Formulation: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Timeline: c(t−59)…c(t) | origin t | c(t+1)…c(t+5).
- LaTeX: x_t=[c_{t-59},\ldots,c_t]^\mathsf{T}\in\mathbb{R}^{60\times1}.
- LaTeX: \hat{y}_t=f_\theta(x_t), y_t=[c_{t+1},\ldots,c_{t+5}]^\mathsf{T}\in\mathbb{R}^{5}.
- Tensors: LSTM (B,60,1); CNN (B,1,60); output (B,H).
- B: batch size; F=1 Close. Single-step H=1; multi-step H=5.

**Visual Direction:** Timeline nhân quả lớn; hai công thức LaTeX render MathJax SVG; ba nhãn tensor. Không hiển thị mã LaTeX thô như nội dung chính.

**Diagram / Chart Specification:** Timeline nhân quả lớn; hai công thức LaTeX render MathJax SVG; ba nhãn tensor. Không hiển thị mã LaTeX thô như nội dung chính. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Gọi c tại t là giá đóng cửa của phiên t. Tại origin t, mô hình nhận sáu mươi giá đã quan sát, từ t trừ năm mươi chín đến t. Đó là vector đầu vào x. Hàm dự báo có tham số theta trả về chuỗi giá ước lượng; nhãn cần đối chiếu là năm Close thực tế sau origin. Vì target là giá trị liên tục, đây là hồi quy, không phải phân loại tăng giảm. Trên timeline, vùng lịch sử và vùng tương lai được tách bằng biên t. Khi gom thành batch, LSTM nhận B, sáu mươi, một; CNN đổi chiều để convolve theo thời gian. B là số mẫu, còn một là số feature Close. Ngoài bài toán năm bước, nhóm còn học model một bước để dùng cho recursive.

**Source Evidence:** DEFINE §4.1–4.3; DESIGN §5.8; walkthrough §1.1.

**Transition:** Hợp đồng đầu vào và target này quyết định các bước chuẩn bị dữ liệu.

### Slide 04 - Chuẩn bị dữ liệu và kiểm soát rò rỉ thông tin

**Duration:** 01:10

**Main message:** Chia và khóa biên ngày trước EDA; mọi phép học thống kê chỉ dựa trên train.

**Objective:** Data Preparation: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Thu thập/cache → kiểm tối thiểu ngày/schema → fixed split.
- 70% Train | 15% Validation | 15% Test; giữ thứ tự thời gian.
- Train EDA → human duyệt policy → cleaning/features.
- Fit MinMaxScaler trên train → transform val/test → windows X/Y.
- Giữ biên ngày sau cleaning; không lấy tương lai; target nằm trọn trong split.

**Visual Direction:** Hai hàng pipeline nối bằng mũi tên; thanh split theo tỷ lệ; human gate amber; ba invariants ở đáy, không chép lại toàn flow thành bullets.

**Diagram / Chart Specification:** Hai hàng pipeline nối bằng mũi tên; thanh split theo tỷ lệ; human gate amber; ba invariants ở đáy, không chép lại toàn flow thành bullets. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Trước EDA, nhóm kiểm tối thiểu để đọc đúng schema và trục ngày, rồi chia theo thời gian bảy mươi, mười lăm, mười lăm và khóa biên. EDA chỉ khảo sát train để đề xuất cách xử lý dữ liệu. Những giá trị thiếu, bản ghi trùng hoặc outlier phải được hiển thị cho human xem trước khi chọn policy. Một điểm giá khác thường chưa chắc là lỗi nên không tự động xóa theo IQR. Sau khi được duyệt, policy được áp dụng cho từng tập. Nếu số dòng thay đổi, nhóm giữ nguyên biên ngày và báo lại counts, không chuyển ngày validation sang train để bù tỷ lệ. MinMaxScaler chỉ fit train, sau đó transform validation và test. Cuối cùng tạo windows theo hợp đồng sáu mươi đến năm. Mọi target phải nằm trọn trong tập đích và mọi feature phải có sẵn tại origin. Cách xử lý window qua khoảng thiếu phiên cần dựa trên EDA và được duyệt.

**Source Evidence:** DEFINE §4.2–4.3; DESIGN §4; walkthrough §2.1–2.2.

**Transition:** Các windows đó trở thành đầu vào chung cho hai mạng học sâu.

### Slide 05 - Thiết kế mô hình LSTM và 1D-CNN

**Duration:** 01:20

**Main message:** Hai cách xử lý cùng chuỗi Close; so sánh bằng thực nghiệm, chưa kết luận mô hình thắng.

**Objective:** Model Design: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- LSTM: (B,60,1) → 2 lớp LSTM → bước cuối → Linear(H). Hidden cơ sở64; dropout0.2.
- CNN: Conv1d(1,C,3,pad1) → BN/ReLU/MaxPool2 → Conv1d(C,C/2,3,pad1) → BN/ReLU → AdaptiveAvgPool1/Flatten → Dropout0.2/Linear(H). C cơ sở64.
- Recursive: H=1 → đưa giá dự báo vào window → lặp5 bước; không đọc actual tương lai.
- Direct multi-output: model H=5 → trả5 giá trong một lần.

**Visual Direction:** Hai lane mạng có shape/layer/group rõ; phần dưới hai mini-flow recursive/direct. Không dùng neuron trang trí thay sơ đồ layer.

**Diagram / Chart Specification:** Hai lane mạng có shape/layer/group rõ; phần dưới hai mini-flow recursive/direct. Không dùng neuron trang trí thay sơ đồ layer. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

LSTM xử lý các quan sát theo trình tự và duy trì trạng thái giữa các bước. Thiết kế cơ sở dùng hai lớp với hidden size sáu mươi tư và dropout không phẩy hai. Output tại bước cuối đi qua lớp linear để tạo một hoặc năm giá. CNN một chiều áp bộ lọc dọc chiều thời gian để học các mẫu cục bộ. Block đầu có convolution, BatchNorm, ReLU rồi MaxPool. Block thứ hai cũng có BatchNorm và ReLU. Sau đó Adaptive Average Pooling, Flatten, Dropout và Linear tạo đầu ra. Kernel bằng ba, padding bằng một; số kênh cơ sở là sáu mươi tư rồi ba mươi hai. Phần dưới mô tả hai chiến lược: recursive dùng model một bước, lấy giá dự báo đưa vào cửa sổ rồi dự báo tiếp. Direct multi-output trả cả năm giá trong một lần. Recursive có thể truyền sai số qua các bước; direct gắn với horizon huấn luyện. Chưa có bằng chứng để nói mạng hoặc chiến lược nào tốt hơn.

**Source Evidence:** DESIGN §5.7 models; walkthrough §2.3; DEFINE F03/F07/F08.

**Transition:** Kiến trúc mạng là một phần của hệ thống từ nguồn dữ liệu đến kết quả.

### Slide 06 - Kiến trúc tổng thể của hệ thống

**Duration:** 00:55

**Main message:** Sáu lớp theo DESIGN; tách xử lý dữ liệu, học mô hình, dự báo và đánh giá.

**Objective:** System Architecture: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- L5 Presentation: Notebook + pipeline.py; điều phối và hiển thị.
- L1 Data → L2 Modeling → L3 Inference → L4 Evaluation.
- Cạnh dữ liệu: snapshot/X,Y → checkpoint+scaler → predictions → metrics/plots.
- L0 Foundation: config, seed, IO, hash, provenance, errors.
- Raw snapshot: data/raw/; artifact theo run: outputs/runs/<run_id>/.

**Visual Direction:** L5 orchestration rail ở trên; 4 khối L1→L4 ở giữa với arrow labels; L0 shared services ở dưới; storage band cuối. Không giả phụ thuộc import theo thứ tự flow.

**Diagram / Chart Specification:** L5 orchestration rail ở trên; 4 khối L1→L4 ở giữa với arrow labels; L0 shared services ở dưới; storage band cuối. Không giả phụ thuộc import theo thứ tự flow. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Sơ đồ này mô tả kiến trúc hệ thống, khác với các lớp bên trong mạng vừa trình bày. DESIGN có sáu lớp. Presentation gồm Notebook và pipeline điều phối, không chứa toàn bộ thuật toán. Data xử lý nguồn, split và preprocessing. Modeling gồm kiến trúc và huấn luyện. Inference dùng model đã chọn để tạo dự báo; Evaluation đọc dự báo cùng actual để tính chỉ số và biểu đồ. Foundation hỗ trợ xuyên suốt bằng cấu hình, seed, IO và thông tin truy vết. Mũi tên giữa các lớp có nhãn đầu ra cụ thể: windows, checkpoint kèm scaler, prediction rồi metrics. Đây là luồng dữ liệu, không phải sơ đồ import. Evaluation không cần import trainer hay model để đọc prediction CSV. Raw snapshot và artifacts theo run giúp truy ngược kết quả về dữ liệu và cấu hình. Đây là kiến trúc mục tiêu, chưa phải hệ thống ML đã chạy.

**Source Evidence:** DESIGN §1.2–1.5; §4; §5.3.

**Transition:** Từ các lớp lớn, ta xác định module cụ thể đảm nhận từng công việc.

### Slide 07 - Thiết kế module và luồng thực thi

**Duration:** 01:00

**Main message:** Mỗi module nhận dữ liệu tường minh và xuất artifact cho bước kế tiếp.

**Objective:** Implementation Modules: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- src/datasets/: collect/validate → split → EDA/review → clean/scale/windows.
- src/models/ + src/training/: LSTM/CNN, LR/ARIMA; train/validation, tuning, checkpoint.
- src/predict/: single-step, recursive, direct, rolling-origin → prediction CSV.
- src/evaluation/: alignment, metrics, residuals, plots → metrics/plots.
- src/pipeline.py điều phối, src/utils/ + config/ dùng chung. Khung hiện có; module thuật toán còn planned.

**Visual Direction:** Bảng/sơ đồ 4 hàng: module | trách nhiệm + tên hàm tiêu biểu | output. Luồng đọc từ trên xuống, xuất artifacts bên phải; orchestration/shared utilities ở dải trên.

**Diagram / Chart Specification:** Bảng/sơ đồ 4 hàng: module | trách nhiệm + tên hàm tiêu biểu | output. Luồng đọc từ trên xuống, xuất artifacts bên phải; orchestration/shared utilities ở dải trên. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Tại cấp module, datasets nhận request và raw data, khóa split trước EDA rồi tạo windows cùng scaler và manifest. EDA và cleaning không gọi qua lại: pipeline truyền train cho EDA, dừng human review rồi truyền policy được duyệt cho cleaning. Models định nghĩa mạng và baseline; training quản lý vòng học, validation, tuning và checkpoint. Predict nhận lịch sử tới origin cùng model/scaler để tạo prediction CSV. Evaluation căn chỉnh prediction với actual, tính metrics và xuất biểu đồ. Các tên hàm trên sơ đồ là hợp đồng thiết kế trong DESIGN, không phải bằng chứng code đã tồn tại. Hiện src chỉ có initializer và README module. Điểm cần xây dựng tiếp là các implementation và tests cho cutoff, shapes, xử lý input sai, save/load và tính metrics. Notebook sẽ gọi chung pipeline thay vì viết lại logic.

**Source Evidence:** DESIGN §2.1, §4, §5.7; src/ inventory; README §4.2.

**Transition:** Những module này phải tạo đủ bằng chứng cho thiết kế thực nghiệm.

### Slide 08 - Thiết kế thực nghiệm và phương pháp đánh giá

**Duration:** 01:25

**Main message:** Chọn bằng validation; khóa lựa chọn rồi đánh giá cùng origins trên test.

**Objective:** Experiment & Evaluation: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Ma trận: LSTM/CNN × single-step/Direct-5; 10 trial mỗi ô, tối đa40; recursive reuse single.
- AdamW; MSE scaled; tối đa50 epoch/trial; patience10.
- Baseline LR dùng60 Close; ARIMA A (5,1,0), trend='n', toàn train, append(refit=False).
- Rolling-origin H5: actual mới chỉ khi xuất hiện; không retrain test.
- Inverse scaling → MAE/RMSE USD; MSE USD² chi tiết; bổ sung MAPE/R²/DA. Chưa có kết quả.

**Visual Direction:** 2×2 experiment matrix; baseline strip; rolling-origin hai hàng; LaTeX MAE/RMSE; không có số liệu kết quả giả.

**Diagram / Chart Specification:** 2×2 experiment matrix; baseline strip; rolling-origin hai hàng; LaTeX MAE/RMSE; không có số liệu kết quả giả. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Ma trận thực nghiệm gồm hai họ mạng nhân hai đầu ra: single-step và direct năm bước. Mỗi ô là mười trial Optuna, tổng tối đa bốn mươi. Recursive dùng lại model single-step. Huấn luyện dùng AdamW, objective MSE scaled, tối đa năm mươi epoch với early stopping patience mười. Validation chọn cấu hình và checkpoint; chỉ sau khi khóa lựa chọn mới mở test. Hai baseline là Linear Regression và ARIMA A. LR nhìn cửa sổ sáu mươi Close; ARIMA fit toàn train với order năm, một, không và không drift. Khác biệt lịch sử này cần công bố. Rolling-origin dự báo năm bước tại t; sang t cộng một mới được thêm actual vừa xuất hiện. ARIMA chỉ cập nhật trạng thái bằng refit false, không học lại tham số. Trước metric, giá phải inverse-scale về USD. MAE là độ lệch tuyệt đối trung bình; RMSE nhạy hơn với lỗi lớn. MSE giá gốc dùng USD bình phương, khác loss scaled. Báo từng bước và tổng hợp; chưa có kết quả để xác định model thắng.

**Source Evidence:** DEFINE §6.2, §7.2–7.6; DESIGN §4.4, §5.7; walkthrough §2.4.

**Transition:** Để tạo được evidence đó, dự án cần các mốc triển khai và kiểm soát rủi ro.

### Slide 09 - Kế hoạch triển khai và quản lý rủi ro

**Duration:** 00:55

**Main message:** Mỗi đầu việc gắn với sản phẩm có thể review; tiến độ ML chưa được xác nhận hoàn thành.

**Objective:** Milestones & Risks: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Khảo sát nghiệp vụ/chốt phạm vi → phiếu đăng ký, tình huống sử dụng.
- Chuẩn bị dữ liệu → snapshot/dữ liệu mẫu, mô tả trường.
- Thiết kế đánh giá → kịch bản test, giao thức so sánh.
- Baseline → kết quả mốc so sánh. Giải pháp tối thiểu → pipeline hoàn chỉnh, Notebook.
- Leakage → split/scaler train-only; overfit → validation/early stopping; API/regime shift → snapshot/cache, phân tích giới hạn.

**Visual Direction:** Bảng 5 hàng công việc→deliverable; sidebar 3 risk→mitigation. Không ghi done/% giả cho mốc ML.

**Diagram / Chart Specification:** Bảng 5 hàng công việc→deliverable; sidebar 3 risk→mitigation. Không ghi done/% giả cho mốc ML. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Các công việc được gắn với sản phẩm bàn giao cụ thể. Khảo sát nghiệp vụ và chốt phạm vi tạo phiếu đăng ký cùng tình huống sử dụng. Chuẩn bị dữ liệu phải có snapshot hoặc mẫu thật và mô tả trường. Thiết kế đánh giá tạo kịch bản test cùng giao thức so sánh. Baseline cần tạo kết quả làm mốc. Giải pháp tối thiểu phải có luồng xử lý hoàn chỉnh và Notebook demo. Hiện tài liệu và config đã có nhưng chưa có evidence hoàn thành các đầu việc ML. Leakage có thể làm sai số tốt giả nên cần kiểm split và scaler. Overfit được theo dõi qua validation và early stopping. API lỗi hoặc dữ liệu bị sửa cần snapshot có hash; biến động chế độ thị trường cần được phân tích như giới hạn mô hình.

**Source Evidence:** DESCRIPTION mục10 và bảng Công việc/Kết quả; DESIGN §6–7; inventory outputs/.

**Transition:** Cuối cùng, đề tài đã xác lập được gì và còn cần chứng minh gì?

### Slide 10 - Kết luận và định hướng triển khai

**Duration:** 01:00

**Main message:** Giá trị nghiên cứu nằm ở dự báo đi cùng một quy trình kiểm chứng truy vết được.

**Objective:** Conclusion: giải thích nội dung qua visual có nguồn và đúng trạng thái triển khai.

**On-slide Content:**

- Đã xác lập: NVDA Close,60→1/5; LSTM/CNN; LR/ARIMA; giao thức đánh giá.
- Cần chứng minh: sai số so baseline, recursive vs direct, runtime và giới hạn.
- Hướng tới: pipeline+Notebook, checkpoint+scaler, predictions/metrics và phân tích lỗi.
- Tiếp theo: snapshot → EDA/human review → implementation/tests → experiments.
- Một ticker, dữ liệu lịch sử; chưa chứng minh hiệu quả đầu tư.

**Visual Direction:** Ba cột Đã xác lập / Cần chứng minh / Sản phẩm; cuối là next-step pipeline. Không kết luận model superiority.

**Diagram / Chart Specification:** Ba cột Đã xác lập / Cần chứng minh / Sản phẩm; cuối là next-step pipeline. Không kết luận model superiority. Dùng header/title/footer cùng tọa độ; không có chart số liệu thực nghiệm khi chưa có artifact.

**Speaker Script:**

Kết lại, dự án đặt một bài toán cụ thể: dùng lịch sử Close NVDA để dự báo giá nhiều phiên và kiểm chứng LSTM cùng CNN so với Linear Regression, ARIMA. Những gì đã xác lập là hợp đồng dữ liệu, kiến trúc, ngân sách và giao thức đánh giá. Những điều còn phải chứng minh là sai số thực tế, khác biệt recursive với direct, thời gian chạy và giới hạn tổng quát hóa. Sản phẩm hướng tới gồm pipeline, Notebook, checkpoint đi kèm scaler cùng predictions và metrics truy vết được. Bước tiếp theo là lấy snapshot thật, EDA và duyệt policy rồi triển khai, kiểm thử và chạy thí nghiệm. Chỉ khi có kết quả trên dữ liệu chưa dùng để lựa chọn mô hình mới có thể bàn về cải thiện. Một ticker và một giai đoạn lịch sử không đại diện mọi thị trường. Đây không phải bằng chứng hiệu quả đầu tư. Xin cảm ơn thầy cô và các bạn.

**Source Evidence:** DEFINE §4.4, §7.6–7.7; DESIGN §6; walkthrough §3; human review.

**Transition:** Kết thúc10 phút; Q&A ngoài ngân sách.

## 4. Complete 10-Minute Speaker Script

Bài nói ghép notes và transitions cùng thứ tự. Timing là ngân sách600 giây, cần tập nói thực tế để xác nhận; sơ đồ được giải thích trong thời gian của từng slide.

**00:00–00:20 · Slide 01 — Stock Price Forecasting For Deep Learning**

Kính chào thầy cô và các bạn. Đề tài nghiên cứu dự báo giá cổ phiếu bằng học sâu, thực nghiệm trên NVIDIA. Đây là bài toán hồi quy chuỗi thời gian, phục vụ tham khảo diễn biến giá cho người phân tích. Nhóm so sánh LSTM và CNN một chiều với Linear Regression và ARIMA. Nội dung hôm nay trình bày thiết kế; chưa có kết quả huấn luyện.

Trước tiên, dữ liệu nào sẽ được sử dụng?

**00:20–01:20 · Slide 02 — Nguồn dữ liệu và đặc điểm bộ dữ liệu**

Nguồn dự kiến là Yahoo Finance thông qua yfinance. Mã nghiên cứu là NVDA trên NASDAQ, đơn vị USD, lấy năm năm gần nhất có thể thu thập. Interval một ngày nghĩa là một dòng mỗi phiên giao dịch, không phải mọi ngày lịch. Bảng bên trái nêu phạm vi đã chốt; số dòng cùng ngày đầu và cuối chỉ được điền sau khi có snapshot. OHLCV là giá mở cửa, cao nhất, thấp nhất, đóng cửa và khối lượng. Dữ liệu có nhiều cột nhưng feature cơ sở chỉ là lịch sử Close. Auto adjust bằng false nghĩa là không yêu cầu yfinance tự điều chỉnh các cột OHLC theo Adj Close; Close Yahoo vẫn có điều chỉnh chia tách. Missing, trùng phiên và outlier hiện là danh sách cần kiểm tra, chưa phải lỗi đã phát hiện.

Sau khi xác định nguồn, ta phát biểu chính xác mô hình nhận gì và dự báo gì.

**01:20–02:15 · Slide 03 — Phát biểu bài toán dự báo chuỗi thời gian**

Gọi c tại t là giá đóng cửa của phiên t. Tại origin t, mô hình nhận sáu mươi giá đã quan sát, từ t trừ năm mươi chín đến t. Đó là vector đầu vào x. Hàm dự báo có tham số theta trả về chuỗi giá ước lượng; nhãn cần đối chiếu là năm Close thực tế sau origin. Vì target là giá trị liên tục, đây là hồi quy, không phải phân loại tăng giảm. Trên timeline, vùng lịch sử và vùng tương lai được tách bằng biên t. Khi gom thành batch, LSTM nhận B, sáu mươi, một; CNN đổi chiều để convolve theo thời gian. B là số mẫu, còn một là số feature Close. Ngoài bài toán năm bước, nhóm còn học model một bước để dùng cho recursive.

Hợp đồng đầu vào và target này quyết định các bước chuẩn bị dữ liệu.

**02:15–03:25 · Slide 04 — Chuẩn bị dữ liệu và kiểm soát rò rỉ thông tin**

Trước EDA, nhóm kiểm tối thiểu để đọc đúng schema và trục ngày, rồi chia theo thời gian bảy mươi, mười lăm, mười lăm và khóa biên. EDA chỉ khảo sát train để đề xuất cách xử lý dữ liệu. Những giá trị thiếu, bản ghi trùng hoặc outlier phải được hiển thị cho human xem trước khi chọn policy. Một điểm giá khác thường chưa chắc là lỗi nên không tự động xóa theo IQR. Sau khi được duyệt, policy được áp dụng cho từng tập. Nếu số dòng thay đổi, nhóm giữ nguyên biên ngày và báo lại counts, không chuyển ngày validation sang train để bù tỷ lệ. MinMaxScaler chỉ fit train, sau đó transform validation và test. Cuối cùng tạo windows theo hợp đồng sáu mươi đến năm. Mọi target phải nằm trọn trong tập đích và mọi feature phải có sẵn tại origin. Cách xử lý window qua khoảng thiếu phiên cần dựa trên EDA và được duyệt.

Các windows đó trở thành đầu vào chung cho hai mạng học sâu.

**03:25–04:45 · Slide 05 — Thiết kế mô hình LSTM và 1D-CNN**

LSTM xử lý các quan sát theo trình tự và duy trì trạng thái giữa các bước. Thiết kế cơ sở dùng hai lớp với hidden size sáu mươi tư và dropout không phẩy hai. Output tại bước cuối đi qua lớp linear để tạo một hoặc năm giá. CNN một chiều áp bộ lọc dọc chiều thời gian để học các mẫu cục bộ. Block đầu có convolution, BatchNorm, ReLU rồi MaxPool. Block thứ hai cũng có BatchNorm và ReLU. Sau đó Adaptive Average Pooling, Flatten, Dropout và Linear tạo đầu ra. Kernel bằng ba, padding bằng một; số kênh cơ sở là sáu mươi tư rồi ba mươi hai. Phần dưới mô tả hai chiến lược: recursive dùng model một bước, lấy giá dự báo đưa vào cửa sổ rồi dự báo tiếp. Direct multi-output trả cả năm giá trong một lần. Recursive có thể truyền sai số qua các bước; direct gắn với horizon huấn luyện. Chưa có bằng chứng để nói mạng hoặc chiến lược nào tốt hơn.

Kiến trúc mạng là một phần của hệ thống từ nguồn dữ liệu đến kết quả.

**04:45–05:40 · Slide 06 — Kiến trúc tổng thể của hệ thống**

Sơ đồ này mô tả kiến trúc hệ thống, khác với các lớp bên trong mạng vừa trình bày. DESIGN có sáu lớp. Presentation gồm Notebook và pipeline điều phối, không chứa toàn bộ thuật toán. Data xử lý nguồn, split và preprocessing. Modeling gồm kiến trúc và huấn luyện. Inference dùng model đã chọn để tạo dự báo; Evaluation đọc dự báo cùng actual để tính chỉ số và biểu đồ. Foundation hỗ trợ xuyên suốt bằng cấu hình, seed, IO và thông tin truy vết. Mũi tên giữa các lớp có nhãn đầu ra cụ thể: windows, checkpoint kèm scaler, prediction rồi metrics. Đây là luồng dữ liệu, không phải sơ đồ import. Evaluation không cần import trainer hay model để đọc prediction CSV. Raw snapshot và artifacts theo run giúp truy ngược kết quả về dữ liệu và cấu hình. Đây là kiến trúc mục tiêu, chưa phải hệ thống ML đã chạy.

Từ các lớp lớn, ta xác định module cụ thể đảm nhận từng công việc.

**05:40–06:40 · Slide 07 — Thiết kế module và luồng thực thi**

Tại cấp module, datasets nhận request và raw data, khóa split trước EDA rồi tạo windows cùng scaler và manifest. EDA và cleaning không gọi qua lại: pipeline truyền train cho EDA, dừng human review rồi truyền policy được duyệt cho cleaning. Models định nghĩa mạng và baseline; training quản lý vòng học, validation, tuning và checkpoint. Predict nhận lịch sử tới origin cùng model/scaler để tạo prediction CSV. Evaluation căn chỉnh prediction với actual, tính metrics và xuất biểu đồ. Các tên hàm trên sơ đồ là hợp đồng thiết kế trong DESIGN, không phải bằng chứng code đã tồn tại. Hiện src chỉ có initializer và README module. Điểm cần xây dựng tiếp là các implementation và tests cho cutoff, shapes, xử lý input sai, save/load và tính metrics. Notebook sẽ gọi chung pipeline thay vì viết lại logic.

Những module này phải tạo đủ bằng chứng cho thiết kế thực nghiệm.

**06:40–08:05 · Slide 08 — Thiết kế thực nghiệm và phương pháp đánh giá**

Ma trận thực nghiệm gồm hai họ mạng nhân hai đầu ra: single-step và direct năm bước. Mỗi ô là mười trial Optuna, tổng tối đa bốn mươi. Recursive dùng lại model single-step. Huấn luyện dùng AdamW, objective MSE scaled, tối đa năm mươi epoch với early stopping patience mười. Validation chọn cấu hình và checkpoint; chỉ sau khi khóa lựa chọn mới mở test. Hai baseline là Linear Regression và ARIMA A. LR nhìn cửa sổ sáu mươi Close; ARIMA fit toàn train với order năm, một, không và không drift. Khác biệt lịch sử này cần công bố. Rolling-origin dự báo năm bước tại t; sang t cộng một mới được thêm actual vừa xuất hiện. ARIMA chỉ cập nhật trạng thái bằng refit false, không học lại tham số. Trước metric, giá phải inverse-scale về USD. MAE là độ lệch tuyệt đối trung bình; RMSE nhạy hơn với lỗi lớn. MSE giá gốc dùng USD bình phương, khác loss scaled. Báo từng bước và tổng hợp; chưa có kết quả để xác định model thắng.

Để tạo được evidence đó, dự án cần các mốc triển khai và kiểm soát rủi ro.

**08:05–09:00 · Slide 09 — Kế hoạch triển khai và quản lý rủi ro**

Các công việc được gắn với sản phẩm bàn giao cụ thể. Khảo sát nghiệp vụ và chốt phạm vi tạo phiếu đăng ký cùng tình huống sử dụng. Chuẩn bị dữ liệu phải có snapshot hoặc mẫu thật và mô tả trường. Thiết kế đánh giá tạo kịch bản test cùng giao thức so sánh. Baseline cần tạo kết quả làm mốc. Giải pháp tối thiểu phải có luồng xử lý hoàn chỉnh và Notebook demo. Hiện tài liệu và config đã có nhưng chưa có evidence hoàn thành các đầu việc ML. Leakage có thể làm sai số tốt giả nên cần kiểm split và scaler. Overfit được theo dõi qua validation và early stopping. API lỗi hoặc dữ liệu bị sửa cần snapshot có hash; biến động chế độ thị trường cần được phân tích như giới hạn mô hình.

Cuối cùng, đề tài đã xác lập được gì và còn cần chứng minh gì?

**09:00–10:00 · Slide 10 — Kết luận và định hướng triển khai**

Kết lại, dự án đặt một bài toán cụ thể: dùng lịch sử Close NVDA để dự báo giá nhiều phiên và kiểm chứng LSTM cùng CNN so với Linear Regression, ARIMA. Những gì đã xác lập là hợp đồng dữ liệu, kiến trúc, ngân sách và giao thức đánh giá. Những điều còn phải chứng minh là sai số thực tế, khác biệt recursive với direct, thời gian chạy và giới hạn tổng quát hóa. Sản phẩm hướng tới gồm pipeline, Notebook, checkpoint đi kèm scaler cùng predictions và metrics truy vết được. Bước tiếp theo là lấy snapshot thật, EDA và duyệt policy rồi triển khai, kiểm thử và chạy thí nghiệm. Chỉ khi có kết quả trên dữ liệu chưa dùng để lựa chọn mô hình mới có thể bàn về cải thiện. Một ticker và một giai đoạn lịch sử không đại diện mọi thị trường. Đây không phải bằng chứng hiệu quả đầu tư. Xin cảm ơn thầy cô và các bạn.

Kết thúc10 phút; Q&A ngoài ngân sách.

### Timing Plan

| Slide | Topic | Duration | Cumulative |
|---|---|---|---|
| 01 | Giới thiệu đề tài | 00:20 | 00:20 |
| 02 | Data Understanding | 01:00 | 01:20 |
| 03 | Problem Formulation | 00:55 | 02:15 |
| 04 | Data Preparation | 01:10 | 03:25 |
| 05 | Model Design | 01:20 | 04:45 |
| 06 | System Architecture | 00:55 | 05:40 |
| 07 | Implementation Modules | 01:00 | 06:40 |
| 08 | Experiment & Evaluation | 01:25 | 08:05 |
| 09 | Milestones & Risks | 00:55 | 09:00 |
| 10 | Conclusion | 01:00 | 10:00 |
| **TOTAL** | **10 slides; Q&A ngoài ngân sách** | **10:00** | **10:00** |

## 5. Technical Accuracy Checklist

Checklist này xác nhận **nội dung đã đối chiếu**, không xác nhận pipeline hoặc thí nghiệm đã chạy.

- [x] Target là Close tương lai; feature cơ sở là lịch sử Close.
- [x] Lookback60 tách biệt horizon1/5 và bước đánh giá1…5.
- [x] Raw OHLCV không được gọi là toàn bộ features của mạng.
- [x] Split70/15/15 trước EDA, giữ biên ngày; policy/scaler train-only.
- [x] EDA/human review trước quyết định cleaning/feature mở rộng.
- [x] LSTM và CNN đúng thiết kế; CNN convolve trên thời gian.
- [x] Recursive không dùng actual trong horizon; direct trả5 bước.
- [x] Baseline LR/ARIMA A, không thêm Naive.
- [x] 4 study×10 trial; AdamW, MSE scaled,50 epoch/patience10.
- [x] Test sau khóa lựa chọn, origins chung, actual mới không đồng nghĩa retrain.
- [x] Metrics inverse-scaled; phân biệt USD với USD² và MSE scaled.
- [x] Không bịa dataset dimensions, kết quả, model winner hoặc benchmark.
- [x] Kiến trúc module mục tiêu phân biệt với code hiện có.
- [x] Milestones/rủi ro là kế hoạch; không đánh dấu ML completed thiếu evidence.
- [x] Đúng10 slide và tổng ngân sách600 giây.
- [x] Speaker script tổng hợp khớp notes và transitions từng slide.
- [x] Tên mới/tiêu đề phụ đúng human; giữ file hiện tại theo lựa chọn human.
- [ ] Chưa thu thập snapshot, chạy ML, đánh giá test hoặc xác minh Kaggle trong task này.
- [ ] Chưa đo thời gian nói thực; cần rehearsal trước trình bày.
- [x] Nội dung mới được đồng bộ với HTML10 slide; kiểm browser/layout được ghi trong plan-progress.status.md.

## 6. Presentation Design Guidelines

Tham chiếu [DESIGN_TOKENS.md](DESIGN_TOKENS.md); tên thương hiệu cũ trong tokens không áp dụng cho tiêu đề mới. Không đổi tokens ở task này.

| Vai trò | Màu |
|---|---|
| Primary Violet | #7A2CFF |
| Electric Purple | #B84DFF |
| Soft Purple | #E097FF |
| Lavender | #E3CFFF |
| Background | #FAF7FF |
| Surface | #FFFFFF |
| Deep Purple | #160A29 |
| Dark Purple | #211335 |
| Primary Text | #111111 |
| Secondary Text | #716B7D |
| Border | #EAE3F5 |

- Gradient chính: #7A2CFF → #B84DFF. Gradient mềm: #B84DFF → #E097FF → #FAF7FF.
- Light Mode; nền white/lavender có phân vùng, chữ tối; tím dùng để nhấn và dẫn mắt.
- Font đã duyệt: **Be Vietnam Pro**, có asset Regular400/SemiBold600/Bold700 local và OFL license; body/heading dùng cùng family. Không dùng font cũ làm default.
- Khung16:9,1280×720. Header/title/content/footer cố định; padding52px ngang,34px trên/26px dưới, gap18px. H2=32px, cover=52px, nội dung chính15–20px; notes chứa phần diễn giải dài. Reading mode mobile bố cục cuộn riêng.
- Tên dài ở cover được xuống dòng có chủ đích, giữ nguyên nguyên văn; tiêu đề phụ đứng riêng. Không tạo logo hoặc nhét tên đầy đủ vào mọi footer.
- Công thức phát biểu bài toán và MAE/RMSE được viết bằng LaTeX, render qua **MathJax3.2.2 local SVG**; không cần CDN. Asset có license Apache2.0. Sơ đồ cover SVG là hình minh họa khái niệm, không phải mô hình đã train hoặc dữ liệu giá.
- Template System Design đã kiểm tra preview và cấu trúc DOCX read-only; tham khảo hierarchy, architecture, request lifecycle và contracts. Human đã duyệt chuyển sang HTML, không tái tạo DOCX hoặc claim giữ nguyên page layout DOCX.
- Một slide một trọng tâm. Dùng timeline cho window/origin; sơ đồ lớp cho architecture; experiment matrix cho studies; risk table cho tác động/mitigation.
- Nét mũi tên và nhãn có nghĩa dữ liệu; chiều thời gian nhất quán trái→phải; human gate dễ nhận biết.
- Chart tương lai cần trục/ngày/đơn vị, nguồn run và step/origin rõ. Không dựng đường NVDA, loss curve hoặc cột performance bằng dữ liệu giả.
- Series mapping đề xuất: Actual #211335, LSTM #7A2CFF, CNN #1D4ED8, LR #716B7D, ARIMA #A16207; thêm nhãn/nét để không chỉ dựa màu.
- Chỉ dùng glass/ánh sáng ở hình phụ; không blur chữ hoặc dữ liệu. Không dùng neon dày,3D không cần thiết hoặc nền tranh giành nội dung.
- Nhãn trạng thái bằng chữ: [PLANNED], [IMPLEMENTED], [NEEDS VERIFICATION: …]; tím không đồng nghĩa kết quả đạt.
- Kiểm xuống dòng, font, công thức và geometry của từng slide trên browser; không coi kiểm tra layout là chứng nhận accessibility toàn diện.

## 7. References & Source Traceability

Đường dẫn dưới đây tương đối với chính file này. Đây là **evidence nội bộ**, không phải trích dẫn học thuật chứng minh hiệu quả dự báo.

| ID | Nguồn đã kiểm tra | Claim / vị trí dùng |
|---|---|---|
| R1 | [report/problem_definition_5min.md](../report/problem_definition_5min.md) | DEFINE/01–03: vấn đề, user,60→5; DESIGN/04–10: mở rộng architecture/workflow; cấu trúc cũ được đối chiếu R3 |
| R2 | [DEFINE.md](../DEFINE.md) | §2–4 task/data/split/IO; §5 phạm vi; §6.2 training/tuning; §7 metrics/protocol/limitations |
| R3 | [DESIGN.md](../DESIGN.md) | §1.2 lớp; §2 modules; §3 folder; §4 fixed flow; §5.7 mạng/ARIMA/training; §5.8 shapes; §6 milestones; §7 risks |
| R4 | [walkthrough.md](../walkthrough.md) | §1 context; §2.1 split/EDA; §2.3 CNN/ARIMA A; §2.4 training; §3 bảng chưa có kết quả |
| R5 | [DESCRIPTION.md](../DESCRIPTION.md) | mục3 user,4 objectives,5 data,6 scope,8 deliverables,9 evaluation,10 timeline |
| R6 | [config/default_config.yaml](../config/default_config.yaml), [requirements.txt](../requirements.txt) | Defaults50/10,batch32,seed42,L60/H5,model base; requirements lower bounds và chưa có Optuna |
| R7 | [src/__init__.py](../src/__init__.py), [tests/__init__.py](../tests/__init__.py), inventory src/tests/data/notebooks/outputs | Khung package/README, outputs/runs chỉ placeholder; chưa thấy module ML hoặc kết quả. Tồn tại file không phải bằng chứng execution |
| R8 | [README.md](../README.md), [AGENTS.md](../AGENTS.md) | README §4.2 xác nhận chưa có training/eval/predict; AGENTS quy tắc train-only và số liệu thật |
| R9 | Chỉ dẫn human trong chat hiện tại và xác nhận redesign | Tên cover Stock Price Forecasting For Deep Learning; tiêu đề phụ không còn “đa bước”; đổi Be Vietnam Pro, LaTeX, visual và10 slide theo plan mới. Bài toán kỹ thuật vẫn H5, không đổi scope |
| R10 | [DESIGN_TOKENS.md](DESIGN_TOKENS.md) | Palette xác nhận; font Be Vietnam Pro và layout theo human review, chart rules |
| R11 | [.agents/skills/documentation-and-adrs/SKILL.md](../.agents/skills/documentation-and-adrs/SKILL.md) | Đã đọc; ghi lý do, trạng thái và discrepancy ngay trong file, không tạo ADR mới |
| R12 | [.agents/skills/time-series-dl-pipeline/SKILL.md](../.agents/skills/time-series-dl-pipeline/SKILL.md) | Đã đọc; tham khảo anti-leakage/tensors/evaluation; yêu cầu project ưu tiên các gợi ý generic trái scope |

**Discovery:** tài liệu chính đều tìm thấy đúng root/report nêu trên; file workflow thực là `walkthrough.md`. Skills thực tế nằm trong `.agents/skills/`; không có `.agent/` hoặc `.codex/` trong project ở lượt kiểm tra. Không có `pyproject.toml`; dùng `requirements.txt` hiện có. Thư mục code thật dùng `src/datasets/`, không lấy `src/data/` trong draft làm bằng chứng implementation.

**External academic references:** chưa bổ sung paper/web ở lượt này. Nội dung chỉ mô tả các lựa chọn đã có và câu hỏi nghiên cứu; không dùng citations nội bộ để tuyên bố LSTM/CNN hiệu quả hơn. Nếu cần slide literature review, phải có phạm vi và nguồn học thuật xác minh riêng.

**Final verification boundary:** checklist/nguồn kiểm chứng nội dung tài liệu; không chứng minh dataset đã tải, tests ML đã pass, model đã train hoặc HTML đã đồng bộ. DEFINE/DESIGN/walkthrough và code ML giữ nguyên trong lượt này; chỉ các file presentation và tracking được cập nhật.
