# DN1N — Xưởng nội dung GIS & WebGIS

Mô phỏng doanh nghiệp một người chuyên viết nội dung công nghệ GIS, WebGIS và bản đồ. 12 Agent mang tên Việt, do một chủ doanh nghiệp giám sát.

| Agent | Chuyên môn |
| --- | --- |
| Mai | Tiếp nhận & tư vấn GIS |
| Lan | Nghiên cứu nguồn chuyên ngành |
| Trúc | Phân tích dữ liệu không gian |
| Đào | Kiến trúc nội dung & dàn ý |
| Sen | Viết bài chuyên sâu GIS |
| Cúc | Biên tập kỹ thuật & thuật ngữ |
| Hồng | Thiết kế bản đồ & đồ họa |
| Huệ | Thiết kế trải nghiệm WebGIS |
| Hà | Phát triển ví dụ & demo |
| Linh | Kiểm thử dữ liệu & WebGIS |
| Ngọc | Nguồn trích dẫn & quyền sử dụng |
| An | Điều phối & nghiệm thu |

Kịch bản mẫu: bài hướng dẫn xây dựng WebGIS điểm bán từ GeoJSON. Gói đầu ra mô phỏng gồm bản thảo, phân tích dữ liệu, bản đồ, demo và báo cáo kiểm thử. Mỗi Agent có nhiệm vụ, đầu ra và tiêu chí kiểm tra chuyên môn trong bảng thông tin.

## Sử dụng

Mở index.html bằng trình duyệt; không cần cài thư viện hoặc khóa API. Chọn avatar hoặc tên Agent để xem nhiệm vụ. Kéo xoay, cuộn phóng to; chọn tốc độ 1× / 60× / 300× / 1440×. Duyệt hồ sơ, yêu cầu làm lại và xuất nhật ký JSON.

## Phạm vi mô phỏng

- Avatar, dữ liệu, điểm tin cậy, chi phí và kết quả đều giả định; chưa kết nối AI, CRM hay xuất bản thật.
- Bộ đếm là lượt bàn giao nhiệm vụ, không phải số dự án hoàn tất.
- Agent di chuyển đến bàn tiếp theo; chưa có cơ chế chuyển cùng một hồ sơ xuyên suốt các Agent.
- Chạy khi trang mở và hiển thị. Tải lại khởi tạo phiên mới; xuất JSON để giữ nhật ký.
- Kiểm tra logic: node test.cjs.

GitHub Pages: Settings → Pages → Deploy from a branch → main / (root).
