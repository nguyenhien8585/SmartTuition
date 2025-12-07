export const VIETQR_BANKS = [
  { id: '970436', name: 'Vietcombank', code: 'VCB' },
  { id: '970415', name: 'VietinBank', code: 'ICB' },
  { id: '970418', name: 'BIDV', code: 'BIDV' },
  { id: '970405', name: 'Agribank', code: 'VBA' },
  { id: '970422', name: 'MB Bank', code: 'MB' },
  { id: '970407', name: 'Techcombank', code: 'TCB' },
  { id: '970432', name: 'VPBank', code: 'VPB' },
  { id: '970423', name: 'TPBank', code: 'TPB' },
  { id: '970403', name: 'Sacombank', code: 'STB' },
  { id: '970437', name: 'HDBank', code: 'HDB' },
  { id: '970441', name: 'VIB', code: 'VIB' },
  { id: '970443', name: 'SHB', code: 'SHB' },
  { id: '970428', name: 'Nam A Bank', code: 'NAB' },
  { id: '970416', name: 'ACB', code: 'ACB' },
  { id: '963388', name: 'Timo', code: 'TIMO' },
  { id: '971005', name: 'ViettelMoney', code: 'VTLMONEY' },
  { id: '971011', name: 'VNPT Money', code: 'VNPTMONEY' },
];

export const DEFAULT_BANK_CONFIG = {
  bankId: '970422', // MB default
  accountNo: '',
  accountName: '',
  template: 'compact' as const,
  bankName: 'MB Bank',
  teacherName: 'Cô Giáo',
};

export const MOCK_STUDENTS = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    className: 'Lớp Piano 01',
    baseFee: 1500000,
    adjustmentContent: 'Nghỉ 1 buổi có phép',
    adjustmentAmount: -100000,
    note: '',
  },
  {
    id: '2',
    name: 'Trần Thị Bích',
    className: 'Lớp Vẽ Chiều T7',
    baseFee: 800000,
    adjustmentContent: 'Nợ tháng trước + mua màu',
    adjustmentAmount: 250000,
    note: '',
  },
];