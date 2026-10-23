# DN1N — Xưởng nội dung GIS & WebGIS

Hai chế độ độc lập:

- **Làm việc với AI**: gọi OpenRouter thật từ trình duyệt cá nhân; An lập kế hoạch, chọn Agent và thực hiện các nhiệm vụ theo phụ thuộc. Kết quả có thể tải về và nghiệm thu.
- **Văn phòng 3D**: mô phỏng hoạt động, avatar và số liệu giả định. Chưa đồng bộ avatar với phiên AI.

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
Access-Control-Allow-Origin: https://xulytiengviet.github.io
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Mcp-Method, Mcp-Name
Access-Control-Expose-Headers: Mcp-Session-Id
Vary: Origin
```

Origin không bao gồm đường dẫn `/DN1N/`; các GitHub Pages khác cùng tài khoản dùng chung origin. CORS không thay thế xác thực và phân quyền. Thêm origin phát triển riêng nếu cần. Trình duyệt không thể tự bỏ qua CORS; không dùng proxy công khai để chuyển token.

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
