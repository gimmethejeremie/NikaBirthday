# Nika Birthday Website

Website chúc mừng sinh nhật tương tác cho 2 tuyến:
- Nika Lan Linh (`lan-linh`)
- Nika Linh Lan (`linh-lan`)

## Runtime hiện tại

Project đang chạy theo một luồng duy nhất:
- `index.html`
- `css/app.css`
- `js/main.js`

Điều này giúp codebase gọn hơn, dễ bảo trì và dễ chỉnh sửa nhanh.

## Cấu trúc thư mục

```text
NikaBirthday/
├── index.html
├── README.md
├── assets/
│   ├── audio/
│   └── images/
├── css/
│   └── app.css
└── js/
    └── main.js
```

## Chạy local

Mở PowerShell trong thư mục project:

```powershell
python -m http.server 8080
```

Sau đó mở trình duyệt tại `http://localhost:8080`.

Nếu không có Python:

```powershell
npx http-server
```

## Danh sách asset bắt buộc

### Hình ảnh
- `assets/images/lan-linh.png`
- `assets/images/linh-lan.png`
- `assets/images/gift-ll-1.jpg` đến `gift-ll-5.jpg`
- `assets/images/gift-ln-1.jpg` đến `gift-ln-5.jpg`
- `assets/images/fanart-ll-1.jpg`, `fanart-ll-2.jpg`
- `assets/images/fanart-ln-1.jpg`, `fanart-ln-2.jpg`

### Âm thanh
- `assets/audio/Linh.mp3`, `assets/audio/Lan.mp3`
- `assets/audio/Arthur Vyncke - All Aboard the Space Train.mp3`
- `assets/audio/Arthur Vyncke - And the Land Came Back to Life.mp3`
- `assets/audio/Ben Elliott - Climbing the Andes.mp3`
- `assets/audio/Dalton Attig - Mochi in the Morning.mp3`

Nếu thiếu asset, web vẫn chạy nhưng một số phần sẽ mất ảnh hoặc âm thanh.

## Chỉnh nội dung

Chỉnh trực tiếp trong `js/main.js`, bên trong `const DATA`:
- `DATA['lan-linh']`
- `DATA['linh-lan']`

Các trường thường chỉnh:
- `typingMsg`
- `candleWishes`
- `gifts[]`
- `fanMessages[]`
- `letter`
- `finaleMsg`

## Convention đang dùng

- Dữ liệu route đặt trong `DATA`, không tách file rời.
- CSS chỉ chỉnh trong `css/app.css` để tránh phân tán style.
- Các hằng số điều khiển luồng/animation đặt ở cụm constant đầu file `js/main.js`.
- Ưu tiên một luồng runtime rõ ràng, tránh giữ song song nhiều kiến trúc chưa dùng.

