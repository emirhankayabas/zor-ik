export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  actualDays: number;
  reason: string;
  status: string;
  createdAt: string;
  leaveType: {
    name: string;
  };
  employee: {
    totalLeftLeaveDays: number;
    annualLeaveQuota: number;
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
