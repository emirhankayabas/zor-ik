export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  actualDays: number;
  reason: string;
  status: string;
  createdAt: string;
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
  leaveType: {
    name: string;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    approver: {
      id: string;
      name: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export interface CategorizedRequests {
  pending: LeaveRequest[];
  approved: LeaveRequest[];
  rejected: LeaveRequest[];
}
