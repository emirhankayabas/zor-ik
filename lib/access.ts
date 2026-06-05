/**
 * Merkezi rol/İK erişim mantığı.
 *
 * Önceden "İK" tespiti (departman adı + COMPANY_ADMIN kontrolü) onlarca dosyaya
 * string karşılaştırması olarak kopyalanmıştı; kimi yer SUPER_ADMIN'i içeriyor
 * kimi içermiyordu. Tek doğru tanım burada toplanır.
 */

/** İK departmanının olası adları (companyId bazında departman adıyla eşleşir). */
export const HR_DEPARTMENT_NAMES = ["İK", "İnsan Kaynakları"];

type AccessUser =
  | {
      role?: string | null;
      departmentName?: string | null;
    }
  | null
  | undefined;

/** Verilen departman adı İK departmanı mı? */
export function isHrDepartmentName(name?: string | null): boolean {
  return !!name && HR_DEPARTMENT_NAMES.includes(name);
}

/**
 * Kullanıcı İK yetkisine sahip mi? İK departmanı üyesi, şirket yöneticisi
 * (COMPANY_ADMIN) veya platform yöneticisi (SUPER_ADMIN).
 */
export function isHrUser(user: AccessUser): boolean {
  if (!user) return false;
  return (
    user.role === "COMPANY_ADMIN" ||
    user.role === "SUPER_ADMIN" ||
    isHrDepartmentName(user.departmentName)
  );
}

/**
 * Kullanıcı şirket yönetimi alanlarını (çalışanlar, bordro, vardiya, onaylar)
 * görebilir mi? İK yetkisi VEYA birim yöneticisi (MANAGER).
 */
export function canManageCompany(user: AccessUser): boolean {
  return isHrUser(user) || user?.role === "MANAGER";
}
