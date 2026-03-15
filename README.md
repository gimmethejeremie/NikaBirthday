# 🎂 Web Card Sinh Nhật — Nika Linh Lan × Nika Lan Linh

Web card tĩnh (static) dành cho cặp VTuber song sinh **Nika Linh Lan** và **Nika Lan Linh** (NIJIGEN Project Gen 2.5), sinh nhật 21/3.

---

## Cấu trúc thư mục

```
NikaBirthday/
├── index.html                  # Khung HTML + mount points
├── data/
│   └── content.vi.json         # ← NON-DEV chỉnh ở đây
├── css/
│   ├── tokens.css              # CSS variables (colors, spacing)
│   ├── base.css                # Reset, typography, layout
│   └── components/
│       ├── envelope.css
│       ├── letter.css
│       ├── gallery.css
│       ├── minigame.css
│       ├── finale.css
│       └── ui.css
├── js/
│   ├── app.js                  # State machine (entry point)
│   ├── components/
│   │   ├── envelope.js
│   │   ├── typewriter.js
│   │   ├── gallery.js
│   │   ├── letter.js
│   │   ├── minigame.js
│   │   ├── audio.js
│   │   └── revealOnScroll.js
│   └── effects/
│       ├── particles.js
│       └── confetti.js
├── assets/
│   ├── images/                 # ← Thêm ảnh WebP vào đây
│   └── audio/                  # ← Thêm nhạc MP3 vào đây
└── flow/                       # SVG flow diagram (tùy chọn)
```

---

## Hướng dẫn cho non-dev: chỉnh nội dung

**Chỉ cần sửa file `data/content.vi.json`.**

Tìm các chỗ có `"__TODO__"` và thay bằng nội dung thật:

| Trường | Ý nghĩa | Ví dụ |
|--------|---------|-------|
| `routes.lan.typingLines` | Lời chúc typewriter cho Linh Lan | `["Chúc mừng sinh nhật!"]` |
| `routes.lan.letter.body` | Nội dung thư tay | `["Linh Lan ơi, ...."]` |
| `routes.lan.gallery[].src` | Đường dẫn ảnh fanart | `"assets/images/lan-art1.webp"` |
| `assets.audio.bgm` | File nhạc nền | `"assets/audio/bgm.mp3"` |

---

## Thêm ảnh

1. Chuyển ảnh sang định dạng **WebP** (giảm dung lượng, tải nhanh hơn)
   - Dùng [Squoosh](https://squoosh.app/) (free, online)
2. Đặt vào thư mục `assets/images/`
3. Cập nhật đường dẫn trong `data/content.vi.json`

> **Luôn ghi rõ `width` và `height` trong JSON** (sắp tới dev sẽ dùng để tránh layout shift)

---

## Thêm nhạc

1. Đặt file `.mp3` vào `assets/audio/`
2. Cập nhật `assets.audio.bgm` trong `content.vi.json`
3. Nhạc chỉ phát sau khi user click (theo quy định trình duyệt — autoplay policy)

---

## Đổi màu theme

Mở `css/tokens.css` và tìm comment:
```
/* REPLACE WITH OFFICIAL BRAND COLORS */
```
Đổi các giá trị hex trong `[data-route="lan"]` và `[data-route="linh"]`.

---

## Deploy

### Cách 1: GitHub Pages (miễn phí)

1. Tạo repo mới trên GitHub (public)
2. Upload toàn bộ file lên repo
3. Vào **Settings → Pages**
4. Source: **Deploy from a branch** → chọn `main` / `root`
5. Save → GitHub tự build và cho URL dạng `https://username.github.io/repo-name`

> Có thể dùng GitHub Actions để tự động deploy khi push:
> tạo file `.github/workflows/deploy.yml` với nội dung:
> ```yaml
> name: Deploy to GitHub Pages
> on:
>   push:
>     branches: [main]
> jobs:
>   deploy:
>     runs-on: ubuntu-latest
>     permissions:
>       pages: write
>       id-token: write
>     steps:
>       - uses: actions/checkout@v4
>       - uses: actions/upload-pages-artifact@v3
>         with:
>           path: '.'
>       - uses: actions/deploy-pages@v4
> ```

### Cách 2: Netlify (nhanh nhất cho non-dev)

1. Vào [netlify.com](https://netlify.com) → Đăng nhập
2. Kéo thả **toàn bộ thư mục `NikaBirthday`** vào trang **Sites**
3. Netlify sẽ tự deploy và cho URL ngay lập tức
4. Đổi tên site (tùy chọn) trong Site settings

> Cũng có thể kết nối GitHub repo để auto-deploy mỗi khi push code.

### Cách 3: Mở local để test

Vì site dùng ES modules (`type="module"`), cần chạy qua HTTP server:

```powershell
# Dùng Python (thường có sẵn)
python -m http.server 8080

# Hoặc dùng Node.js npx
npx serve .
```

Sau đó mở `http://localhost:8080` trong trình duyệt.

> **Không thể mở trực tiếp file `index.html`** bằng cách double-click — ES modules sẽ bị lỗi CORS.

---

## Checklist trước khi publish

- [ ] Thay tất cả `__TODO__` trong `content.vi.json`
- [ ] Thêm ảnh hero cho Lan và Linh (`assets/images/`)
- [ ] Thêm file nhạc nền (`assets/audio/bgm.mp3`)
- [ ] Thêm ảnh cover cho Open Graph (`assets/images/cover.webp`)
- [ ] Test trên mobile (Chrome DevTools → Toggle device toolbar)
- [ ] Test keyboard navigation (Tab qua các nút)
- [ ] Test với "Reduce Motion" bật (System Preferences → Accessibility)
- [ ] Xóa console.debug logs nếu muốn (trong `js/app.js`)

---

## Ghi chú copyright & license

- **Nhạc**: Chỉ dùng nhạc có license cho phép (Creative Commons, royalty-free).
  Nguồn: [Incompetech](https://incompetech.com/), [Free Music Archive](https://freemusicarchive.org/)
- **Ảnh fanart**: Chỉ dùng ảnh được tác giả cho phép. Credit rõ trong JSON.
- **Ảnh nhân vật chính thức**: Cần xin phép từ NIJIGEN Project trước khi sử dụng.
- **Fonts**: Dancing Script + Nunito từ Google Fonts — OFL license, miễn phí kể cả commercial.

---

## Hỗ trợ

- Repo gốc tham khảo: [gimmethejeremie/WomensDay](https://github.com/gimmethejeremie/WomensDay)
- Hashtag fanart: `#LanArt` (Linh Lan) | `#LinArt` (Lan Linh)
