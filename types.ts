
export interface Student {
  id: string;
  name: string;
  className: string;
  baseFee: number; // Học phí cơ bản
  month?: string; // Tháng thu (VD: 11/2025)
  
  // New flexible adjustment fields
  adjustmentContent?: string; // Nội dung điều chỉnh (Nghỉ học, nợ...)
  adjustmentAmount?: number; // Số tiền điều chỉnh (Âm là trừ, Dương là cộng)

  // Payment Tracking
  isPaid?: boolean;
  paidDate?: string; // YYYY-MM-DD
  paymentMethod?: 'CASH' | 'TRANSFER'; // Hình thức thanh toán
  paidAmount?: number; // Số tiền thực tế đã đóng
  paymentDeadline?: string; // Ngày hạn nộp (VD: 10, 15, 20...)
  
  // Attendance
  attendanceCount?: number; // Legacy count (kept for compatibility)
  attendanceHistory?: string[]; // List of dates attended (YYYY-MM-DD)

  // Sent Receipt Tracking
  isSent?: boolean;

  // Legacy fields (kept for backward compatibility or AI parsing if needed, can be mapped to adjustments)
  absentDays?: number; 
  deductionPerDay?: number; 
  previousDebt?: number; 
  otherFee?: number; 
  
  note: string;

  // Fields required by other components
  parentName?: string;
  phone?: string;
  balance: number; // Keeping it as mandatory for dashboard logic, or default to 0
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'TRANSFER';
  note?: string;
  status?: string;
}

export interface BankConfig {
  bankId: string; // Bin code or shortname (e.g., 'MB', 'VCB')
  accountNo: string;
  accountName: string;
  template: 'compact' | 'qr_only' | 'print';
  bankName?: string; // Custom bank name for display
  teacherName?: string; // Teacher name for messages
}

export interface UserProfile {
  id: string;
  name: string; // Profile name (e.g. "Cô Lan", "Thầy Minh")
  config: BankConfig;
}

export interface GithubConfig {
    token: string;
    owner: string;
    repo: string;
    path: string; // e.g. "data/backup.json"
    autoSync?: boolean; // Auto-sync on app start
}

export enum AppTab {
  INPUT = 'INPUT',
  LIST = 'LIST',
  ATTENDANCE = 'ATTENDANCE',
  SETTINGS = 'SETTINGS',
}

export type ViewState = 'DASHBOARD' | 'STUDENTS' | 'PAYMENTS';
