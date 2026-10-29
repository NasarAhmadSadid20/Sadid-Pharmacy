# داروخانه سدید

سیستم کامل مدیریت داروخانه به صورت آنلاین. فرانت‌اند (React) و بک‌اند (Node.js) روی یک سرور و دیتابیس PostgreSQL روی ابر اجرا می‌شود. نیازی به نصب روی کامپیوتر ندارید.

## راه‌اندازی آنلاین (رایگان)

### مرحله ۱: ساخت دیتابیس آنلاین با Neon
1. وارد https://neon.tech شوید و با ایمیل یا گیت‌هاب ثبت‌نام کنید.
2. یک Project بسازید (مثلاً `sadid`).
3. در بخش Connection Details، رشته `Connection string` را کپی کنید. به شکل زیر است:
   `postgres://user:password@ep-xxx.neon.tech/neondb?sslmode=require`

### مرحله ۲: آپلود کد در GitHub
1. وارد https://github.com شوید و یک Repository جدید با نام `sadid` بسازید.
2. فایل‌های این پروژه را آپلود کنید (از بخش Upload files، یا با Git).

### مرحله ۳: اجرای برنامه با Render
1. وارد https://render.com شوید و با GitHub ثبت‌نام کنید.
2. New → Blueprint را بزنید و Repository `sadid` را انتخاب کنید. فایل `render.yaml` به‌صورت خودکار خوانده می‌شود.
3. متغیرهای محیطی را وارد کنید:
   - `DATABASE_URL`: رشته اتصال Neon از مرحله ۱
   - `ADMIN_PASSWORD`: رمز ورود مدیر (مثلاً یک رمز قوی)
4. دکمه Apply را بزنید. پس از چند دقیقه آدرسی مثل `https://sadid-pharmacy.onrender.com` دریافت می‌کنید.
5. با نام کاربری `admin` و رمزی که انتخاب کردید وارد شوید.

جداول دیتابیس و داده‌های نمونه، هنگام اولین اجرا خودکار ساخته می‌شوند.

## نکات
- نسخه رایگان Render پس از مدتی بی‌فعالیتی خوابیده می‌شود و اولین بارگذاری چند ثانیه طول می‌کشد.
- برای استفاده واقعی، دامنه اختصاصی و پلن پولی توصیه می‌شود.
- پس از ورود، رمز ادمین را از طریق دیتابیس یا نسخه بعدی برنامه تغییر دهید.

## ساختار
```
sadid/
├── Dockerfile           # ساخت یک image برای کل برنامه
├── render.yaml          # تنظیمات دیپلوی خودکار در Render
├── database/schema.sql  # ساختار جداول PostgreSQL
├── backend/             # API با Node.js و Express
└── frontend/            # React + Tailwind (Vite)
```

## اجرای محلی (اختیاری، برای توسعه)
```bash
cd backend && cp .env.example .env && npm install && npm run dev
cd frontend && npm install && npm run dev
```
"# Sadid-Pharmacy" 
