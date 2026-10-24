# Triển khai DN1N tại Cloudflare Pages

Nguồn GitHub: https://github.com/xulytiengviet/DN1N

## Phân biệt Worker và Pages

Trong tài khoản Cloudflare đang có một **Worker** tên `dn1n` (trong ảnh người dùng). Worker này có URL dạng `dn1n.<account>.workers.dev`. Không thể dùng nút **Add Domain** tại Worker để đổi Worker URL thành `dn1n.pages.dev`. Để tạo Pages domain, tạo một project **Pages** mới và kết nối GitHub. Không xóa Worker nếu còn dùng.

## Cloudflare Pages → Connect to Git

1. Cloudflare Dashboard → **Workers & Pages** (về danh sách tổng).
2. **Create application** → **Pages** → **Connect to Git** / **Import an existing Git repository**.
3. Cấp quyền GitHub cho repo `xulytiengviet/DN1N`.
4. Chọn `xulytiengviet/DN1N`, nhánh `main`.
5. **Project name:** `dn1n` nếu còn khả dụng. Chỉ sau khi Cloudflare tạo xong mới xác nhận được URL `https://dn1n.pages.dev/`.
6. **Framework preset:** None.
7. **Root directory:** `/` (repo root).
8. **Build command:** `node scripts/build-pages.mjs`.
9. **Build output directory:** `dist`.
10. **Environment variables / secrets:** không cần. Có thể dùng `NODE_VERSION=22` nếu môi trường build không cung cấp Node hiện đại.
11. Nhấn **Save and Deploy** và xem domain thực tế trong **Deployments**.

Nếu Cloudflare không cho dùng project name `dn1n`, kiểm tra có Pages project `dn1n` đã tồn tại hay không; chọn tên mới nếu tên đã được chiếm. Worker trong ảnh là loại tài nguyên khác và không phải Pages project.

## Kiểm thử tĩnh

```sh
node test.cjs
node --test ai/test.mjs ai/workspace.test.mjs
node scripts/build-pages.mjs
```

Build chỉ sao chép `index.html` và các module/CSS cần thiết trong `ai/` vào `dist/`; không xuất bản bộ test, README, mã build. Không đưa key/token vào GitHub, GitHub Actions, biến môi trường Pages hoặc URL.

## CORS của MCP

Origin mới từ trình duyệt Pages: `https://dn1n.pages.dev` (nếu Cloudflare tạo thành công). **Trên máy chủ MCP của bạn**, cập nhật allowlist Origin để thêm origin này; nếu vẫn dùng GitHub Pages thì giữ `https://xulytiengviet.github.io` nếu tin cậy. Không dùng ký tự đại diện (`*`) cho endpoint nhận token. Máy chủ phải tự thực hiện kiểm tra Origin, OPTIONS/CORS và xác thực.

Mã frontend hiển thị `location.origin` (origin thật đang sử dụng) thay vì bắt buộc hostname GitHub Pages.

## Lưu ý về dữ liệu cũ

Dự án tự lưu bằng **IndexedDB**, bị cô lập theo origin. Các dự án đã lưu dưới `https://xulytiengviet.github.io` không tự chuyển sang `https://dn1n.pages.dev`. Nếu còn truy cập được trang cũ, hãy **xuất dự án JSON** từ giao diện, rồi **nhập dự án** vào trang mới. Không có khóa OpenRouter/MCP nào được lưu tự động hoặc được chuyển qua.

## Giới hạn & an toàn

- Văn phòng 3D là mô phỏng. Làm việc với AI gọi OpenRouter thật khi người dùng tự nhập key và chủ động bấm chạy.
- Nếu máy chủ MCP không cho phép Pages origin bằng CORS thì kết nối sẽ lỗi dù site chính chạy bình thường.
- GitHub Pages và Cloudflare Pages chạy độc lập từ cùng repo. Không phải di chuyển hay xóa Worker.
- Không đổi hostname chỉ để né cảnh báo Safe Browsing; cần xác định và giải quyết vấn đề gốc.

Tài liệu: https://developers.cloudflare.com/pages/get-started/git-integration/
