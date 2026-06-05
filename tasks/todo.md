# Refactor: Dosya Yapısı & Componentleştirme

Plan: `~/.claude/plans/cached-brewing-glacier.md`

## FAZ 1 — Yapısal temizlik (davranış değişmez) ✅

### 1a. Ölü root dosyaları ✅
- [x] `auth.ts` sil
- [x] `auth.config.ts` sil
- [x] `proxy.ts` sil
- [x] `git` (boş dosya) sil

### 1b. Auth'u doğru yere taşı ✅
- [x] `lib/auth-options.ts` oluştur (authOptions taşı)
- [x] `app/api/auth/[...nextauth]/route.ts` incelt
- [x] `lib/auth.ts` importu güncelle

### 1c. components/ grupla ✅
- [x] `components/layout/` ← app-sidebar, dynamic-breadcrumb, notification-bell, mode-toggle, language-selector
- [x] `components/shared/` ← error-message
- [x] Tüm import yollarını güncelle

### 1d. Route _components standardize ✅
- [x] login/register/home Content → _components/*-form|content
- [x] departments DepartmentList → _components/department-list
- [x] members MemberManager → _components/member-manager
- [x] page.tsx importları güncelle

### Faz 1 doğrulama ✅
- [x] `npm run build` temiz geçti (lint hataları önceden var olan stil sorunları)

## FAZ 2 — Şişkin sayfaları böl
- [x] payroll (680 → 78) — use-payroll, toolbar, stats, table, salary-table, salary-edit-dialog
- [x] hr/attendance-requests (479 → ~95) — hook, types, approval-timeline, request-card
- [x] hr/approvals (459 → ~105) — hook, types, timeline, request-card, empty-state
- [x] hr/leave-requests (424 → ~90) — hook, types, timeline, request-card
- [x] employees/[id]/edit (457 → ~115) — use-employee-edit, profile-fields, shift-work-fields
- [x] employees/new (432 → ~90) — use-new-employee, personal-info-fields, task-auth-fields, success-card
- [x] employee-actions-menu / employee-filters → employees/_components
- [x] Her sayfadan sonra `tsc --noEmit`, sonda tam `npm run build` (exit 0)

## Review

**Sonuç:** Tüm refactor tamam, `npm run build` temiz (exit 0), 0 kalıntı referans.

### Faz 1 — Yapısal
- Root'taki 4 ölü dosya silindi (`auth.ts`, `auth.config.ts` = kullanılmayan v5 scaffolding;
  `proxy.ts` = Next'in yüklemediği yanlış-adlı middleware; `git` = boş dosya).
- `authOptions` route dosyasından `lib/auth-options.ts`'e taşındı (anti-pattern giderildi);
  route incelendi, `lib/auth.ts` güncellendi.
- `components/` gruplandı: `layout/` (sidebar, breadcrumb, bell, mode-toggle, lang),
  `shared/` (error-message). `ui/` shadcn için yerinde kaldı.
- `Component/` → `_components/`, dosyalar kebab-case + anlamlı isim (login-form, register-form vb.).

### Faz 2 — Componentleştirme (6 sayfa, ~2930 satır → ~580 satır page + temiz bileşenler)
- Her sayfa: veri/state mantığı route-local `use-*.ts` hook'una, sunum parçaları ayrı
  bileşenlere bölündü. page.tsx ince orkestratör.
- Mevcut yardımcılar yeniden kullanıldı (`payroll-engine`, `status-helpers`, `@/lib/api`).
- Yan temizlik: kullanılmayan `useRouter`, `createEmployeeSchema`, ölü ikon importları kaldırıldı;
  onay timeline'larında prop-mutasyonu yapan `.sort()` → `.slice().sort()`.

### Davranış garantisi
- Multi-tenant `companyId` filtreleri, API mantığı, Türkçe metinler, hesaplama motorları,
  DB şeması: **hiç dokunulmadı**. Yalnızca dosya organizasyonu + bileşen ayrımı.

## FAZ 3 — Güvenlik & kalite (full yetkiyle, commit'lendi)
- [x] **Güvenlik:** `app/api/debug/seed` (auth'suz, tüm tenant'lara yazan public GET) silindi.
- [x] **Düzeltme:** `proxy.ts` geri alındı — Next 16'da middleware convention'ı "proxy";
      yanlışlıkla silinmişti, route koruması zaten aktifti (`ƒ Proxy (Middleware)`).
- [x] **confirm() → AlertDialog:** `ConfirmProvider` + `useConfirm()` (5 çağrı yeri).
- [x] **Lint:** `prefer-const` auto-fix'leri (payroll-engine, dashboard page).

### Commit'ler (branch: refactor/cleanup-and-componentization)
1. `refactor: dosya yapısını temizle ve şişkin sayfaları component'lere böl`
2. `fix(security): debug/seed kaldır, proxy korumasını geri al`
3. `refactor: native confirm() yerine AlertDialog onay akışı`
4. `chore: lint prefer-const otomatik düzeltmeleri`

### Kalan işler → `tasks/backlog.md`
`any` tip sıkılaştırma, kalan ~24 sayfa, test altyapısı, onay timeline birleştirme.
