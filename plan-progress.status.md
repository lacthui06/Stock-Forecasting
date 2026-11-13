# Plan Progress Tracking

## Git sync / publish - 2026-11-13

- Human yêu cầu fetch, đồng bộ remote, tạo ThuongFEAI và push các thay đổi hiện tại.
- Đã fetch origin/main: 6023365 -> 4c1c4aa (docs: add define and design presentation).
- Tạm lưu local bằng stash gồm untracked, main fast-forward tới origin/main, tạo ThuongFEAI, apply lại stash; walkthrough auto-merge không conflict. Giữ stash backup, không reset/revert/ghi đè local.
- Phạm vi commit: DEFINE.md, DESIGN.md, walkthrough.md, tracking và các README scaffold hiện có tại models/ và src/. README rỗng chỉ giữ scaffold đã có, không ghi nhận code đã triển khai.
- Kiểm tra documentation/whitespace và nội dung staging trước commit; không chạy training vì không thay source triển khai. Push remote chỉ nhánh ThuongFEAI, không push main hoặc force-push.

## Bàn giao chỉnh DESIGN - 2026-11-13

- Human đã yêu cầu bắt đầu chỉnh DESIGN; đã tổ chức đúng 7 mục chính: System Architecture, Modules, Folder Structure, Data Flow, Interface/APIs, Milestones, Technical Risks.
- Bỏ Phase A/Phase B và Design (.py) đứng riêng; giữ trách nhiệm/file list tại Modules, signatures/data contracts tại Interfaces, quyết định DD trong phần sở hữu. Bỏ nhận định thiếu walkthrough, sửa số mục nội bộ.
- Tích hợp split trước EDA và fixed date boundaries; pipeline điều phối không import chéo EDA/cleaning; SQLite Optuna, CNN đã duyệt, ARIMA A, snapshot/export/DA/pruner và sanity policy.
- M5 fixture/train/validation, M6-M7 validation selection, M8 test sau khóa; M9 chưa đạt nếu thiếu lịch future forecast. Calendar hướng NASDAQ đã duyệt nhưng package/version vẫn TBD.
- Làm rõ scaler cần fitted state đầy đủ, ARIMA params JSON không đủ để hứa reload, resume SQLite không tự bảo đảm sampler/RNG. Không tự nâng LR scaled adapter, checkpoint train-only hoặc chi tiết objective/pruner chưa duyệt thành Confirmed.
- Rà tài liệu: đủ 7 heading chính, số subsection không trùng, code fences cân bằng, bỏ thuật ngữ provisional_split/finalize_split/split tạm/chốt cũ. Kiểm whitespace. Đây là kiểm tài liệu, không phải smoke test code/training.
- Lượt này chỉ sửa DESIGN.md và tracking; walkthrough có thay đổi từ lượt trước được giữ nguyên, không sửa source/config/dependencies hoặc commit. DEFINE còn cần plan đồng bộ split trước EDA/biên cố định trước triển khai.

## DESIGN discussion - 2026-11-13

- Quyết định mới nhất: human chọn ARIMA A: fit toàn bộ train, order=(5,1,0), trend='n'; append quan sát đã có refit=False; không hội tụ ghi FAIL và nguyên nhân, không báo fit thành công. Không chọn phương án B tuning trend.
- Human xác nhận CNN chi tiết: Conv(1,C,3,pad=1)->BN->ReLU->MaxPool(2)->Conv(C,C//2,3,pad=1)->BN->ReLU->AdaptiveAvgPool(1)->Flatten->Dropout(.2)->Linear(C//2,H), C={32,64,128}. Đã cập nhật walkthrough mục 2.3 với chú thích "Xuân Thường bổ sung/chỉnh sửa — 2026-11-13" theo yêu cầu. Các ghi nhận Proposed CNN/ARIMA bên dưới là lịch sử, được thay bởi quyết định này.
- Lượt này chỉ sửa walkthrough và tracking, chưa tái cấu trúc DESIGN, chưa sửa source/config hoặc chạy training.

- Human xác nhận pipeline điều phối: collection -> kiểm tra tối thiểu ngày/thứ tự -> split train/val/test trước EDA -> EDA train -> human review -> cleaning từng tập -> scaling -> windows. Cấm EDA xong mới chia. Khóa biên ngày ban đầu; cleaning không kéo dữ liệu val/test vào train, chỉ cập nhật số dòng/tỷ lệ thực.
- Human xác nhận pipeline.py điều phối; eda.py và cleaning.py không import/gọi chéo, nhận dữ liệu/schema/policy tường minh; tách import dependencies khỏi artifact flow.
- Human duyệt gộp DESIGN về 7 mục: Architecture, Modules, Folder Structure, Dataflow, Interfaces/APIs, Milestones, Technical Risks; bỏ mục Design (.py) riêng, chuyển responsibility vào Modules, signatures/contracts vào Interfaces; rút intro, sửa cross-reference và nhận định thiếu walkthrough. Chưa chỉnh DESIGN trong lượt này, đang chờ đóng lựa chọn còn mở.
- Human duyệt M5 kiểm bằng fixture/train/val; M6-M7 selection theo validation; M8 mới đánh giá test sau khóa model.
- Human duyệt dùng thư viện lịch NASDAQ có holiday/early-close; tên/version phải kiểm chứng trước thêm dependency.
- Human duyệt CSV + metadata.json + checksum cho snapshot; SQLite trong run cho Optuna kèm trial table; Kaggle phải lưu/chuyển storage để tiếp tục, không claim resume exact nếu thiếu sampler/RNG/environment state.
- Human duyệt outputs/runs giữ gốc, outputs/published giữ evidence, models/ chứa gói bàn giao run/trial chọn tường minh; DA join Close theo origin từ dữ liệu đã khóa.
- Human duyệt pruner startup=5 completed trials, sampler startup=3 tách biệt, warmup=10; ghi số trial thực sự pruned, không gọi pruning vô hiệu khi chưa chạy.
- Human duyệt sanity batch train/seed cố định, ghi loss/gradient/shape; threshold và step budget chốt trong plan test, chưa có pass evidence.
- CNN đối chiếu: walkthrough mô tả 2 Conv1d kernel=3, BN/ReLU/MaxPool/AdaptiveAvgPool; config filters=[64,32], dropout=.2. DESIGN phù hợp mức thành phần, nhưng thứ tự cụ thể/padding=1/pool=2/C->C//2 còn là Proposed; user hỏi đối chiếu, chưa xác nhận chi tiết đó.
- ARIMA human yêu cầu 2 phương án: A đề xuất fit toàn bộ train, order=(5,1,0), trend='n'; B fit toàn bộ train, thử trend='n' và 't', chọn validation MSE trên giá USD cùng cohort H=5. Cả hai append actual đã có refit=False, không fit/tune trên test; không hội tụ ghi FAIL không báo metric như thành công. B thêm hai fit baseline, không nhập vào 40 DL trials; chờ duyệt.
- Q08 Linear Regression scaled chưa được human xác nhận riêng trong vòng này; giữ Proposed. Chưa tự chuyển toàn bộ DESIGN thành Confirmed.

Cập nhật: 2026-11-12. Trạng thái: đã tạo DEFINE.md theo yêu cầu human; chờ review bản đặc tả, chưa triển khai pipeline.

## Bàn giao DEFINE.md

- Đã tạo DEFINE.md gồm đúng 7 nhóm theo prompt, giữ quyết định mới nhất 50 epoch / patience 10, 4 study x 10 trial và gói C.
- Bao gồm contract dữ liệu/sequence, single-step/recursive/direct, Linear Regression/ARIMA, metrics và undefined policies, EDA human review, reproducibility và acceptance criteria.
- Các thiết kế cụ thể hóa mới (schema/filename, split rounding, pruner remaining settings/epoch indexing, CNN channel mapping, objective scale, baseline adapters) được đánh dấu Proposed/TBD để human review; không tự coi đã duyệt.
- Chỉ tạo tài liệu và cập nhật tracking; không sửa config/requirements/AGENTS/README/walkthrough, không cài dependencies, không chạy model hoặc commit.
- Kiểm tra tài liệu: đủ 7 heading, required markers (case-insensitive), code fences cân bằng, link local; whitespace check file mới. Lần kiểm tra marker đầu phân biệt hoa/thường nên không nhận Patience; điều chỉnh phép kiểm tra, không đổi yêu cầu.
- Cần plan đồng bộ tài liệu/config theo DEFINE sau review; các ghi nhận historical dưới đây không phải cấu hình hiện hành.

## 0. Đồng bộ vào Stock-Forecasting (2026-11-12)

### Quyết định mới nhất sau đối chiếu (ưu tiên hơn các ghi nhận lịch sử bên dưới)

- Human chọn dữ liệu mới nhất nguồn trả về tại lần thu thập, giữ cửa sổ 5 năm; đề xuất chỉ nhận phiên đã đóng, loại nến đang chạy, ghi retrieval timestamp / actual date range / row count và snapshot. Chưa xác nhận ngày mới nhất bằng tải thật.
- Demo giai đoạn hiện tại: Notebook trước; Web chưa triển khai ở giai đoạn này.
- Dependencies: kiểm tra requirements.txt và máy local hiện tại; Kaggle xác minh lại khi triển khai. Không có requirements.tsx trong danh sách file đã kiểm tra.
- Kiểm tra read-only local: /usr/local/bin/python3, Python 3.12.7, process x86_64, macOS 13.5.2. Metadata có numpy 2.5.4, pandas 3.0.6, PyYAML 6.0.3, matplotlib 3.11.2, seaborn 0.13.2. Chưa có torch/scikit-learn/scipy/statsmodels/yfinance/pytest/optuna trong interpreter này. Chưa cài/import-test hoặc kiểm chứng bộ dependencies; không suy ra mọi Python env trên máy đều thiếu.
- Human chỉ dẫn dùng thiết lập đã có trong project: batch_size=32, seed=42; LSTM 2 layers, dropout=0.2, hidden_dim=64 làm cấu hình cơ sở; CNN filters=[64,32], kernel_size=3, dropout=0.2; scheduler CosineAnnealingLR theo walkthrough. Hidden/channels và learning rate/weight decay vẫn phải tuân search space đã duyệt khi tuning; không dùng config cố định để thay Optuna.
- Human đã chọn gói C: TPESampler n_startup_trials=3, seed=42; MedianPruner với n_warmup_steps=10, báo validation objective theo epoch. Quy ước index epoch và các tham số pruner còn lại phải ghi rõ khi đặc tả/triển khai, không tự claim đã kiểm chứng.
- Gói C / ARIMA: giữ order=(5,1,0); append quan sát thực tế chỉ sau khi đã xuất hiện tại rolling-origin, refit=False, không dùng actual tương lai trong horizon đang dự báo.
- Gói C / R²: tính từng bước và trung bình đều các bước; nếu target hằng làm R² không xác định, báo rõ undefined, không âm thầm thay bằng điểm hữu hạn hoặc bỏ bước đó khỏi trung bình.
- Gói C / MAPE: kiểm tra actual > 0; actual=0 thì báo metric không xác định, không âm thầm bỏ mẫu; gần 0 giữ kết quả và giải thích độ nhạy, không tự sửa actual. Ngưỡng gắn cờ gần 0 còn cần định nghĩa nếu áp dụng.
- Gói C / Directional Accuracy: giữ bước 1 so với giá tại origin là chỉ số chính; thêm DA từng bước t+1..t+5 đều so với giá tại origin, không nhầm với hướng thay đổi giữa hai phiên liên tiếp.
- Gói C / Scheduler: CosineAnnealingLR T_max=50, eta_min=0, step mỗi epoch. Giữ 4 study x 10 trial, tối đa 50 epoch/trial, early stopping patience 10. Pruning có thể cắt trial hội tụ chậm; ghi trạng thái COMPLETE/PRUNED/FAIL và epoch dừng thực tế, không đánh đồng trial pruned với train đủ 50 epoch. Chưa chạy study hoặc sửa config.

- Human chọn tối đa 50 epoch/trial, early stopping patience 10, thay 30/5 tại C10/C13. Giữ Optuna 4 study x 10 trial, tuần tự; tổng tối đa 40 trial, 2000 trial-epoch trước dừng sớm, chưa tính huấn luyện cuối.
- Giữ single-step, Recursive và Direct multi-output cho LSTM/CNN cùng search space C12.
- Metrics báo cáo theo project STOCK: RMSE, MAE, MAPE, R², Directional Accuracy. MSE dùng loss/objective; không tự thêm thành metric báo cáo bắt buộc.
- Human yêu cầu tạo DEFINE.md (viết hoa): nguồn yêu cầu; DESCRIPTION.md là phiếu đăng ký tóm tắt; walkthrough.md giữ phương pháp/kết quả. Chưa tạo trong lượt discussion này; cần đồng bộ các tài liệu liên quan trong plan sau.
- Human chọn src/datasets/ làm phân hệ dữ liệu; chưa sửa roadmap src/data/ trong README/walkthrough.
- Giữ deliverable theo DESCRIPTION: Notebook / Web Demo tối thiểu. Cách hiện thực một trong hai hay cả hai còn cần làm rõ; chưa tự thêm web stack.
- Cổng EDA -> trình bằng chứng -> human review trước xử lý missing/outlier/feature mở rộng đã được tái xác nhận.
- Human chốt giữ baseline Linear Regression và ARIMA theo project STOCK. Đề xuất Naive + Linear Regression bắt buộc / ARIMA mở rộng không được chọn; không tự thêm Naive vào phạm vi baseline bắt buộc.
- Human xác nhận auto_adjust=False, target Close theo Yahoo (vẫn split-adjusted), lưu Adj Close/corporate actions để đối chiếu. Không gọi Close này là giá nguyên gốc hoàn toàn. Không dùng Adj Close làm target hoặc feature mặc định.
- Dependencies còn chưa xác minh trên Kaggle: requirements hiện là lower bounds, chưa phải bộ version đã kiểm chứng, thiếu Optuna. Chưa sửa/cài dependencies.
- README liệt kê scripts/train.py, scripts/eval.py và source files dự kiến nhưng chưa tồn tại; src module README hiện rỗng. Phải phân biệt planned/implemented/verified khi đồng bộ tài liệu.

- Human đã duyệt bổ sung tracking và 7 README module vào repo; giữ nguyên bản nguồn COURSE-WORK.
- Nguồn yêu cầu hiện hành: AGENTS.md, DESCRIPTION.md, walkthrough.md và config/default_config.yaml của STOCK. File này chỉ theo dõi tiến độ, không thay thế các tài liệu đó.
- Đã chốt theo STOCK: NVDA (NASDAQ), giá Close (USD), interval 1d, dữ liệu 5 năm gần nhất, lookback mặc định 60 phiên, horizon đa bước 5 phiên, chia thời gian 70/15/15.
- Metrics báo cáo: RMSE, MAE, MAPE (%), R² và Directional Accuracy (%), tính trên giá đã inverse scaling khi áp dụng scaling. MSE vẫn có thể là loss/objective, không thay bộ metrics STOCK.
- Các quyết định local khác được bảo toàn bên dưới để truy vết, chưa phải quyền ghi đè tài liệu STOCK. Cần đối chiếu: C02/C11 (single-step/recursive và 4 study so với phạm vi multi-step STOCK), C13 (patience 5 so với STOCK 10), C17 (define.md so với DESCRIPTION.md), C20 (Naive so với baseline Linear Regression/ARIMA). Optuna, ngân sách trial và Kaggle là quyết định local cần tích hợp bằng plan riêng; chưa thay config STOCK.
- Giữ README.md, requirements.txt, .gitignore, AGENTS.md, DESCRIPTION.md, walkthrough.md, config và toàn bộ .agents/ của STOCK. Không chuyển .gitattributes hay skill từ COURSE-WORK.
- README nguồn src/evalute/ được bổ sung tại src/evaluation/ theo C04; bản nguồn giữ nguyên. Roadmap STOCK còn tham chiếu src/data/, trong khi README bổ sung dùng src/datasets/: chưa thay kiến trúc hay các liên kết roadmap.
- Chưa tải dữ liệu, chạy training hoặc xác minh chất lượng mô hình.

## 1. Mục đích và quy trình

- File này theo dõi quyết định, kế hoạch, tiến độ và bằng chứng kiểm tra; không thay thế đặc tả yêu cầu.
- Sau mỗi vòng thảo luận, lưu riêng Confirmed, Proposed và TBD. Không xem đề xuất là quyết định đã duyệt.
- Chỉ bắt đầu implementation plan cho phạm vi đã thảo luận và chốt với human; chỉ sửa sản phẩm sau khi plan tương ứng được duyệt.
- Sau sinh code: gen -> smoke test -> run trong phạm vi được duyệt -> check with description (đối chiếu đặc tả và acceptance criteria).
- Ghi lệnh, kết quả thực tế, lỗi và phần chưa kiểm chứng. Có lỗi: sửa, kiểm tra lại các bước bị ảnh hưởng; không đánh dấu hoàn thành chỉ vì code chạy.
- Sửa bằng patch/edit, mở review diff; không tự commit/reset/revert, không xuất nội dung .env.

## 2. Confirmed

| ID | Quyết định | Tiến độ |
|---|---|---|
| C01 | Yahoo Finance qua yfinance; Python; Regression; LSTM là mô hình chính | Đã xác định từ prompt; chưa triển khai |
| C02 | Single-step trước; Multi-step và CNN comparison đều bắt buộc, thực hiện sau pipeline LSTM một bước | Human đã xác nhận |
| C03 | Metrics RMSE/MAE/MAPE (%)/R²/Directional Accuracy (%) theo STOCK; MSE dùng cho loss/objective khi được đặc tả; loss scaled phải ghi rõ | Đồng bộ STOCK; target Close, đơn vị giá USD |
| C04 | Đổi src/evalute/ thành src/evaluation/ | Đã bổ sung README tại src/evaluation/ trong STOCK; src/evalute/ ở COURSE-WORK giữ nguyên |
| C05 | Kết quả từng thí nghiệm tại outputs/runs/<run_id>/ | Đã duyệt, chưa triển khai |
| C06 | Chọn phần playbook phù hợp Regression/Time Series, không áp dụng máy móc nội dung phân loại ảnh | Human đã xác nhận |
| C07 | Dùng file này lưu thảo luận và trạng thái, theo quy trình kiểm tra tại mục 1 | Đang áp dụng |
| C08 | Optimizer AdamW | Human đã chọn; search space tại C12 |
| C09 | Dùng Optuna để tuning, thay đề xuất tuning thủ công | Human đã chọn; chưa cài đặt hoặc chạy study |
| C10 | Giới hạn 10 trial/study và tối đa 30 epoch/trial | Human chốt lại 10 trial thay cho 7 trial; giữ 30 epoch; chưa chạy |
| C11 | Cả Recursive và Direct multi-output cho LSTM và CNN; 4 study: mỗi kiến trúc có single-step và direct multi-output; recursive dùng model single-step; chạy tuần tự | Human duyệt bảng; tối đa 40 trial, 1200 trial-epoch, chưa tính huấn luyện cuối; chưa chạy |
| C12 | Optuna search space: learning rate 1e-4 đến 1e-2 theo log; LSTM hidden size / CNN channels trong {32, 64, 128}; AdamW weight_decay 1e-6 đến 1e-3 theo log | Human giữ nguyên bảng gốc, không dùng đề xuất thu hẹp |
| C13 | Objective giảm validation MSE; direct multi-output lấy trung bình trên H bước; early stopping patience 5; test chỉ đánh giá sau chọn cấu hình | Human duyệt bảng, chỉ đổi giới hạn 50 thành 30 epoch/trial |
| C14 | Tên chính thức StockVision; người dùng là người tham gia thị trường chứng khoán, mục đích dự báo giá cổ phiếu phục vụ phân tích thực tế | Chưa xác nhận giao diện, trình độ Python/ML hoặc tư vấn đầu tư; không tự mở rộng scope |
| C15 | Chia train/validation/test theo thời gian 70/15/15 | Chưa chốt quy tắc làm tròn và mốc ngày sau thu thập |
| C16 | EDA phải trình bày missing, duplicate và outlier để human kiểm tra trước khi duyệt cách xử lý | Missing chọn sau khảo sát; duplicate cân nhắc xóa/gộp theo bản chất; IQR/Z-score/transformation là phương án xem xét, không tự áp dụng |
| C17 | Phân vai define.md giữ yêu cầu; walkthrough giữ phương pháp/kết quả và dẫn chiếu; README module giữ quyết định kỹ thuật | Human xác nhận; cách viết hoa tên file cần giữ nhất quán khi tạo |
| C18 | Kaggle là môi trường tuning/training | Human đã chọn; chưa xác minh GPU/runtime hoặc chạy job |
| C19 | Cách biến đổi/làm sạch feature phải dựa trên bằng chứng EDA và human duyệt | Human xác nhận |
| C20 | Naive dùng target cuối cho mọi bước; rolling-origin mỗi phiên, không cập nhật trọng số bằng test; chung origin đủ H target; metrics từng bước và gộp, lưu origin/date/step | Human xác nhận giao thức đã trình bày; RMSE gộp là căn MSE gộp |

## 3. Proposed - chờ duyệt

| ID | Đề xuất | Lý do / giới hạn |
|---|---|---|
| P01 | datasets phụ trách collection, EDA, preprocessing, feature selection/engineering; tách file theo trách nhiệm | Tránh gộp toàn bộ pipeline vào một file; chưa chốt chỉ báo cụ thể |
| P02 | training phụ trách training, validation, checkpoint và tuning; evaluation tính metrics và so sánh cuối | Tuning chỉ dùng validation, không dùng test |
| P04 | Lưu/nạp checkpoint tốt nhất; một seed cố định cho vòng đầu | Patience 5 và giới hạn 30 epoch đã chốt; seed cụ thể chưa duyệt. Nếu best epoch sát trần, báo khả năng chưa hội tụ, không tự tăng epoch |
| P08 | Nếu dùng TPESampler: đề xuất n_startup_trials=3; chưa bật pruning vòng đầu | Giữ đề xuất chờ duyệt với ngân sách 10 trial; cần xác minh API/version khi triển khai |
| P07 | CNN 1D | Đã chốt theo STOCK; baseline hiện hành là Linear Regression và ARIMA, C20 giữ để đối chiếu lịch sử |
| P09 | PyTorch, venv local, Python 3.11 làm ứng viên; local CPU cho EDA/smoke test; Kaggle tuning/training theo C18 | Framework/Python và EDA location chưa chốt; Kaggle dùng runtime thực tế và kiểm tra tương thích, không giả định version |
| P10 | Window mặc định 60 phiên, horizon multi-step 5 phiên; interval 1d | Đã chốt theo STOCK; single-step là luồng local cần đối chiếu riêng, không khẳng định cấu hình tối ưu |
| P11 | Target Close (USD), feature cơ sở là lịch sử Close theo walkthrough STOCK | Target đã chốt; chế độ điều chỉnh còn cần xác minh khi triển khai; feature mở rộng cần EDA trên train và human duyệt |
| P13 | NVDA (NASDAQ), interval 1d, period 5y theo STOCK | Thay đề xuất AAPL/11 năm bằng STOCK; số hàng và mốc ngày thực phải kiểm tra sau tải |
| P14 | Raw thu thập auto_adjust=False và corporate actions; kiểm tra Close/Adj Close trước khi chốt target | Dự báo nominal Close và adjusted Close có ý nghĩa khác nhau. Điều chỉnh lịch sử có thể dùng corporate actions sau origin; không claim point-in-time sạch khi chưa kiểm toán |

## 4. TBD và nội dung cần làm rõ

- Đã chốt NVDA, NASDAQ, USD, period 5y, interval 1d; còn xác minh chế độ điều chỉnh giá và mốc ngày tải thực tế.
- Target Close, lookback 60 và horizon 5 đã chốt theo STOCK; feature mở rộng, mốc chia tập và chính sách xử lý sau EDA còn cần làm rõ.
- Đã chốt cả recursive và direct multi-output cùng ma trận 4 study và giao thức tại C20; horizon 5 theo STOCK; ngày origin cụ thể còn TBD. Recursive đa biến cần chính sách cho feature tương lai; chưa được tự điền hoặc dùng actual tương lai.
- Framework, Python/dependency versions, môi trường và ngân sách thời gian thực tế.
- Nguồn tra cứu vòng thảo luận này: https://ranaroussi.github.io/yfinance/reference/yfinance.price_history.html ; https://www.tensorflow.org/tutorials/structured_data/time_series ; https://otexts.com/fpp3/regression.html . Nguồn không chứng minh window 60 / horizon 5 tối ưu cho cổ phiếu; đây là đề xuất thiết kế. Chưa tải dataset để xác minh số năm. Yahoo quote pages trả 429 trong lần tra cứu.
- Ngân sách, search space, objective và patience đã chốt tại C10-C13; sampler/pruner, seed và thang đo validation objective cần đặc tả tiếp. Báo cáo cuối vẫn inverse scaling; chưa được phép chạy tìm kiếm trước khi plan triển khai được duyệt.
- Chống leakage: fit scaler/imputer/chọn feature dựa trên train; validation dùng chọn cấu hình; test chỉ đánh giá cuối. Feature chỉ dùng thông tin có sẵn tại forecast origin. Không backfill/interpolate từ tương lai. Window đa bước không được có target vượt ranh giới split; lịch sử trước ranh giới có thể làm context nếu giao thức cho phép và được ghi rõ.

## 5. Theo dõi kế hoạch và kiểm chứng

| Công việc | Trạng thái | Bằng chứng / bước tiếp |
|---|---|---|
| Đọc quy tắc, khung thư mục và prompt | Hoàn thành đọc ban đầu | Project là scaffold, README module và requirements đang rỗng ở lần đọc |
| Thảo luận yêu cầu và kiến trúc | Đang thực hiện | Tiếp tục duyệt Proposed và làm rõ TBD |
| Ghi nhận quyết định vào file này | Đã thực hiện | Chỉ cập nhật tracking, chưa triển khai sản phẩm |
| Tài liệu yêu cầu / requirements.txt | Giữ bản STOCK | Dùng DESCRIPTION.md; chưa tạo define.md; dependencies chưa cài đặt hoặc kiểm chứng |
| Đổi tên module và triển khai code | Chưa bắt đầu | Chờ plan tương ứng được duyệt |
| Smoke test / run / đối chiếu đặc tả | Chưa áp dụng cho code | Chưa sinh code sản phẩm |

Lưu ý môi trường: bản nguồn COURSE-WORK chưa có Git. Bản tracking này nằm trong repo Stock-Forecasting đã clone; chưa commit/push thay đổi.
