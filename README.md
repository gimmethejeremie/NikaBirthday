# Nika Birthday Website

Website chuc mung sinh nhat tuong tac cho 2 route:
- Nika Lan Linh (`lan-linh`)
- Nika Linh Lan (`linh-lan`)

## Trang thai hien tai (quan trong)

Project hien dang chay bang:
- `index.html`
- `css/app.css`
- `js/main.js`

Chot kien truc CSS hien tai: monolithic `css/app.css` la nguon su that duy nhat cho runtime.
Token/interactive state nen duoc cap nhat tai `:root` va block style trong `css/app.css` de tranh song song 2 he token.

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

Dat file dung thu muc nhu ben duoi (runtime dang tham chieu `assets/audio/*` va `assets/images/*`):

- `assets/images/lan-linh.png`
- `assets/images/linh-lan.png`
- `assets/images/gift-ll-1.jpg` ... `assets/images/gift-ll-5.jpg`
- `assets/images/gift-ln-1.jpg` ... `assets/images/gift-ln-5.jpg`
- `assets/images/fanart-ll-1.jpg`, `assets/images/fanart-ll-2.jpg`
- `assets/images/fanart-ln-1.jpg`, `assets/images/fanart-ln-2.jpg`
- `assets/audio/Linh.mp3`, `assets/audio/Lan.mp3`
- `assets/audio/Arthur Vyncke - All Aboard the Space Train.mp3`
- `assets/audio/Arthur Vyncke - And the Land Came Back to Life.mp3`
- `assets/audio/Ben Elliott - Climbing the Andes.mp3`
- `assets/audio/Dalton Attig - Mochi in the Morning.mp3`

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
- Giu mot convention dat ten file asset nhat quan de de cap nhat trong `DATA`.

Hien tai README nay uu tien mo ta DUNG trang thai dang chay.
