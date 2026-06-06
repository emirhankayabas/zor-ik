/**
 * Form ve liste bileşenleri arasında paylaşılan hafif veri şekilleri.
 * API'den dönen tam Prisma kaydının yalnızca UI'da kullanılan alanlarını içerir.
 */

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface ShiftOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}
