# Nika Birthday Website

Website chuc mung sinh nhat tuong tac cho 2 route:
- Nika Lan Linh (`lan-linh`)
- Nika Linh Lan (`linh-lan`)

## Trang thai hien tai (quan trong)

Project hien dang chay bang:
- `index.html`
- `css/app.css`
- `js/main.js`

`js/main.js` dang chua noi dung du lieu hard-code (`const DATA = ...`).

Bo file theo huong module (`js/app.js`, `js/components/*`, `data/content.vi.json`, `css/base.css`, `css/tokens.css`, `css/components/*`) hien CHUA duoc `index.html` su dung o runtime.

## Cau truc thu muc thuc te

```
NikaBirthday/
├── index.html
├── README.md
├── css/
│   ├── app.css
│   ├── base.css
│   ├── tokens.css
│   └── components/
├── data/
│   └── content.vi.json
├── js/
│   ├── main.js
│   ├── app.js
│   ├── components/
│   └── effects/
└── assets/
    ├── audio/
    └── images/
```

## Chay local

Mo PowerShell trong thu muc project:

```powershell
python -m http.server 8080
```

Sau do mo:
- `http://localhost:8080`

Luu y:
- Co the double-click `index.html` de mo truc tiep, nhung nen test qua local server de giong deploy hon.

## Danh sach asset bat buoc (theo code hien tai)

Dat cac file nay truc tiep trong thu muc `assets/` (khong phai `assets/audio` hay `assets/images`):

- `assets/bgm.mp3`
- `assets/lan-linh.png`
- `assets/linh-lan.png`
- `assets/gift-ll-1.jpg` ... `assets/gift-ll-5.jpg`
- `assets/gift-ln-1.jpg` ... `assets/gift-ln-5.jpg`
- `assets/fanart-ll-1.jpg`, `assets/fanart-ll-2.jpg`
- `assets/fanart-ln-1.jpg`, `assets/fanart-ln-2.jpg`

Neu thieu file, website van chay nhung se mat anh/nhac o mot so section.

## Chinh noi dung

Ban chinh sua truc tiep trong `js/main.js`:
- `DATA['lan-linh']`
- `DATA['linh-lan']`

Noi dung co the sua:
- `typingMsg`
- `candleWishes`
- `gifts[]`
- `fanarts[]`
- `fanMessages[]`
- `letter`
- `finaleMsg`

## Ghi chu ky thuat

- Font dang dung:
  - `Great Vibes`
  - `Cormorant Garamond`
  - `Be Vietnam Pro`
- Script runtime duy nhat duoc nap: `js/main.js` (xem cuoi `index.html`).

## Huong nang cap de de bao tri hon

Neu muon ve kien truc sach hon:
- Chuyen runtime tu `js/main.js` sang `js/app.js`
- Dong bo du lieu ve `data/content.vi.json`
- Dong bo duong dan asset ve `assets/audio/*` va `assets/images/*`

Hien tai README nay uu tien mo ta DUNG trang thai dang chay.
