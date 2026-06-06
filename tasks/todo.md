# TODO — Veri & Uyum hattı (Faz 1) + Tasarım

Karar: "Veri & Uyum" hattında ilerliyoruz. Belge/depolama (ücretli) şimdilik
kapsam dışı. Bu turda: **Faz 1 özlük verisi** + **tasarımsal iyileştirmeler**.

## Faz 1 — Çalışan özlük verisi

### 1.1 Schema (prisma/schema.prisma)
- [ ] Yeni enum'lar: Gender, MaritalStatus, BloodType, EducationLevel,
      MilitaryStatus, EmploymentType, ContractType
- [ ] Employee modeline alanlar (hepsi nullable — mevcut satırlar bozulmaz):
  - Kimlik: nationalId (TC), birthDate, birthPlace, gender, maritalStatus,
    nationality (default "TC"), bloodType
  - İletişim: phone, personalEmail, addressCity, addressDistrict, addressLine
  - Acil durum: emergencyName, emergencyPhone, emergencyRelation
  - Banka: iban
  - Eğitim/askerlik: educationLevel, militaryStatus
  - İstihdam: employmentType, contractType, contractStart, contractEnd,
    sgkRegistrationNo, terminationDate, terminationReason
  - nationalId için @@unique([nationalId, companyId])
- [ ] `npx prisma generate`
- [ ] Migration (kullanıcı onayıyla `prisma migrate dev` veya `db push`)

### 1.2 Doğrulama (lib/validations + test)
- [ ] lib/validations/employee.ts: özlük alanları için Zod şeması
- [ ] TC Kimlik No algoritma doğrulaması (11 hane + checksum)
- [ ] TR IBAN doğrulaması (mod-97 checksum)
- [ ] tests/: TC + IBAN validatör birim testleri

### 1.3 UI — form
- [ ] employees/new ve employees/[id]/edit formlarına gruplu bölümler
      (Tabs veya Accordion): Kimlik / İletişim / Acil durum / Banka /
      Eğitim-Askerlik / İstihdam-Sözleşme
- [ ] API route'ları (employees POST/PATCH) yeni alanları kabul etsin + validate

### 1.4 UI — gösterim
- [ ] employees/[id] detay sayfasında özlük bilgileri kartları
- [ ] profile sayfasında çalışanın kendi özlük verisi (bazıları salt-okunur)

## Tasarım iyileştirmeleri

### 2.1 Analitik dashboard (recharts — zaten kurulu)
- [ ] Dashboard'a grafik kartları: headcount (departman dağılımı),
      izin/devamsızlık trendi, bordro maliyeti, işe giriş/çıkış trendi
- [ ] API: dashboard istatistik endpoint(ler)i (companyId filtreli)

### 2.2 Organizasyon şeması
- [ ] Departman → yönetici → çalışan görsel hiyerarşi sayfası

### 2.3 UI cilası
- [ ] Tutarlı boş durum (empty state) ve skeleton bileşenleri
- [ ] Detay/profil sayfalarının görsel düzeni

## Doğrulama standardı (her adım)
`npx tsc --noEmit` temiz · `npm run build` exit 0 · `npm test` geçer ·
multi-tenant companyId izolasyonu korunur.

## Backlog'a ertelenen (Veri & Uyum hattı, sonra)
- Belge yönetimi (ücretli depolama gerektirir — beklemede)
- Kıdem & ihbar tazminatı motoru
- KVKK & denetim logu
- İSG & eğitim takibi

## Review — tamamlandı (branch: feature/employee-personal-info)

**Faz 1 — Çalışan özlük verisi ✅**
- Schema: Employee'ye 25 nullable özlük alanı + 7 enum; migration kaydı
  (db push ile uygulandı, mevcut veri korundu, geçmişe işlendi).
- Doğrulama: `lib/validators.ts` saf TC Kimlik checksum + TR IBAN mod-97;
  `getPersonalInfoSchema` + `buildPersonalInfoData` (boş→null, tarih dönüşümü);
  `pickOzlukData` (gösterim için). 10 birim test.
- Form: paylaşılan `OzlukFields` (Accordion bölümleri, native-select + register,
  inline-component yok); yeni + düzenleme formuna eklendi; API POST/PATCH
  entegrasyonu, PATCH'te TC/IBAN/email doğrulaması.
- Gösterim: `OzlukDisplay` paylaşılan bileşeni; yeni çalışan detay sayfası
  `/dashboard/employees/[id]` (HR korumalı); profil sayfasında self-servis.

**Faz 2 — Tasarım ✅**
- Analitik dashboard: `getCompanyStats` (paralel sorgular) + `HrAnalytics`
  (recharts: departman bar, işe giriş alan grafiği, izin durumu & çalışma şekli
  donut'ları, 4 stat kartı) — yalnızca yöneticilere.
- Organizasyon şeması: `/dashboard/org-chart` (departman→yönetici→üye).

**Doğrulama:** `tsc --noEmit` temiz · `npm run build` exit 0 · `npm test` 39/39 ·
`npm run lint` 0 error (5 kasıtlı exhaustive-deps uyarısı) · multi-tenant korundu.
