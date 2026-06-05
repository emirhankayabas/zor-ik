# Backlog — Kalan İyileştirmeler

Bu refactor turunda kapsam dışı bırakılan, sonraki turlara önerilen işler.
(GitHub'da issue'ya çevrilebilir.)

## 1. TypeScript tip sıkılaştırma (orta öncelik, ayrı PR)
`npm run lint` ~181 hata veriyor; neredeyse tamamı `@typescript-eslint/no-explicit-any`.
Çoğu API yanıtlarının `any[]` ile tutulmasından geliyor (örn. `useState<any[]>([])`).
- **Yapılacak:** API yanıtları için paylaşılan tipler tanımla (Prisma tiplerinden türetilebilir),
  `any`'leri kademeli değiştir. Runtime davranışı değiştirme riski olduğundan odaklı ve
  test edilerek yapılmalı.
- Not: build'i engellemiyor (`next build` geçiyor), ama "temiz kod" hedefi için borç.

## 2. React Hooks: set-state-in-effect uyarıları (düşük öncelik)
Birkaç bileşen effect içinde doğrudan `setState` çağırıyor (ör. `language-selector.tsx`).
Cascading render'a yol açabilir. Türev state / lazy init ile düzeltilebilir.

## 3. Kalan sayfaları component'lere böl (devam refactor)
Bu turda en büyük 6 sayfa bölündü. Geri kalan ~24 sayfadan en büyükleri:
- `leaves/[id]/page.tsx` (430)
- `pdks/page.tsx` (396)
- `shifts/page.tsx` (385)
- `leaves/page.tsx` (364)
- `leaves/new/page.tsx` (361)
- `calendar/page.tsx` (346)
- `attendance/page.tsx` (340)
- `dashboard/page.tsx` (334)
- `company-settings/page.tsx` (318)
Aynı kalıp: route-local `_components/` + `use-*.ts` hook + ince `page.tsx`.

## 4. Onay timeline'ı paylaşılan bileşene çıkar ✅ YAPILDI
3 sayfadaki kopya timeline → tek `components/shared/approval-timeline.tsx`.
Ayrıca İK/rol tespiti `lib/access.ts`'te merkezileştirildi (`isHrUser`,
`canManageCompany`) ve client tarafındaki ~tüm kopya string predikatları
(hook'lar, sidebar, pdks) bununla değiştirildi.

## 4b. API route'larında rol/İK kontrolünü merkezileştir (auth-hassas)
`lib/access.ts` helper'ları henüz API route'larına uygulanmadı; oralarda hâlâ
kopya string kontrolleri var (`isHR`, `isAdmin`, `['İK','İnsan Kaynakları']`).
Predikatlar dosyadan dosyaya küçük farklarla değiştiği için (kimi SUPER_ADMIN
içeriyor kimi değil) yetkilendirme davranışını değiştirmemek adına dikkatle ve
testle yapılmalı. Sunucu tarafı için `isHrDepartmentName` + entity bazlı yardımcı
genişletilebilir.

## 4c. Bordro: asgari ücret istisna yöntemi (muhasebeci teyidi)
`payroll-engine.ts` asgari ücret gelir vergisi istisnasını "matrahtan düşme"
yöntemiyle uyguluyor (kullanıcı tarafından verilen formül). Resmi 2022+ yöntem,
istisnayı matrahı azaltmak yerine asgari ücret üzerinden hesaplanan vergiyi
düşmek şeklindedir; yüksek maaşlılarda fark oluşur. SGK tavanı düzeltildi
(7.5× asgari ücret). İstisna yöntemi mali müşavir teyidiyle netleştirilmeli;
ayrıca kümülatif matrah istisna-öncesi/sonrası tutarlılığı gözden geçirilmeli.

## 5. Test altyapısı (yok)
Hiç test yok. Kritik saf mantık (payroll-engine, leave-engine, pdks-engine) için
Vitest + birim testleri eklenmeli — refactor güvenliği için en yüksek değerli yatırım.

## 6. confirm akışı i18n
`components/shared/confirm-dialog.tsx` varsayılan buton metinleri Türkçe sabit
("İptal"/"Onayla"). next-intl ile çevrilebilir hale getirilebilir.
