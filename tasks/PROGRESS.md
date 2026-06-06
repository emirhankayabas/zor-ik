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

## ŞU AN SIRADA (task #9 — lint uyarıları)
- ~67 no-unused-vars uyarısı (çoğu kullanılmayan import) → temizle
- 2 set-state-in-effect hatası: employee-filters.tsx:54, language-selector.tsx:26
  (meşru hydration/URL-sync pattern'leri; ya yeniden yapılandır ya da gerekçeli bırak)
- Hedef: `npm run lint` exit 0

## Sıradaki kuyruk (tasks/backlog.md)
- Test altyapısı (Vitest — engine'ler için)
- Dashboard grafikleri/analitik
- Asgari ücret istisna yöntemi muhasebeci teyidi (backlog 4c)
- Onay bildirimlerinde hardcoded TR stringleri i18n'e taşı

## Doğrulama komutu: `npx tsc --noEmit` temiz, `npm run build` exit 0.
