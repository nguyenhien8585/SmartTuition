
import { Student, Payment } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'tutorfee_students',
  PAYMENTS: 'tutorfee_payments',
};

// Seed data for demo purposes if empty
const SEED_STUDENTS: Student[] = [
  { id: '1', name: 'Nguyễn Văn A', parentName: 'Chị Lan', phone: '0912345678', className: 'Toán 9', baseFee: 500000, balance: -500000, note: '' },
  { id: '2', name: 'Trần Thị B', parentName: 'Anh Hùng', phone: '0987654321', className: 'Lý 10', baseFee: 600000, balance: 0, note: '' },
  { id: '3', name: 'Lê Văn C', parentName: 'Chị Mai', phone: '0909090909', className: 'Toán 9', baseFee: 500000, balance: -1000000, note: '' }, // Owes 2 months
];

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
    return SEED_STUDENTS;
  }
  return JSON.parse(data);
};

export const saveStudents = (students: Student[]): void => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getPayments = (): Payment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return data ? JSON.parse(data) : [];
};

export const savePayments = (payments: Payment[]): void => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};
