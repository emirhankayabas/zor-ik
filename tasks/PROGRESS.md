# Kaldığım Yer (devam notu)

Branch: `refactor/cleanup-and-componentization` (main'e PR bekliyor)

## Bitti (commit + push'landı)
1. Yapı temizliği + sayfaları component'lere bölme (Faz 1-2)
2. Güvenlik: debug/seed silindi, proxy düzeltildi
3. confirm() → AlertDialog (useConfirm)
4. Onay akışı sadeleştirme: lib/access.ts + tek ApprovalTimeline
5. **Bug fix**: izin kıdem kotası (5 yıl dahil→14), onay sırası server'da zorlanıyor,
   multi-tenant sızıntı (leave + attendance [id] route'ları), SGK tavanı (payroll)
6. API yetki kontrolleri lib/access.ts ile merkezileştirildi
7. Bordro (payslip) sayfası: /dashboard/payroll/[id]
8. Tüm sayfalara metadata/title
9. **Self-servis profil sayfası** (/dashboard/profile) + sidebar linki — BİTTİ, build OK
10. **API hata yönetimi standardizasyonu** (lib/api-response.ts):
    - 27 route'un tamamı handleApiError() kullanıyor
    - getCompanyId Unauthorized→401, ZodError→400, error.message sızıntısı kapatıldı,
      Prisma P2002→409 / P2025→404
11. **Type hardening — explicit any 65 → 0**:
    - lib/types.ts (DepartmentOption/ShiftOption), use-payroll tipleri
    - NextAuth augmentation kullanıldı, Prisma.*WhereInput/UncheckedUpdateInput,
      Session tipleri, ApprovalStatus enum
    - eslint.config.mjs: .agent/** ignore (vendor skill template'leri lint dışı)
    - Gizli bug fix: departments/[id] yönetici rozeti (user.id seçilmiyordu)

## Lint temizliği (task #9) — BİTTİ
- `npm run lint` exit 0 (önce 65 any-error + 15 diğer error + 72 uyarı)
- Tüm error'lar giderildi: no-unescaped-entities, no-empty-object-type,
  set-state-in-effect (gerekçeli disable)
- Uyarılar 72 → 5: kullanılmayan import/değişken/catch binding temizlendi,
  ölü locale prop threading (login/register) kaldırıldı
- Kalan 5 uyarı: react-hooks/exhaustive-deps (effect'lere `t` eklemek gereksiz
  refetch riski; bilinçli bırakıldı)

## Test altyapısı (backlog #5) — BİTTİ
- Vitest kuruldu: `npm test`, vitest.config.ts, tests/ (29 test, hepsi geçiyor)
- lib/attendance-calc.ts: PDKS saf mantık ayrıldı (DB'siz test edilebilir)
- payroll/leave/attendance-calc motorları test kapsamında

## confirm dialog i18n (backlog #6) — BİTTİ

## Kalan (yön/karar gerektiren — bu turda kapsam dışı)
- Sayfa componentleştirme FAZ 2 devamı (~9 büyük sayfa) — backlog #3
- Dashboard analitik/grafikler (recharts kurulu) — yeni özellik
- Asgari ücret istisna yöntemi — mali müşavir teyidi gerek (backlog #4c)
- Onay bildirimi i18n — DİKKAT: bildirim üretildiği an işlemi yapanın diline
  göre çevrilir ama alıcı farklı dilde olabilir. Doğru çözüm: mesaj key+param
  saklayıp render anında çevirmek (ayrı mimari iş, yarım yapılmamalı).

## Doğrulama: `npx tsc --noEmit` temiz, `npm run build` exit 0, `npm test` 29/29,
## `npm run lint` 0 error (5 kasıtlı exhaustive-deps uyarısı).
