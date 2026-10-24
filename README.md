# DN1N — Xưởng nội dung GIS & WebGIS

Hai chế độ độc lập:

- **Làm việc với AI**: gọi OpenRouter thật từ trình duyệt cá nhân; An lập kế hoạch, chọn Agent và thực hiện các nhiệm vụ theo phụ thuộc. Kết quả có thể tải về và nghiệm thu.
- **Văn phòng 3D**: mô phỏng hoạt động, avatar và số liệu giả định. Chưa đồng bộ avatar với phiên AI.

## Cloudflare Pages · dn1n.pages.dev

Đã có hướng dẫn cấu hình cho Cloudflare Pages tại [CLOUDFLARE_PAGES.md](CLOUDFLARE_PAGES.md). Kết nối repo `xulytiengviet/DN1N` bằng Git integration, nhánh `main`, lệnh build `node scripts/build-pages.mjs`, output `dist`. Cloudflare sẽ cấp URL `*.pages.dev` sau khi project được tạo, không phải Worker `*.workers.dev`.

Khi đổi sang Pages, dữ liệu IndexedDB đã lưu dưới GitHub Pages **không tự đồng bộ**, vì origin khác nhau. Xuất dự án JSON từ website cũ rồi nhập tại Pages nếu muốn chuyển tiến độ. Với máy chủ MCP, thêm origin `https://dn1n.pages.dev` vào CORS phía server (sau khi domain hoạt động). Không đưa khóa OpenRouter hoặc MCP vào mã nguồn hoặc Cloudflare build settings.

## Cài đặt trên GitHub Pages

Không cần npm hoặc máy chủ cho giao diện. Giữ `index.html` cùng thư mục `ai/`, bật Pages từ `main / (root)`. Mở trang qua HTTPS. ES modules cần HTTP/HTTPS; không mở bằng `file://`.

1. Vào https://openrouter.ai/settings/keys tạo khóa cá nhân, **đặt hạn mức tín dụng**.
2. Trong tab **Làm việc với AI**, dán khóa vào ô mật khẩu → **Kiểm tra khóa**. Không gửi khóa vào chat, issue hoặc repository.
3. Bấm **Tải danh sách mô hình**, chọn/nhập mã mô hình đang có. Có thể chọn mô hình khác cho Trúc, Hà và Linh. Nếu dùng MCP, chọn mô hình hỗ trợ gọi công cụ.
4. Chọn giới hạn token, số lượt gọi, số nhiệm vụ đồng thời và ngưỡng dừng theo chi phí đã ghi nhận.
5. Nhập prompt; tùy chọn đính kèm tối đa 3 tệp văn bản, tổng 60.000 ký tự.
6. Bấm **Phân việc & bắt đầu**. Prompt và tài liệu đầu vào được gửi đến OpenRouter và nhà cung cấp mô hình.
7. Theo dõi bên phải, xem đầu ra, nghiệm thu từng sản phẩm, tải bản văn bản hoặc xuất phiên JSON.

Khóa chỉ giữ trong bộ nhớ của tab, không ghi localStorage/sessionStorage/cookie hoặc gửi đến GitHub. JavaScript chạy trong trang vẫn có thể truy cập khóa trong phiên: chỉ dùng bản mã nguồn tin cậy và khóa có hạn mức. Đóng/tải lại trang cần nhập lại khóa. Nút **Xóa khóa khỏi tab** xóa tham chiếu của ứng dụng, không thu hồi khóa tại OpenRouter.

Không tự động thử lại yêu cầu lỗi để tránh phí trùng. Yêu cầu đã gửi có thể vẫn phát sinh phí khi bạn bấm dừng hoặc mạng bị ngắt. Giới hạn USD trong giao diện không phải trần chi phí cứng: phản hồi có thể thiếu chi phí, yêu cầu đang chạy vẫn có phí. Dùng hạn mức phía OpenRouter làm giới hạn chính; chi phí chưa được API báo sẽ được đánh dấu.

## MCP tùy chọn

OpenRouter là cổng mô hình AI, không tự cung cấp mọi công cụ GIS. Bản này có MCP client gọn chạy trong trình duyệt, gọi máy chủ do bạn cấu hình.

1. Cung cấp endpoint **Streamable HTTP HTTPS**. Không chèn token trong URL.
2. Chọn phiên bản `2025-11-25` (initialize; chấp nhận server trả 2025-03-26/2025-06-18/2025-11-25) hoặc `2026-07-28` (stateless).
3. Nhập Bearer token riêng nếu máy chủ yêu cầu. Không dùng khóa OpenRouter cho máy chủ MCP.
4. Bấm kết nối, chọn Agent được thấy từng công cụ. Mặc định chưa Agent nào được cấp công cụ.
5. Mỗi lần gọi công cụ hiện hộp xác nhận tên Agent, máy chủ và tham số. Chỉ thực thi sau khi người dùng cho phép.

Máy chủ phải xử lý OPTIONS/CORS, xác thực token, kiểm tra Origin và phân quyền. Cấu hình tham khảo phía server (không đặt các header này trong HTML):

```
Access-Control-Allow-Origin: https://dn1n.pages.dev
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Mcp-Method, Mcp-Name
Access-Control-Expose-Headers: Mcp-Session-Id
Vary: Origin
```

Origin không chứa đường dẫn. Nếu còn dùng bản GitHub Pages, máy chủ MCP cần cho phép riêng `https://xulytiengviet.github.io` theo chính sách allowlist của máy chủ. Trình duyệt Pages và GitHub Pages có origin khác nhau. CORS không thay thế xác thực và phân quyền. Thêm origin phát triển riêng nếu cần. Trình duyệt không thể tự bỏ qua CORS; không dùng proxy công khai để chuyển token.

### Phạm vi hỗ trợ MCP

- `tools/list` có phân trang, tối đa 100 công cụ / 10 trang; `tools/call` trả JSON hoặc SSE có kết quả trực tiếp.
- Phiên cũ hỗ trợ `initialize`, `notifications/initialized`, header session được server expose.
- Phiên 2026 hỗ trợ metadata và header phương thức/tên; công cụ có schema `x-mcp-header` bị loại vì chưa được triển khai.
- Chưa hỗ trợ stdio, HTTP+SSE cũ, OAuth discovery, sampling, elicitation, subscriptions, MCP Tasks hoặc kết quả yêu cầu tương tác nhiều vòng. Các trường hợp không hỗ trợ sẽ báo lỗi.
- Tối đa 6 lần gọi công cụ / nhiệm vụ, 5 vòng suy luận / nhiệm vụ. Không tự thử lại thao tác ghi.
- Cần máy chủ/cầu nối riêng để thực thi GDAL, Python, QGIS, trình duyệt kiểm thử hoặc công cụ GitHub. Chọn endpoint HTTPS truy cập được từ trình duyệt. Giao diện này không cài phần mềm lên máy bạn.

Không có MCP vẫn dùng được các nhiệm vụ soạn nội dung và mã. Ví dụ mã chưa chạy không được coi là demo đã kiểm thử; bản đồ được mô tả bằng văn bản không được coi là ảnh đã dựng.

## Điều phối và KPI

Agent: Mai (tư vấn), Lan (nghiên cứu), Trúc (phân tích), Đào (dàn ý), Sen (viết), Cúc (biên tập), Hồng (bản đồ), Huệ (UX), Hà (mã/demo), Linh (kiểm thử), Ngọc (nguồn/quyền sử dụng), An (điều phối).

Mô hình lập kế hoạch JSON, mã nhiệm vụ, Agent, trọng số và phụ thuộc được kiểm tra trước khi chạy. Bộ điều phối giới hạn 1–3 nhiệm vụ đồng thời. Nhiệm vụ lỗi chặn các nhiệm vụ phụ thuộc; nhiệm vụ độc lập vẫn tiếp tục. Kết quả Agent là đầu vào cho Agent kế tiếp, chưa đồng nghĩa chủ đã nghiệm thu.

- Tiến độ đầu ra: tổng trọng số nhiệm vụ có kết quả / tổng trọng số kế hoạch.
- Tiến độ nghiệm thu: tổng trọng số nhiệm vụ được chủ đánh dấu đạt / tổng trọng số.
- Token và chi phí: từ usage OpenRouter; không tự suy ra khi API không báo.
- Công cụ: số kết quả không có `isError` / số lần thực gọi, không phải chứng nhận chất lượng sản phẩm.
- Biểu đồ thời gian từng nhiệm vụ gồm thời gian chờ phê duyệt/công cụ.

Không có điểm chất lượng hoặc phần trăm kiểm thử tự bịa. Đầu ra LLM luôn cần đọc và kiểm tra. Văn bản/HTML/JavaScript do AI tạo chỉ hiển thị dạng văn bản, không thực thi trong trang.

## Giới hạn chạy trên trình duyệt

Giữ tab mở để điều phối tiếp tục. Tab nền có thể bị trình duyệt làm chậm hoặc ngủ; đóng/tải lại mất phiên. Chưa có lưu tự động hoặc nhập khôi phục. Xuất JSON để giữ kết quả; tập tin gồm prompt, tệp đầu vào, sản phẩm và nhật ký, không chứa trường khóa cấu hình. Không có xuất bản hoặc push GitHub tự động. Muốn chạy nền 24/7 cần backend riêng.

## Kiểm tra

```
node test.cjs
node --test ai/test.mjs
```

Kiểm tra mô phỏng cũ và bộ điều phối/API/MCP bằng phản hồi giả lập: phụ thuộc, lỗi, hủy, hạn mức, tool calling, SSE, phân trang, phiên giao thức và KPI. Kiểm tra live cần API key OpenRouter và endpoint MCP của người dùng; không có khóa được đóng gói trong mã nguồn.

## Tài liệu giao thức

- https://openrouter.ai/docs/api/reference/authentication
- https://openrouter.ai/docs/guides/features/tool-calling
- https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http

## V3 — Phòng điều hành lấy cảm hứng từ Paperclip

Bản này áp dụng mô hình mục tiêu → dự án → nhiệm vụ, phân công có phụ thuộc,
chủ duyệt kế hoạch trước thực thi, nghiệm thu đầu ra, phản hồi và làm lại có phiên bản.
Đây là phần triển khai độc lập dành cho GitHub Pages, không cài máy chủ Paperclip.

- **Yêu cầu & kế hoạch:** chọn mẫu bài viết GIS, phân tích dữ liệu hoặc WebGIS; nhập mục tiêu và độc giả. An lập kế hoạch, chủ kiểm tra phân công rồi duyệt chạy.
- **Bảng công việc:** chờ xử lý, đang làm, chờ nghiệm thu, đã nghiệm thu, cần xử lý. Mỗi Agent nhận tối đa một nhiệm vụ đồng thời. Có ưu tiên và cổng nghiệm thu đầu vào tùy chọn.
- **Sản phẩm:** đọc bản nháp dạng văn bản an toàn; nghiệm thu hoặc phản hồi yêu cầu sửa. Làm lại một nhiệm vụ sẽ vô hiệu hóa đầu ra phụ thuộc, giữ tối đa 5 phiên bản trước.
- **Đội ngũ & ngân sách:** 12 Agent Việt hóa, mô hình riêng và ngưỡng chi phí riêng theo dự án; có thể tạm dừng nhận việc. Ngưỡng tính theo chi phí API đã trả về, không bảo đảm hạn mức cứng cho yêu cầu đang chạy. Đặt hạn mức khóa ở OpenRouter.
- **Dự án đã lưu:** IndexedDB trên thiết bị, xuất/nhập JSON để chuyển máy. Không lưu khóa OpenRouter hay token MCP. Dữ liệu dự án không được mã hóa; các trang cùng origin có thể truy cập. Không nhập bí mật vào prompt.
- **Khôi phục:** nhiệm vụ đang chạy được đánh dấu bị ngắt. Không tự gọi API/công cụ khi mở dự án. Chủ kiểm tra tác động công cụ rồi xếp lại và tiếp tục.
- **Chống trùng trong trình duyệt:** Web Locks khóa thực thi theo dự án, phiên bản bản lưu phát hiện ghi đè từ tab khác. Đây không phải khóa phân tán qua nhiều máy.
- **Dự án mẫu:** dữ liệu giả định ghi nhãn rõ, không gọi API. Văn phòng 3D vẫn là mô phỏng độc lập, không đại diện cho tiến độ AI thật; bảng điều hành AI phản ánh nhiệm vụ thực tế.

GitHub Pages không cung cấp backend hoặc tiến trình 24/7. Muốn tiếp tục khi đóng trình duyệt cần máy chủ điều phối riêng (có thể triển khai Paperclip), kho bí mật, cơ sở dữ liệu và cơ chế xác thực. MCP là kết nối công cụ; OpenRouter là cổng mô hình, hai cấu hình độc lập.

Kiểm tra: `node --test ai/test.mjs ai/workspace.test.mjs` và `node test.cjs`.
