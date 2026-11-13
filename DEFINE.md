# 1. PROJECT NAME

- **Official Project Name / Short Name:** StockVision.
- **Tên mô tả:** Dự báo giá đóng cửa cổ phiếu đa bước bằng LSTM và CNN, thực nghiệm trên NVDA.
- **Domain:** Financial Time Series Forecasting (dự báo chuỗi thời gian tài chính).
- **Project Type:** Supervised Learning / Regression (học có giám sát / hồi quy).
- **Mô tả:** Xây dựng pipeline Python lấy dữ liệu Yahoo Finance, khảo sát và xử lý có human review, huấn luyện LSTM làm mô hình chính, so sánh CNN 1D với Linear Regression và ARIMA; dự báo phiên tiếp theo và 5 phiên tiếp theo bằng Recursive và Direct multi-output.

**Trạng thái đặc tả:** Yêu cầu đã được xác nhận (Confirmed) hoặc đề xuất (Proposed) phục vụ triển khai kỹ thuật.

| Trạng thái | Quy tắc sử dụng |
|---|---|
| Confirmed | Quyết định đã chốt trong chat hoặc đã chỉ định dùng theo project |
| Proposed | Lựa chọn cụ thể đề xuất, cần human duyệt trước bước triển khai liên quan |
| TBD | Chưa xác định hoặc chưa kiểm chứng; không được tự điền thành sự thật |

Trừ phần được đánh dấu Proposed/TBD, các yêu cầu trong tài liệu là Confirmed.

**Vai trò tài liệu:** `DEFINE.md` là nguồn chuẩn yêu cầu/phạm vi/Input–Output/acceptance criteria; `DESCRIPTION.md` là phiếu đăng ký tóm tắt; `walkthrough.md` ghi phương pháp và kết quả, dẫn chiếu yêu cầu; README module ghi cách dùng và quyết định kỹ thuật; `plan-progress.status.md` ghi quyết định và tiến độ. Human đã duyệt phân vai này thay quy tắc gộp đặc tả của khung cũ. Không nhân bản toàn bộ yêu cầu sang walkthrough.

**Tình trạng đồng bộ:** README/walkthrough/config chưa phản ánh đầy đủ Optuna, Recursive, `src/datasets/` và các lựa chọn mới. Tạo đặc tả không đồng nghĩa sửa các file đó. Cần plan đồng bộ riêng trước triển khai.

# 2. PROBLEM

## 2.1. Current Situation (Hiện trạng)

Giá cổ phiếu thay đổi theo phiên giao dịch. Dữ liệu giá và khối lượng lịch sử cho phép khảo sát xu hướng, biến động và quan hệ theo thời gian, nhưng không bảo đảm dự báo được tương lai. Bài toán đặt ra là dùng thông tin đã có sau khi phiên t đóng cửa để dự báo Close của phiên t+1 và chuỗi Close của 5 phiên kế tiếp.

## 2.2. Pain Points (Điểm đau)

| Nhóm | Vấn đề |
|---|---|
| Người dùng | Khó tổng hợp lịch sử thành kết quả dự báo và đối chiếu định lượng, khó so sánh các kiến trúc trong cùng điều kiện |
| Người phát triển | Dễ chia tập sai thời gian, fit scaler trên tương lai, đặt prediction sai ngày hoặc so sánh khác horizon |
| Hạn chế bài toán | Giá chịu tác động từ tin tức/sự kiện và thay đổi chế độ thị trường mà lịch sử giá không mô tả đầy đủ |

## 2.3. Impact (Tác động)

Sản phẩm cung cấp pipeline và Notebook demo có thể truy vết, biểu đồ cùng sai số đo được; hỗ trợ phân tích thực nghiệm và nghiên cứu học thuật về chuỗi thời gian. Giá trị thực nghiệm là xác định LSTM/CNN hoạt động thế nào so với baseline, không mặc định chúng phải thắng.

# 3. TARGET USER

| Attribute | Description | Requirement |
|---|---|---|
| User Group | Người tham gia thị trường chứng khoán; nhà đầu tư cá nhân, chuyên viên phân tích theo DESCRIPTION | Xem dự báo và bằng chứng đánh giá NVDA |
| Demographics | Không có căn cứ xác định tuổi/giới tính | Không tự bổ sung |
| Technical Level | TBD | Notebook trước; mức Python/ML tối thiểu cần xác nhận khi thiết kế demo |
| Goals | Dự báo giá cổ phiếu phục vụ phân tích | Xem ngày dự báo, mô hình, giá và sai số khi có actual |
| Pain Points | Khó nhận diện mẫu và kiểm tra khả năng dự báo | Có so sánh baseline, biểu đồ và giới hạn mô hình |

Không yêu cầu người xem phải hiểu cách huấn luyện để đọc kết quả. Người vận hành Notebook cần môi trường Python; mức thao tác cụ thể, ô cấu hình và hướng dẫn chạy là TBD trước triển khai demo. Giai đoạn hiện tại dùng Notebook; Web chưa thuộc công việc triển khai hiện tại.

# 4. INPUT / OUTPUT

## 4.1. Input Specification

### A. Data Source

Yahoo Finance qua package `yfinance`, phương thức Historical Market Data. Dataset chính là NVDA, NASDAQ, giá USD, dữ liệu ngày. Giữ 5 năm tính đến dữ liệu mới nhất lấy được tại lần thu thập; không cố định một số dòng hoặc ngày cuối chưa tải thật.

**Proposed:** chỉ lấy phiên đã đóng hoàn toàn theo lịch/múi giờ sàn; loại nến phiên đang chạy. Khi tải lần đầu, khóa snapshot cùng actual start/end, retrieval timestamp, tham số request và checksum. Chạy lại thí nghiệm dùng snapshot đó; refresh dữ liệu tạo phiên bản mới, không âm thầm thay tập test. Quy tắc tính biên 5 năm và lịch sàn cần duyệt trong plan collection.

### B. Raw Data, Features và Target

| Field | Kiểu / ý nghĩa | Vai trò |
|---|---|---|
| Date | Datetime, phiên giao dịch; ghi múi giờ nguồn | Time index, không phải giá trị dự báo |
| Open / High / Low | Float, giá mở/cao/thấp | Raw, khảo sát; chưa mặc định làm feature |
| Close | Float, giá đóng cửa Yahoo trả về, USD | Target và feature cơ sở dạng lịch sử |
| Adj Close | Float, Close có điều chỉnh cổ tức | Lưu để đối chiếu, không tự dùng làm target/feature |
| Volume | Integer/float không âm, khối lượng giao dịch | Raw, khảo sát; chưa mặc định làm feature |
| Dividends / Stock Splits | Số, corporate actions theo schema nguồn | Lưu để kiểm tra điều chỉnh, không tự làm feature |

Confirmed: `auto_adjust=False`; Close Yahoo vẫn split-adjusted, không gọi là giá hoàn toàn nguyên gốc. Lưu Adj Close và corporate actions, liên kết theo phiên nếu nguồn trả riêng. Thiếu trường cần thiết phải báo schema mismatch, không tự chế cột giả.

Target single-step là Close phiên t+1. Target multi-step là `[Close(t+1), ..., Close(t+5)]`. Feature cơ sở theo walkthrough là lịch sử Close, F=1.

**Lý do lựa chọn F=1 (Close đơn biến) cho pha cơ sở:**
1. *Chuẩn tắc hóa bài toán tự hồi quy đơn biến (Univariate Time Series Baseline):* Bắt đầu với Close giúp thiết lập mốc đánh giá năng lực học quy luật thời gian thuần túy của LSTM và các baseline, tránh đưa sớm các biến ngoại sinh (Volume, chỉ báo kỹ thuật) gây nhiễu (noise) và overfit khi dữ liệu chỉ có ~1250 mẫu (5 năm).
2. *Loại trừ bẫy kỹ thuật trong Recursive Forecasting:* Khi dự báo đa bước đệ quy từ $t+1$ sang $t+2 \dots t+5$, nếu dùng đa biến (Close, Volume, RSI), hệ thống sẽ không có sẵn giá trị Volume hay RSI thực tế của các phiên tương lai để làm input cho các bước tiếp theo, buộc phải giả định phi thực tế hoặc phải xây dựng mô hình phụ dự báo đồng thời tất cả các biến đó. Do đó, $F=1$ là điều kiện tiên quyết để đánh giá chiến lược Recursive một cách chặt chẽ.
3. *Lộ trình mở rộng có kiểm soát (D02):* Đề tài không loại trừ đa biến vĩnh viễn; việc bổ sung Volume hoặc các chỉ báo kỹ thuật được quy hoạch rõ ràng trong quyết định mở D02, chỉ thực hiện sau khi hoàn thành EDA trên tập Train và có sự phê duyệt độc lập.

### C. Input Configuration

| Cấu hình | Ý nghĩa / kiểu / đơn vị | Giá trị hợp lệ | Giá trị hiện hành / trạng thái |
|---|---|---|---|
| ticker | Mã chứng khoán, string | Mã được nguồn chấp nhận, có dữ liệu | NVDA, Confirmed; mã khác cần thí nghiệm được duyệt |
| period | Khoảng lịch sử, string | Khoảng được nguồn hỗ trợ | 5y, Confirmed |
| start_date / end_date | Biên ngày, YYYY-MM-DD | start < end, quy ước end exclusive nếu API áp dụng | Ngày request/thực tế TBD lúc collection; không đồng thời dùng period và ngày theo cách mơ hồ |
| interval | Chu kỳ mỗi dòng, string | Phạm vi này 1d | 1d, Confirmed |
| auto_adjust | Chế độ điều chỉnh, boolean | false trong phạm vi hiện tại | false, Confirmed |
| target_col | Biến dự báo, string | Close có schema hợp lệ | Close, Confirmed |
| features | Danh sách cột/biến | Có sẵn tại forecast origin | Close cơ sở; mở rộng qua EDA review |
| lookback | Số phiên đầu vào, integer > 0 | Đủ lịch sử cho mọi mẫu | 60, Confirmed |
| horizon | Số phiên dự báo, integer > 0 | Phạm vi 1 hoặc 5 | 1 single-step, 5 multi-step, Confirmed |
| split | Tỷ lệ ba tập, float | Dương, tổng bằng 1 | 0.70 / 0.15 / 0.15, Confirmed |

### D. Validation và Human Review

- Ticker/date/config sai: từ chối trước training, báo trường và lý do.
- Network/rate-limit/empty response: báo lỗi có thể quan sát; dùng cache chỉ khi đúng snapshot/config và công bố đang dùng cache; không báo download thành công giả.
- Kiểm tra thứ tự ngày, trùng phiên, numeric finite, schema, missing, Volume không âm và logic OHLC. Giá Close dùng đánh giá MAPE phải > 0; giá vi phạm phải trình human, không sửa ngầm.
- Hiển thị bảng dòng lỗi, số lượng/tỷ lệ và ngày tương ứng; outlier chỉ là cờ khảo sát, không mặc định dữ liệu sai.
- Missing: khảo sát nguyên nhân trước đề xuất fill/drop. Duplicate: phân biệt dòng giống hệt và cùng ngày nhưng giá khác; không tự gộp.
- IQR/Z-score/transformation là lựa chọn xem xét sau khảo sát. Không dùng tương lai để backfill hoặc nội suy; ngày nghỉ sàn không tự xem là missing cần điền giá.
- Thiếu quan sát để tạo train/val/test sequences: dừng và báo số mẫu mỗi tập; không giảm window/horizon hoặc đổi split ngầm.
- Mọi cleaning/feature policy mới phải có bằng chứng EDA, human duyệt, lưu policy và provenance. Validation/test không dùng để fit policy hoặc chọn feature.

## 4.2. Data Processing Pipeline

Đường dẫn con dưới đây là Proposed cho review thiết kế; artifact thực tế đặt theo run, dữ liệu gốc có thể dùng cache chung được khóa checksum.

| Step | Input | Processing | Output | Storage | Validation |
|---|---|---|---|---|---|
| 1 Collection | Request NVDA/5y/1d | Lấy OHLCV, Adj Close, actions; lưu metadata | Raw snapshot | data/raw/; run lưu reference/hash | Không rỗng, range/schema đúng |
| 2 Minimal Validation | Raw | Chỉ kiểm tối thiểu schema ngày, thứ tự/index để chia tập; lỗi mơ hồ dừng trình human, chưa EDA | Index hợp lệ hoặc lỗi | run/data/ | Không khảo sát/phát triển policy trước split |
| 3 Fixed Splitting | Index hợp lệ | Chia thời gian 70/15/15, khóa biên ngày trước EDA | Fixed split manifest | run/data/ | Không xáo trộn, không dời biên sau cleaning |
| 4 EDA & Human Review | Train, fixed manifest | Quality findings, trend/distribution/ACF/PACF/ADF phù hợp trên train; human duyệt policy | EDA report và policy được duyệt | run/eda/ | Chưa sửa raw; không chọn policy bằng val/test |
| 5 Cleaning / Features | Split data, policy đã duyệt | Xử lý từng tập theo policy nhân quả; giữ biên ngày, tái đếm, ghi gap | Cleaned data, feature spec, counts/change log | run/data/ | Train-only fitted state; không kéo val/test vào train; gap policy cần duyệt |
| 6 Scaling | Train/val/test | Fit MinMaxScaler trên train; transform phần còn lại | Scaler, scaled data | run/preprocessing/ | State scaler khớp train; không clip test ngầm |
| 7 Sequences | Scaled/history/split | Tạo window và nhãn theo thời gian | X, Y, origin/date metadata | run/data/ hoặc sinh khi chạy | Shape đúng, toàn bộ nhãn thuộc split |
| 8 Training / Tuning | Train/val windows/config | Fit, Optuna, early stopping, checkpoint | Models, trials, loss history | run/models/, run/tuning/ | Không dùng test; nonfinite/failure ghi nhận |
| 9 Forecasting | Model/scaler/history | Single-step, recursive hoặc direct | Scaled predictions | run/predictions/ | Đúng số bước, không actual tương lai |
| 10 Inverse Transformation | Predictions/actual scaled | Khôi phục đơn vị USD đúng target scaler | Giá predicted/actual | run/predictions/ | Round-trip/shape check |
| 11 Evaluation | Giá gốc, aligned dates | Metrics, residuals, baseline comparison | Bảng metrics | run/metrics/ | Cùng origin/target/horizon |
| 12 Visualization & Export | History/predictions/metrics | Biểu đồ, bảng, báo cáo | Deliverables | run/plots/, outputs/published/ | Không lệch ngày/đơn vị; provenance |

Confirmed: phải chia và khóa biên ngày trước EDA. Sau cleaning chỉ cập nhật count/positions theo biên đã khóa, không chia lại 70/15/15. Kiểm tối thiểu trước split chỉ để xác nhận index/schema đọc được; kiểm chất lượng val/test không phải quyền chọn policy hoặc tuning trên test. Lỗi dữ liệu có thể buộc dừng trình human; không âm thầm đổi snapshot hoặc biên đánh giá.

**Data leakage rules:** không shuffle chuỗi trước split; không fit scaler/imputer/feature selection trên val/test; không dùng test để chọn hyperparameters, checkpoint hoặc policy; không dùng feature có sẵn sau origin. ADF/ACF trên train chỉ hỗ trợ thiết kế, không tự xác định window tối ưu.

**Kiểm định tính dừng (ADF Test) và bẫy dự báo trễ (Naive Persistence Trap):** Chuỗi giá cổ phiếu NVDA có xu hướng tăng mạnh và mang bản chất không dừng (non-stationary). Khâu EDA bắt buộc thực hiện kiểm định Augmented Dickey-Fuller (ADF) trên tập Train để khảo sát tính dừng và xác nhận bậc sai phân tích hợp $d=1$ cho mô hình ARIMA(5,1,0). Trong các bài toán giá tài chính, Deep Learning rất dễ rơi vào bẫy "dự báo quán tính" ($\hat{y}_{t+1} \approx y_t$, chỉ đơn thuần copy lại giá ngày hôm trước) nhưng vẫn đạt RMSE/MAE thấp ảo do độ trễ 1 ngày. Do đó, việc đo lường kiểm định dừng, kết hợp chỉ số **Directional Accuracy (DA)** và đối chứng trực diện với ARIMA(5,1,0) là bắt buộc để chứng minh mô hình thực sự học được quy luật biến động chứ không sao chép quán tính.

Sequence tại origin t: `X = [Close(t-59), ..., Close(t)]`; Y một bước là `Close(t+1)`, Y năm bước là `Close(t+1..t+5)`. X float32 có shape `(B,60,1)` cho LSTM; adapter CNN chuyển sang `(B,1,60)`. Output/target `(B,1)` hoặc `(B,5)`, tránh broadcasting ngoài ý muốn. Linear Regression nhận vector 60 giá; ARIMA dùng chuỗi có thứ tự, không giả định cần tensor như DL.

## 4.3. Dataset Splitting

| Dataset | Purpose | Usage |
|---|---|---|
| Train: 70% đầu | Học tham số và fit preprocessing | Model fitting; không chứa target val/test |
| Validation: 15% tiếp | Chọn trial/checkpoint, early stopping | Không cập nhật trọng số bằng val |
| Test: 15% cuối | Đánh giá sau khóa thiết kế | Không tuning/refit tham số trên test |

**Proposed rounding:** với N phiên có index hợp lệ trước EDA/cleaning, `n_train=floor(0.70N)`, `n_val=floor(0.15N)`, test nhận phần dư; lưu ngày biên thực tế. Không yêu cầu mỗi tập tự có thêm 60 phiên bị lãng phí: context có thể lấy từ quá khứ trước biên, nhưng mọi target trong một window phải nằm hoàn toàn trong split đích. Train window nhiều bước không vượt sang val; val không vượt sang test. Sau cleaning thay đổi index/count, giữ nguyên ngày biên train/validation/test; chỉ cập nhật count/positions, báo tỷ lệ thực và gap. Không kéo ngày thuộc validation/test sang train để bù số dòng.

## 4.4. Output Specification

### A. Intermediate Outputs

Raw snapshot + source/request metadata; quality/EDA findings và human-approved policies; cleaned dataset; split manifest; scaler state; scaled data và train/val/test sequence metadata; trial histories; trained checkpoints. Sequence có thể tạo lười thay lưu mảng trùng dữ liệu, nhưng phải tái tạo được từ snapshot/config/split.

### B. Model Outputs

**Proposed schema CSV dài:**

| Field | Ý nghĩa |
|---|---|
| run_id, model_name, forecast_method | Liên kết thí nghiệm/model/single_step/recursive/direct_multi_output |
| forecast_origin, target_date | Phiên cuối đã quan sát và phiên cần dự báo |
| step, horizon | Bước 1..H và horizon của lần dự báo |
| predicted_close_usd | Giá dự báo inverse-scaled, finite |
| actual_close_usd | Actual đúng target_date; null cho tương lai chưa có actual |
| config_reference, snapshot_reference | Truy vết cấu hình/model và dữ liệu |

Không điền predicted vào actual. Chỉ tính metric khi có actual; không tạo actual giả cho demo tương lai. Không dùng ngày lịch liên tiếp thay lịch giao dịch để đặt target_date.

### C. Evaluation Outputs

Lưu metrics từng bước, tổng hợp, số mẫu hợp lệ, trường hợp undefined, runtime/hardware và residuals. Định nghĩa công thức tại mục 7.2. Không điền kết quả trước thực nghiệm.

### D. Final Deliverables

Source module hóa + tests; Notebook demo; dataset snapshot/reference và split manifest; model/checkpoint/scaler; cấu hình thí nghiệm và environment snapshot; prediction CSV; metrics CSV/JSON; trial/loss history; ảnh; so sánh và phân tích lỗi trong walkthrough. Phân phối dataset/checkpoint theo quyền sử dụng và kích thước; không mặc định push file lớn lên Git.

## 4.5. Output Visualization

Tên/định dạng dưới đây là Proposed; lưu PNG trong `run/plots/`, tiêu đề ghi ticker/model/method/horizon khi áp dụng.

| Chart / file | Purpose | X | Y | Đường/nhóm và cách đọc |
|---|---|---|---|---|
| Historical / historical_close.png | Khảo sát lịch sử | Phiên | Close USD | Actual; có biên split, không giả chuỗi là stationary |
| Loss / loss_<model>_<trial>.png | Theo dõi hội tụ | Epoch | MSE scaled, ghi rõ | Train/val, so gap; không so loss này trực tiếp với RMSE USD |
| Actual vs Predicted / actual_predicted_<model>_<method>_step<h>.png | Đối chiếu dự báo | Target date | Close USD | Actual/predicted cùng ngày; mỗi step riêng để không trộn origin |
| Future Forecast / future_forecast_<model>_<method>.png | Xem dự báo từ origin cuối | Phiên | Close USD | Lịch sử + H predicted, phân biệt phần chưa có actual |
| Multi-step / multistep_<model>_<method>.png | So trajectory tại origin được chọn tường minh | Step/target date | Close USD | H actual nếu có và H predicted; ghi origin |
| Comparison / model_comparison.png | So mô hình cùng giao thức | Model/method | Metric, các panel riêng đơn vị | Baselines/LSTM/CNN, không dùng khác test set |
| Error vs Horizon / error_by_step.png | Xem sai số theo độ xa | Step 1..5 | MAE/RMSE USD, panel riêng | Các model/method; không khẳng định sai số bắt buộc tăng đơn điệu |
| Residuals / residual_distribution.png | Chẩn đoán lệch và đuôi sai số | Residual USD | Count/density ghi rõ | Actual - predicted, tách model/step |
| Residual vs Time / residual_time.png | Tìm vùng sai số lớn | Target date | Residual USD | Tách step, đường zero |

## 4.6. Storage Convention

**Proposed layout chi tiết, dùng root đã chốt:**

```text
data/raw/<snapshot_id>/
outputs/runs/<run_id>/
  config.yaml
  environment_snapshot.json
  provenance.json
  eda/
  data/
  preprocessing/
  models/
  tuning/
  predictions/
  metrics/
  plots/
outputs/published/
```

Run/snapshot ID phải duy nhất, không ghi đè thí nghiệm khác. Mỗi trial có ID và checkpoint riêng; lưu config, seed, hardware, duration, ticker/range/target/window/horizon, source hash và lựa chọn kết quả. Chọn run xuất bản tường minh; không mặc định run mới nhất. Raw runs, large data/weights, secrets phải được ignore; chỉ xuất evidence đã review. SQLite/file storage cho Optuna là chi tiết TBD trước plan tuning, không thêm dịch vụ database sản phẩm.

# 5. CORE AND EXTENDED FEATURES

Phạm vi chức năng của dự án được phân cấp rõ ràng thành hai nhóm: **Nhóm tính năng cơ bản bắt buộc (Core / Basic Scope)** đảm bảo pipeline chuẩn tắc và mô hình nền tảng, và **Nhóm tính năng mở rộng chuyên sâu (Extended / Advanced Research Scope)** nhằm nghiên cứu thực nghiệm đa bước và so sánh kiến trúc.

## 5.1. Nhóm tính năng cơ bản (Core / Basic Scope)

Bao gồm các tính năng cốt lõi F01–F06, F09, F10 và **Tối ưu hóa siêu tham số bằng Optuna trên Kaggle GPU (thuộc F03)** là yêu cầu bắt buộc:

| ID / Name | Description / vấn đề giải quyết | Input | Processing | Output | Acceptance Criteria |
|---|---|---|---|---|---|
| F01 Historical Collection | Có snapshot dữ liệu truy vết | Request theo 4.1 | Tải/cache, xác thực metadata | Raw/actions/provenance | NVDA/1d/5y request được lưu; empty/network lỗi có thông báo |
| F02 EDA & Preprocessing | Hiểu chất lượng, kiểm định ADF, chống leakage | Raw/policy | Findings, ADF test, split/scale/window | Dataset/scaler/splits | Bằng chứng EDA train-only; fit scaler chỉ trên train; shape/date hợp lệ |
| F03 LSTM Training & Optuna Tuning | Mô hình chính & Tối ưu hóa siêu tham số tự động | Train/val/config | Huấn luyện LSTM, Optuna TPE + MedianPruner trên Kaggle GPU | Model/best checkpoint/history | Finite loss; best checkpoint nạp lại được; Optuna budget 10 trials/study |
| F04 Single-step | Dự báo phiên kế tiếp (t+1) | 60 Close đã có | LSTM output 1, inverse-scale về USD | Giá/date USD | Đúng 1 giá cho phiên kế tiếp, có actual khi backtest |
| F05 Evaluation | Đo được chất lượng thực tế | Aligned predictions/actual | Metrics USD theo 7 (MAE, RMSE, MAPE, R², DA) | Bảng metrics/residuals | Khớp công thức trên USD, policy undefined rõ ràng |
| F06 Visualization | Đọc và kiểm tra kết quả trực quan | Artifacts | Xuất bộ 9 biểu đồ chuẩn theo 4.5 | PNG + provenance | Đúng trục/đơn vị/ngày, có loss curve train/val |
| F09 Baselines | Mốc đối chứng đơn giản và thống kê | Cùng lịch sử, actual theo thời gian | Linear Regression, ARIMA(5,1,0) | Baseline forecasts/metrics | So cùng origin và step; không tune trên test |
| F10 Notebook Demo | Trình diễn sản phẩm trực quan | Config, snapshot, checkpoint/scaler | Load module, forecast, display/export | Notebook chạy được | Trình diễn trực quan, nạp artifact có sẵn, không chạy lại heavy tuning |

## 5.2. Nhóm tính năng mở rộng chuyên sâu (Extended / Advanced Research Scope)

Bao gồm các nghiên cứu thực nghiệm mở rộng nhằm so sánh chiến lược đa bước và kiến trúc mô hình:

| ID / Name | Description / vấn đề giải quyết | Input | Processing | Output | Acceptance Criteria |
|---|---|---|---|---|---|
| F07 Multi-step (5 ngày) | Dự báo chuỗi 5 phiên liên tiếp | 60 Close đã có | Thực nghiệm so sánh Recursive vs Direct Multi-output | 5 predicted Close USD/mô hình | Recursive không dùng actual tương lai; direct xuất vector (B,5); đo metrics từng bước h=1..5 |
| F08 CNN Comparison | So sánh kiến trúc tích chập 1D-CNN | Cùng snapshot/splits | Huấn luyện 1D-CNN, cùng window 60 và metrics | Bảng/ảnh so sánh với LSTM | Cùng cohort, cùng hardware/runtime, đánh giá ưu/nhược điểm trích xuất đặc trưng |

**Quy tắc triển khai:** Nhóm tính năng cơ bản (5.1) được ưu tiên hoàn thiện trước để đảm bảo tính ổn định của pipeline và baseline; sau đó nhóm tính năng mở rộng (5.2) được triển khai trên cùng tập benchmark đã khóa.

**Recursive:** dùng mô hình single-step, nối predicted Close vào cửa sổ và bỏ phần tử cũ, lặp 5 lần. Không nạp actual t+1 trong lần forecast tạo tại t. **Direct multi-output:** mô hình riêng trả `(B,5)` trong một lần; không phải 5 mô hình direct độc lập. Recursive dùng model được chọn theo objective single-step nên không tự nhận là cấu hình tối ưu multi-step.

**Proposed Linear Regression:** sklearn LinearRegression mặc định có intercept; flatten 60 giá, huấn luyện riêng đầu ra 1 và vector 5; không thêm tuning riêng chưa duyệt. **ARIMA Confirmed:** order `(5,1,0)`; fit tham số bằng train; rolling append chỉ quan sát đã xuất hiện với `refit=False`, giữ tham số cố định. Dự báo đến 5 bước và dùng bước 1 cho so sánh single-step. Trend/intercept, chính sách fit không hội tụ và số quan sát dùng fit ARIMA là TBD; phải ghi rõ nếu ARIMA dùng toàn bộ train còn DL dùng window 60.

Không thêm Naive làm baseline bắt buộc: human chọn Linear Regression và ARIMA theo project mới. Web demo, nhiều ticker chạy hàng loạt, automatic trading, buy/sell signals, authentication, API server, frontend và model khác chưa được duyệt. Tuning Optuna vốn là Could Have trong prompt ban đầu đã được human nâng vào phạm vi hiện hành; không tự mở thêm search ngoài mục 6.

# 6. TECHNOLOGY CONSTRAINTS

## 6.1. Stack và Dependencies

Python/PyTorch theo project; không dùng đồng thời TensorFlow. yfinance collection; pandas/NumPy processing; sklearn scaling/Linear Regression/metrics; statsmodels ARIMA/EDA; Matplotlib/seaborn plots; PyYAML config; Optuna tuning; pytest tests. Kaggle cho tuning/training; local kiểm tra môi trường và smoke test khi khả dụng. Không tự đổi môi trường hoặc dùng GPU ngoài phạm vi.

`requirements.txt` hiện có lower bounds, thiếu Optuna; chưa là environment lock đã kiểm chứng. Lượt soạn này không sửa dependencies. Trước triển khai phải kiểm tra metadata tương thích Python/OS/CPU, resolver/wheel khả dụng, import và smoke test, rồi mới cập nhật version constraints bằng patch theo plan được duyệt. Không ghi placeholder hoặc `python==...` vào requirements.

**Local evidence 2026-11-12:** `/usr/local/bin/python3` báo Python 3.12.7, process x86_64, macOS 13.5.2; metadata thấy NumPy 2.5.4, pandas 3.0.6, PyYAML 6.0.3, Matplotlib 3.11.2, seaborn 0.13.2. Interpreter đó chưa có torch/sklearn/scipy/statsmodels/yfinance/pytest/optuna. Đây không phải kết quả import test và không đại diện mọi env trên máy. Không hardcode đường dẫn interpreter này vào sản phẩm.

**TBD:** bộ pin đã chạy local; runtime Python/PyTorch/CUDA/GPU Kaggle; dependency compatibility giữa hai môi trường. Khi chạy lưu environment snapshot, thiết bị thực tế và logs; không claim GPU đã kiểm chứng trước khi chạy.

## 6.2. Model / Training / Optuna

| Nội dung | Cấu hình Confirmed |
|---|---|
| Batch / seed | 32 / 42 |
| LSTM | 2 layers, dropout 0.2; hidden_dim 64 là cơ sở, hidden size được tuning |
| CNN 1D | 2 Conv1d, kernel 3, dropout 0.2; filters [64,32] cơ sở; BatchNorm/ReLU/MaxPool/AdaptiveAvgPool theo walkthrough |
| Optimizer | AdamW |
| Trial limit | 10 trial/study, tuần tự; tối đa 50 epoch/trial |
| Early stopping | Patience 10 theo validation MSE; chọn checkpoint tốt nhất |
| Scheduler | CosineAnnealingLR, T_max=50, eta_min=0, step mỗi epoch |
| Gradient clipping | max_norm=1.0 theo walkthrough |
| Objective | Minimize validation MSE; direct trung bình N x 5 phần tử |
| Sampler | TPESampler, n_startup_trials=3, seed=42 |
| Pruner | MedianPruner, n_warmup_steps=10; báo validation objective mỗi epoch |
| Search | lr: 1e-4..1e-2 log; hidden/channels: {32,64,128}; weight_decay: 1e-6..1e-3 log |

4 study là LSTM single-step, CNN single-step, LSTM direct-5, CNN direct-5. Recursive không có study thứ năm/sáu. Ngân sách tối đa 40 trial, 2000 trial-epoch trước early stopping/pruning, chưa tính huấn luyện cuối. Trial pruned/failed vẫn có record và không tự sinh trial bù vượt ngân sách. Pruning có thể bỏ cấu hình hội tụ chậm; không bảo đảm tối ưu toàn cục. Báo thời gian từng study, không gọi số trial bằng nhau là compute bằng nhau.

**Confirmed — phân vai metrics:** dùng MSELoss và validation MSE trên thang MinMax-scaled để huấn luyện/chọn checkpoint; nhãn rõ `validation MSE — scaled`. Báo cáo chính: MAE, RMSE (USD), MAPE, R², DA; lưu thêm MSE USD² trên giá gốc trong artifact đánh giá chi tiết từng bước và tổng hợp. Trên slide nhấn MAE/RMSE, không đọc scaled loss thành USD.

**Proposed cụ thể hóa còn cần review:** epoch report dùng index 1..50 nhất quán; MedianPruner n_startup_trials=5 đã Confirmed (khác sampler startup=3); interval_steps=1, n_min_trials=1 còn Proposed. Warmup của pruner không ngăn early stopping riêng. CNN channels search lớp đầu C, lớp sau C/2 đã được human duyệt và ghi walkthrough §2.3; không tự đổi mapping. Ghi giá trị lr trial là lr ban đầu, scheduler thay đổi lr trong epoch sau. Các lựa chọn này chưa được xem là Confirmed trước review bản DEFINE.

Loss nonfinite phải dừng trial và ghi lỗi, không thay bằng điểm tốt giả. Lưu COMPLETE/PRUNED/FAIL, objective, duration, best epoch, actual epochs, sampler/pruner config và checkpoint. Test chỉ mở sau khóa study/model selection. Không tự refit DL trên train+val; **Proposed** dùng checkpoint train-only tốt nhất để đánh giá cuối, không thêm run cuối ngoài ngân sách mà chưa duyệt.

## 6.3. Engineering

| Module | Trách nhiệm đích |
|---|---|
| src/datasets/ | Collection, EDA helpers, policy preprocessing, scaling, windows/Dataset |
| src/models/ | LSTM/CNN và baseline definitions/adapters |
| src/training/ | Fit/val, Optuna, early stopping, checkpoint |
| src/evaluation/ | Metrics, alignment, comparison |
| src/predict/ | Forecast orchestration single/recursive/direct |
| src/utils/ | Logging, provenance, shared IO/plot helpers không business logic lẫn layer |
| config/; notebooks/; tests/ | Cấu hình tập trung; demo/EDA gọi module; kiểm thử |

Không viết toàn bộ pipeline trong Notebook hay một file; không tạo file rỗng để giả tiến độ. Seed tại entry point, ghi deterministic settings và giới hạn tái lập giữa thiết bị. Các path cấu hình tương đối, hỗ trợ đường dẫn Kaggle qua config; không hardcode máy cá nhân. Không xuất .env/secrets, không commit data/model lớn. File phụ trợ AI trong `.agents/<task>/` hoặc temp được dọn; không đưa vào public/src/scripts/docs như tài liệu sản phẩm.

Quy trình implementation: plan được human duyệt -> patch/edit -> self-review -> smoke test -> run trong phạm vi -> đối chiếu description/DEFINE và acceptance criteria -> ghi bằng chứng -> mở diff. Sanity overfit một batch trước full Kaggle training; tiêu chí định lượng overfit và ngân sách sanity cần plan riêng, không tự coi mọi loss không về 0 là chắc chắn bug. Không commit/reset/revert khi chưa yêu cầu.

# 7. EVALUATION CRITERIA

## 7.1. Functional Evaluation và Traceability

| ID / Feature | Kiểm tra cụ thể | Expected Result |
|---|---|---|
| E01 / F01 | Request hợp lệ và lỗi mạng/empty/schema | Snapshot/provenance hoặc lỗi rõ; cache có nhãn |
| E02 / F02 | Dữ liệu lỗi, thiếu, trùng, outlier | Findings đúng dòng/ngày; chưa xử lý trước human review |
| E03 / F02 | Fixture có val/test cực trị, target ở biên split | Scaler chỉ fit train; không target vượt biên; sequence shape đúng |
| E04 / F03 | Một batch sanity, fit nhỏ, save/load | Loss hữu hạn; checkpoint reload khớp prediction trong tolerance được định nghĩa |
| E05 / F04 | Input đúng/sai shape hoặc thiếu lịch sử | Output một giá/date hoặc lỗi validation rõ |
| E06 / F05 | Tính metric từ cặp giá tính tay; zero/constant case | Đúng công thức và undefined policy |
| E07 / F06 | Kiểm tra ảnh và metadata | Đủ chart, đúng labels/đơn vị/date, đọc trực tiếp ảnh |
| E08 / F07 | Spy Recursive và direct shape | Recursive không đọc future actual; cả hai trả 5 bước |
| E09 / F08/F09 | Join prediction theo origin/date/step | Chung cohort; đủ Linear Regression, ARIMA, LSTM, CNN |
| E10 / F03 | Study nhỏ kiểm tra report/prune/budget | Không quá giới hạn; lưu đủ state/config/history |
| E11 / F10 | Chạy Notebook từ kernel sạch với artifacts hợp lệ và thiếu | Demo có kết quả hoặc lỗi hướng dẫn khắc phục, không tự chạy full tuning |
| E12 / All | Từ run config truy ngược snapshot/model/metrics | Provenance đầy đủ; không ghi đè run khác |

Các fixture/test harness chính thức sẽ thiết kế trong implementation plan, chưa tồn tại chỉ vì xuất hiện ở bảng. Documentation-only không yêu cầu chạy full training để nghiệm thu file này.

## 7.2. Model Performance Metrics

Đặt `y[i,h]` là actual USD, `p[i,h]` là prediction USD tại origin i, bước h; `e=y-p`. Có N origin chung, H bước. Tất cả metrics giá cuối dùng inverse-scaled data; metrics scaled trong tuning phải gắn nhãn riêng.

| Metric | Công thức | Đơn vị / diễn giải / sử dụng |
|---|---|---|
| MAE — Mean Absolute Error | mean(abs(e)) | USD, sai lệch tuyệt đối trung bình; càng nhỏ càng tốt |
| MSE — Mean Squared Error | mean(e²) | USD² trên giá gốc: lưu bắt buộc trong bảng/artifact chi tiết từng bước và gộp; loss/objective trên scaled phải gắn nhãn riêng; nhạy lỗi lớn, không ô chỉ số chính trên slide |
| RMSE — Root Mean Squared Error | sqrt(mean(e²)) | USD, nhạy lỗi lớn; càng nhỏ càng tốt |
| MAPE — Mean Absolute Percentage Error | 100 * mean(abs(e/y)) | %, sai số tương đối; nhạy actual gần 0 |
| R² — Coefficient of Determination | R²_h = 1 - sum_i(e[i,h]²)/sum_i((y[i,h]-mean_i(y[i,h]))²) | Không đơn vị; có thể âm, không đọc là % accuracy; so trên cùng cohort |
| DA — Directional Accuracy | DA_h = 100 * mean_i(sign(y[i,h]-c[i]) == sign(p[i,h]-c[i])) | %, c[i] là Close tại origin; tỷ lệ dự báo đúng chiều biến động so với origin |

MAE/MSE/RMSE/MAPE tính từng bước và gộp N x H cặp; RMSE gộp lấy căn MSE gộp, không lấy trung bình RMSE bước. R² tổng hợp là trung bình đều R² từng bước, không flatten; nếu target hằng hoặc không đủ mẫu làm bước undefined thì ghi undefined và tổng hợp undefined, không bỏ ngầm bước. MAPE actual=0 -> undefined/report, không bỏ mẫu hoặc thêm epsilon ngầm; actual âm vi phạm giá hợp lệ -> review. Gần 0 giữ giá và kết quả, giải thích độ nhạy; ngưỡng cảnh báo tự động là TBD nếu triển khai. sign(0)=0, không gộp ngang giá với tăng; DA bước 1 là chính, DA bước 2..5 bổ sung theo gói C. Khi thực tế chưa có đủ H, không giả số liệu để tạo metric gộp.

Không đặt ngưỡng MAE/RMSE tùy ý hay tuyên bố LSTM thắng trước chạy. Hoàn thành kỹ thuật khác với chứng minh cải thiện mô hình; nếu thua baseline phải báo đúng và phân tích giới hạn.

## 7.3. Baseline Evaluation

Linear Regression và ARIMA đều bắt buộc; không thêm Naive vào baseline hiện hành. ARIMA A: order=(5,1,0), trend='n', fit toàn bộ train; append quan sát đã xuất hiện với refit=False; không hội tụ ghi FAIL và nguyên nhân, không tự đổi order hoặc báo metric như fit thành công. Cùng snapshot, target, scale nghĩa giá, split và forecast origins với DL. Baseline không cần GPU hoặc cùng thuật toán fit, nhưng phải công bố input history và preprocessing khác biệt. ARIMA chỉ cập nhật trạng thái từ actual đã quan sát, không refit tham số trên test. Hyperparameter/order không chọn theo test. Không dùng fitted values trên train thay genuine forecasts để báo test performance.

## 7.4. Model Comparison / Rolling-origin

Sau chọn model trên val, cố định tham số. Tại mỗi phiên origin trong giao thức test, dùng lịch sử đã có để dự báo; chuyển origin kế tiếp mới được thêm actual vừa xuất hiện. Origin hợp lệ phải có đủ H target trong test và đủ context. Forecast từ phiên trước biên test có thể dùng nếu mọi target thuộc test. Single-step và H=5 có bảng riêng; khi so step 1 giữa các phương pháp dùng cohort chung H=5 để không sai tập.

| Model / Method | MAE | RMSE | MAPE | R² | DA step 1 | Train Time |
|---|---|---|---|---|---|---|
| Linear Regression / single & direct | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa đo |
| ARIMA(5,1,0) / 1..5 steps | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa đo |
| LSTM / single, recursive, direct | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa đo |
| CNN / single, recursive, direct | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa chạy | Chưa đo |

Các hàng phương pháp phải tách riêng khi có kết quả. **Proposed runtime measurement:** wall-clock fit, validation, checkpoint IO và scheduler của từng trial; báo tổng study riêng gồm trials; collection/EDA và plotting đo riêng, không nhập vào train time. Với GPU đồng bộ trước/sau mốc đo. Lưu device, GPU model, batch, precision, actual epochs và duration; không so thời gian khác hardware như bằng chứng kiến trúc nhanh hơn.

## 7.5. Multi-step Evaluation

H=5 cố định trong vòng hiện hành. Báo metrics từng step và tổng hợp theo 7.2; plot error-by-step, trajectory ở origin được chỉ định. Lưu forecast_origin, target_date, step để không nhầm nhiều dự báo cho cùng một ngày. Horizon chồng lấn tạo cặp phụ thuộc, không coi N x H là các quan sát độc lập để tuyên bố significance. Recursive không lấy actual bên trong horizon; direct không cần future feature. Tại origin mới có thể dùng actual mới theo rolling-origin.

## 7.6. Reproducibility / Acceptance Gates

Phải truy vết seed, snapshot hash/range, split, feature policy được duyệt, scaler, model/trial config, checkpoint, metrics, predictions, package/runtime/hardware và code revision nếu Git có. Có thể chạy lại từ snapshot/config; không tải latest rồi gọi là tái lập cùng thí nghiệm. Ghi tolerance và giới hạn nondeterminism, không bảo đảm bitwise đồng nhất giữa mọi thiết bị.

Trước bàn giao code: gen -> smoke test -> run -> check with DESCRIPTION/DEFINE; kiểm thử normal/invalid/edge/failure; kiểm tra ảnh thật; cập nhật tracking và review diff. Không claim test pass hoặc model accuracy nếu chưa có evidence.

**Open decisions register:** các mục này không được tự nâng thành Confirmed trong implementation.

| ID | Phần còn lại | Điều kiện đóng |
|---|---|---|
| D01 | Phiên hoàn tất, lịch sàn, biên 5 năm, snapshot/end date thực tế | Duyệt collection policy rồi kiểm tra dữ liệu tải thật |
| D02 | Cleaning/outlier/feature expansion | EDA train và human review |
| D03 | Dependency pins, Kaggle runtime/GPU | Resolver/install/import/smoke evidence trước full training |
| D04 | Pruner remaining settings/epoch index (objective scaled, startup=5 và CNN mapping đã chốt) | Review các Proposed ở 6.2 trước tuning |
| D05 | LR adapter và ARIMA fit history/trend/convergence policy | Duyệt baseline plan, chỉ fit/tune theo train/val |
| D06 | Schema/filename chi tiết, split rounding, runtime timing | Review Proposed ở mục 4 và 7 trước code tương ứng |
| D07 | Notebook inputs, operator skill và artifact-selection UX | Duyệt demo plan; không tự mở Web |
| D08 | Đồng bộ README/walkthrough/config/requirements/AGENTS | Plan patch riêng; giải quyết đường dẫn và quy tắc tài liệu cũ trước code |

## 7.7. Limitations

Một ticker và một khoảng 5 năm không đại diện mọi thị trường. Giá lịch sử không chứa toàn bộ thông tin tương lai; nonstationarity, sự kiện bất ngờ và data revision có thể làm thay đổi phân phối. Yahoo historical Close có split adjustment. Các mô hình mạng có thể overfit, Recursive có xu hướng tích lũy sai số, Direct phụ thuộc vào horizon huấn luyện cố định. MAPE nhạy khi giá trị gần zero, R² nhạy với variance của tập test, và DA chỉ đo chiều biến động mà không phản ánh biên độ sai số.

Nguồn kỹ thuật tham khảo (không thay quyết định human): [yfinance history](https://ranaroussi.github.io/yfinance/reference/yfinance.price_history.html), [price adjustment](https://ranaroussi.github.io/yfinance/advanced/price_adjustment.html), [Optuna TPE](https://optuna.readthedocs.io/en/stable/reference/samplers/generated/optuna.samplers.TPESampler.html), [Optuna MedianPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.MedianPruner.html), [statsmodels ARIMA append](https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMAResults.append.html), [scikit-learn R²](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html). Phiên bản API thực tế vẫn phải xác minh theo environment đã chọn.
