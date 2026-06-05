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

## ŞU AN YARIM (task #7 — self-servis profil)
- `app/(dashboard)/dashboard/profile/page.tsx` YAZILDI (server component, hazır).
- `messages/tr.json` + `en.json`'a `profile` namespace + `sidebar.myProfile` eklendi.
- **EKSİK**: app-sidebar.tsx'e profil linki eklenmedi. Yapılacak:
  - myRequests grubuna `{ title: t("myProfile"), href: "/dashboard/profile", icon: UserCircle }`
  - VEYA footer dropdown'a Settings'ten önce profil linki.
- **EKSİK**: `npm run build` ile doğrulama yapılmadı (commit'lendi ama build edilmedi).

## Sıradaki kuyruk (tasks/backlog.md + TaskList)
- #7 profil sayfasını bitir (sidebar linki + build doğrula)
- #6 API hata yönetimi + Zod doğrulama standardizasyonu
- #8 Type hardening (any azalt, ~181 lint hatası)
- Ayrıca: test altyapısı (Vitest), dashboard grafikleri, asgari ücret istisna
  yöntemi muhasebeci teyidi (backlog 4c)

## İlk iş: dönünce `npm run build` çalıştır, profil sayfası hatasızsa sidebar linkini ekle.
