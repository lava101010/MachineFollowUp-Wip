# إنيرجيا للكابلات - التوأم الرقمي للمصنع ولوحة التحليلات ثلاثية الأبعاد
## Energya Cables - 3D Factory Digital Twin & Analytics Dashboard

تطبيق ويب صناعي تفاعلي متكامل ومعياري (Modular Architecture) مخصص لمصنع **إنيرجيا للكابلات (Energya Cables)**، مبني بأحدث تقنيات الويب الحديثة (Vite + ES Modules + Three.js + Tailwind CSS + Chart.js) وجاهز للنشر المباشر على **GitHub Pages**.

---

### 📁 هيكلية المشروع المعيارية (Project Architecture)

```
energya-cables-3d/
├── .github/
│   └── workflows/
│       └── deploy.yml          # النشر التلقائي عبر GitHub Actions على GitHub Pages
├── src/
│   ├── constants/              # القواميس وثوابت المصنع الرسمية
│   │   ├── stages.js           # قواميس الـ 22 مرحلة إنتاجية (STAGE_MAP)
│   │   ├── machines.js         # قواميس الـ 83 ماكينة (MACHINE_MAP)
│   │   └── supervisors.js      # قواميس الـ 213 مشرف ومشغل (SUPERVISOR_MAP)
│   ├── state/
│   │   └── store.js            # مخزن الحالة التفاعلي المركزي (Central Store)
│   ├── utils/
│   │   ├── normalizer.js       # خوارزميات تطبيع البكرات والكروت وتنسيق المقاسات
│   │   └── exportCSV.js        # مصدّر ملفات Excel / CSV مع كود الترميز العربي (UTF-8 BOM)
│   ├── engine/
│   │   ├── wipEngine.js        # محرك تتبع أرصدة الـ WIP وخصم الأطوال المتسلسلة
│   │   ├── aggregator.js       # محرك تجميع الإحصائيات وبطاقات الـ KPIs
│   │   └── csvParser.js        # قارئ ملفات CSV ودمج النسخ الاحتياطية المتعددة
│   ├── three/
│   │   ├── scene.js            # إعداد المشهد ثلاثي الأبعاد والكاميرا والإضاءة
│   │   ├── environment.js      # أرضية المصنع، الممرات الصفراء، الصالات واللوحات
│   │   ├── machineModels.js    # المجسمات الإجرائية لجميع الماكينات (CCV، بثق، تجديل...)
│   │   ├── layout.js           # توزيع الـ 83 ماكينة جغرافياً على الصالات الخمس
│   │   ├── colorModes.js       # الخرائط الحرارية وأنماط التلوين للماكينات
│   │   ├── interaction.js      # النقر، التقريب بالكاميرا، والتحديد التفاعلي (Raycasting)
│   │   └── animator.js         # حلقة الريندر الذكية (تتوقف تلقائياً عند إخفاء الـ 3D لتوفير الطاقة)
│   ├── charts/
│   │   └── chartManager.js     # إدارة الرسوم البيانية التفاعلية (Chart.js)
│   ├── ui/
│   │   ├── tabSwitcher.js      # التبديل بين التبويبات ووضع الشاشة الكاملة
│   │   ├── filterBar.js        # شريط الفلاتر والبحث الحي المتقدم
│   │   ├── productionTable.js  # جدول سجل الإنتاج والتصدير والتقسيم لصفحات
│   │   ├── wipTable.js         # جدول أرصدة الـ WIP النقي مع عمود المقاس الموحد
│   │   ├── inspector.js        # النافذة الجانبية لفحص تفاصيل الماكينة
│   │   └── toast.js            # إشعارات النظام العائمة
│   ├── data/
│   │   └── sampleData.js       # بيانات الإنتاج التجريبية المطابقة لواقع المصنع
│   └── main.js                 # نقطة الدخول الرئيسية للبرنامج وربط النوافذ
├── index.html                  # ملف الواجهة الرئيسي النظيف
├── index.monolith.backup.html  # نسخة احتياطية كاملة للملف الفردي السابق (أمان 100%)
├── vite.config.js              # إعدادات Vite مع دعم المسارات النسبية لـ GitHub Pages
├── package.json                # تعريف المشروع وحزم التطوير والتشغيل
├── sample_production_energya.csv # ملف CSV حقيقي تجريبي
└── .gitignore                  # الملفات المستبعدة من مستودع Git
```

---

### 🌟 أبرز ما تم تنفيذه في النسخة المعيارية الحديثة:

1. **التقسيم المعياري الكامل (Full ES Modules Separation):**
   - فك الكود الأحادي الضخم بالكامل إلى 25 ملفاً متخصصاً، مما يسهل التطوير المستقبلي والتعديل وإضافة ميزات جديدة دون أي تداخل.
2. **إدارة الطاقة واستهلاك كارت الشاشة (Smart 3D Loop Pause):**
   - يتوقف محرك الـ 3D والريندر (`requestAnimationFrame`) تلقائياً عند الانتقال لتبويب سجل الإنتاج أو أرصدة الـ WIP، ويستأنف فور العودة للـ 3D لحفظ موارد الأجهزة.
3. **عمود المقاس الموحد في جدول الـ WIP:**
   - إدراج عمود المقاس (`WireSize`) بعد تنقيته من أي زوائد وتوحيد علامة الضرب إلى `x` صغيرة، داخل جدول شاشة الـ WIP وملفات التصدير.
4. **تتبع دقيق لأرصدة الـ WIP عبر الورديات:**
   - دمج تسجيلات الورديات المتعددة لنفس البكرة، وعزل التسلسل التصاعدي بين المراحل (`c.StageID > grp.stageId`) بدقة تامة.
5. **جاهزية النشر الآلي لـ GitHub Pages:**
   - ملف `deploy.yml` مبرمج ومضبوط بالكامل لبناء ونشر المشروع تلقائياً على استضافة `username.github.io/repo-name/`.

---

### 🚀 خطوات التشغيل محلياً (Local Development):

#### الخيار 1: باستخدام Node.js و Vite (موصى به للمطورين):
```bash
# 1. تثبيت الاعتماديات
npm install

# 2. تشغيل السيرفر المحلي للتطوير السريع
npm run dev

# 3. بناء النسخة الإنتاجية
npm run build
```

#### الخيار 2: عبر خادم محلي خفيف (بدون Build):
يمكن تشغيله مباشرة عبر إضافة **Live Server** في VS Code أو بواسطة:
```bash
npx serve .
```

---

### 🌐 خطوات الرفع إلى GitHub واستضافة GitHub Pages:

1. **إنشاء مستودع جديد على حسابك في GitHub:**
   - ادخل إلى GitHub وأنشئ مستودعاً جديداً (مثلاً: `energya-cables-3d`).

2. **تهيئة ورفع الكود من مجلد المشروع:**
   ```bash
   git init
   git add .
   git commit -m "feat: modularize Energya Cables 3D Digital Twin with GitHub Pages deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME/energya-cables-3d.git
   git push -u origin main
   ```

3. **تفعيل GitHub Pages في إعدادات المستودع (Settings):**
   - اذهب إلى مستودعك على GitHub -> **Settings** -> **Pages**.
   - تحت قسم **Build and deployment**:
     - اختر **Source: GitHub Actions**.
   - بمجرد الدفع (Push)، سيعمل الـ Workflow المجهز في `.github/workflows/deploy.yml` تلقائياً، وخلال دقيقة واحدة سيكون موقعك متاحاً ويعمل على:
     `https://USERNAME.github.io/energya-cables-3d/`
