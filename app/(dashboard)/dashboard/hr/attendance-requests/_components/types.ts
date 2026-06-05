export interface AttendanceCorrection {
  id: string;
  type: "ENTRY" | "EXIT" | "BOTH";
  date: string;
  entryTime: string | null;
  exitTime: string | null;
  reason: string;
  status: string;
  createdAt: string;
  employee: {
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
    } | null;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    approverId: string;
    comment: string | null;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
      managedDepts?: { name: string }[];
    };
  }[];
}
