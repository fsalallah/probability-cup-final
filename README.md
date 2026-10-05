# تحدي الاحتمالات – نهائي الكأس

تطبيق عربي RTL لعدد 31 طالبًا، سؤالان مختلفان لكل طالب، مع تصحيح مركزي ولوحة مدرس محمية.

## البنية الأمنية
- GitHub Pages يستضيف الواجهة فقط.
- Supabase Edge Functions تجلب الأسئلة وتصحح الإجابات.
- مفتاح الإجابة موجود في جدول `questions` ولا توجد له سياسات RLS تسمح للعميل بقراءته مباشرة.
- لوحة المدرس تستخدم Supabase Auth، وتتحقق Edge Functions من بريد المدرس عبر السر `ADMIN_EMAIL`.
- لا تضع `service_role` في GitHub أو المتصفح مطلقًا.

## 1) إنشاء Supabase
1. أنشئ مشروعًا جديدًا في Supabase.
2. افتح SQL Editor وشغّل الملف:
   `supabase/setup.sql`
3. من Authentication > Users أنشئ مستخدم المدرس بالبريد وكلمة المرور التي تريدها.
4. ثبّت Supabase CLI على جهازك ثم سجّل الدخول واربط المشروع.

مثال:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

## 2) نشر Edge Functions
نفّذ:
```bash
supabase functions deploy get-questions
supabase functions deploy submit-answers
supabase functions deploy admin-results
supabase functions deploy admin-delete
supabase functions deploy admin-reset
supabase functions deploy admin-export
```

ثم أضف الأسرار:
```bash
supabase secrets set ADMIN_EMAIL="teacher@example.com"
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, و`SUPABASE_SERVICE_ROLE_KEY` تتوفر عادةً تلقائيًا لبيئة Edge Functions على Supabase.

## 3) اختبار محلي
انسخ `config.example.js` إلى `config.js` وضع:
- Project URL
- anon public key

ثم شغّل خادم ملفات بسيط:
```bash
python -m http.server 8080
```
وافتح:
`http://localhost:8080`

## 4) رفع إلى GitHub
أنشئ مستودعًا جديدًا ثم:
```bash
git init
git add .
git commit -m "Initial probability cup final app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/probability-cup-final.git
git push -u origin main
```

## 5) GitHub Secrets
في المستودع:
Settings > Secrets and variables > Actions > New repository secret

أضف:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 6) تفعيل GitHub Pages
Settings > Pages > Source = GitHub Actions.

بعد نجاح Workflow سيكون رابط الطلاب شبيهًا:
`https://YOUR_USERNAME.github.io/probability-cup-final/`

ولوحة المدرس:
`https://YOUR_USERNAME.github.io/probability-cup-final/admin/`

## ملاحظات
- كل طالب من 1 إلى 31 يستطيع التسليم مرة واحدة فقط.
- الإجابات تقبل الصورة العشرية أو النسبة المئوية، مثل `0.45` أو `45%`.
- لوحة المدرس تعرض الصحيح والخاطئ والنسبة وأرقام من لم يسلّموا.
- يمكن حذف محاولة طالب أو مسح جميع النتائج.
- CSV يصدر مع UTF-8 BOM ليتعامل Excel مع العربية بشكل صحيح.
