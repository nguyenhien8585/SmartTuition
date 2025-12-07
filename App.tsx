
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SettingsForm } from './components/SettingsForm';
import { InputSection } from './components/InputSection';
import { ReceiptCard } from './components/ReceiptCard';
import { StudentRow } from './components/StudentRow';
import { AttendanceManager } from './components/AttendanceManager';
import { Student, BankConfig, AppTab } from './types';
import { DEFAULT_BANK_CONFIG } from './constants';
import { getStudents, saveStudents } from './services/storageService';
import { FileText, Settings, AlertTriangle, PlusCircle, Filter, CalendarCheck, TrendingUp, DollarSign, Printer, FileSpreadsheet, Edit3, X, Save, Trash2, MessageSquare, CheckCircle, CalendarDays, Wallet, Search, Calculator, Lock, LogOut, KeyRound, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

// SECRET CODE CONFIGURATION
const APP_SECRET_CODE = "123456789@2025@"; // MÃ BÍ MẬT MẶC ĐỊNH

// Helper to get local date string YYYY-MM-DD
export const getLocalDateString = () => {
    const d = new Date();
    // Use local time, not UTC
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper for currency input formatting (1.000.000)
const formatCurrencyInput = (value: number | string | undefined) => {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseCurrencyInput = (value: string) => {
    return Number(value.replace(/\./g, ''));
};

// Helpers for Month Picker Conversion
const toInputMonth = (displayStr: string) => {
    // Converts "12/2025" -> "2025-12" for input type="month"
    if (!displayStr || !displayStr.includes('/')) return new Date().toISOString().slice(0, 7);
    const [m, y] = displayStr.split('/');
    return `${y}-${m.padStart(2, '0')}`;
};

const fromInputMonth = (inputStr: string) => {
    // Converts "2025-12" -> "12/2025" for App state
    if (!inputStr) return "";
    const [y, m] = inputStr.split('-');
    return `${parseInt(m, 10)}/${y}`;
};

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // State
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.INPUT);
  // Initialize from storage instead of empty array
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [bankConfig, setBankConfig] = useState<BankConfig>(DEFAULT_BANK_CONFIG);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getFullYear()}`;
  });

  // Filter State
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getFullYear()}`;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Note Modal State
  const [noteModal, setNoteModal] = useState<{ open: boolean; id: string | null; note: string }>({ 
      open: false, id: null, note: '' 
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null; name: string }>({
      open: false, id: null, name: ''
  });

  // Payment Confirmation Modal State
  const [paymentModal, setPaymentModal] = useState<{ 
      open: boolean; 
      student: Student | null; 
      date: string; 
      method: 'CASH' | 'TRANSFER';
      amount: number; // Actual amount being paid
  }>({
      open: false, student: null, date: '', method: 'TRANSFER', amount: 0
  });

  // Check Auth on Mount
  useEffect(() => {
      const isAuth = localStorage.getItem('smarttuition_auth');
      if (isAuth === 'true') {
          setIsAuthenticated(true);
      }
  }, []);

  // Hydrate Bank Config from localStorage
  useEffect(() => {
    const savedBank = localStorage.getItem('tuition_bank_config');
    if (savedBank) setBankConfig(JSON.parse(savedBank));
  }, []);

  // Persist Students to localStorage whenever they change
  useEffect(() => {
    saveStudents(students);
  }, [students]);

  // --- AUTH HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passcodeInput === APP_SECRET_CODE) {
          setIsAuthenticated(true);
          localStorage.setItem('smarttuition_auth', 'true');
          setAuthError('');
      } else {
          setAuthError('Mã bí mật không đúng');
          setPasscodeInput('');
      }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('smarttuition_auth');
      setPasscodeInput('');
  };

  // Handlers
  const handleSaveConfig = (config: BankConfig) => {
    setBankConfig(config);
    localStorage.setItem('tuition_bank_config', JSON.stringify(config));
    alert('Đã lưu cấu hình!');
    setActiveTab(AppTab.INPUT);
  };

  const handleAddStudents = (newStudents: Student[]) => {
    setStudents(prev => [...prev, ...newStudents]);
    setActiveTab(AppTab.LIST);
  };

  // ----- ROBUST ACTION HANDLERS (USING MODALS) -----

  // Open Delete Modal
  const handleRemoveStudent = (id: string) => {
    const s = students.find(st => st.id === id);
    if (s) {
        setDeleteModal({ open: true, id: id, name: s.name });
    }
  };

  // Confirm Delete
  const confirmDelete = () => {
      if (deleteModal.id) {
          setStudents(prev => prev.filter(s => s.id !== deleteModal.id));
          if (selectedStudentId === deleteModal.id) setSelectedStudentId(null);
      }
      setDeleteModal({ open: false, id: null, name: '' });
  };

  // Open Note Modal
  const handleEditNote = (id: string, currentNote: string) => {
      setNoteModal({ open: true, id, note: currentNote });
  };

  // Save Note
  const saveNote = () => {
      if (noteModal.id) {
          setStudents(prev => prev.map(s => s.id === noteModal.id ? { ...s, note: noteModal.note } : s));
      }
      setNoteModal({ open: false, id: null, note: '' });
  };

  const openEditModal = (student: Student) => {
      setEditingStudent({...student});
  };

  const handleSaveEditedStudent = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingStudent) return;

      setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
      setEditingStudent(null);
  };

  // TRIGGER PAYMENT MODAL
  const handleTogglePaid = (id: string) => {
      const s = students.find(st => st.id === id);
      if (!s) return;

      if (s.isPaid) {
          // If unchecking, just ask for simple confirmation
          if (confirm(`Hủy trạng thái ĐÃ THU TIỀN của học sinh ${s.name}?`)) {
              const totalDue = calculateTotal(s);
              setStudents(prev => prev.map(st => st.id === id ? { 
                  ...st, 
                  isPaid: false, 
                  paidDate: undefined, 
                  paymentMethod: undefined,
                  paidAmount: undefined,
                  balance: -totalDue // Reset balance to negative total due (debt)
              } : st));
          }
      } else {
          // Calculate default amount (Total Due)
          const totalDue = calculateTotal(s);
          
          // If checking, open modal to confirm details
          setPaymentModal({
              open: true,
              student: s,
              date: getLocalDateString(),
              method: 'TRANSFER',
              amount: totalDue // Default to full payment
          });
      }
  };

  // CONFIRM PAYMENT
  const handleConfirmPayment = () => {
      if (!paymentModal.student) return;
      
      const { student, date, method, amount } = paymentModal;
      const totalDue = calculateTotal(student);
      const newBalance = amount - totalDue; // e.g. Paid 300, Due 500 => Balance -200 (Debt)
      
      setStudents(prev => prev.map(s => s.id === student.id ? {
          ...s,
          isPaid: true,
          paidDate: date,
          paymentMethod: method,
          paidAmount: amount,
          balance: newBalance
      } : s));
      
      setPaymentModal({ open: false, student: null, date: '', method: 'TRANSFER', amount: 0 });
  };

  const handleToggleSent = (id: string) => {
      setStudents(prev => prev.map(s => 
          s.id === id ? { ...s, isSent: !s.isSent } : s
      ));
  };

  // Attendance update from AttendanceManager
  const handleUpdateAttendanceHistory = (id: string, newHistory: string[]) => {
      setStudents(prev => prev.map(s => 
          s.id === id ? { ...s, attendanceHistory: newHistory, attendanceCount: newHistory.length } : s
      ));
  };

  const handleBulkCheckIn = (studentIds: string[]) => {
    const today = getLocalDateString();
    setStudents(prev => prev.map(s => {
        if (studentIds.includes(s.id)) {
            const history = s.attendanceHistory || [];
            if (!history.includes(today)) {
                const newHistory = [...history, today];
                return { ...s, attendanceHistory: newHistory, attendanceCount: newHistory.length };
            }
        }
        return s;
    }));
  };

  // New toggle attendance for today (legacy function for main list, now only used if passed down, but buttons removed)
  const handleToggleAttendanceToday = (id: string) => {
      const today = getLocalDateString();
      setStudents(prev => prev.map(s => {
          if (s.id === id) {
              const history = s.attendanceHistory || [];
              const exists = history.includes(today);
              const newHistory = exists 
                  ? history.filter(d => d !== today)
                  : [...history, today];
              
              return { 
                  ...s, 
                  attendanceHistory: newHistory,
                  attendanceCount: newHistory.length // Sync legacy
              };
          }
          return s;
      }));
  };

  // ----- CALCULATION & FILTER LOGIC -----

  const calculateTotal = (s: Student) => {
      const adjustmentVal = s.adjustmentAmount !== undefined 
          ? s.adjustmentAmount 
          : -((s.absentDays || 0) * (s.deductionPerDay || 0)) + (s.previousDebt || 0) + (s.otherFee || 0);
      return (s.baseFee || 0) + adjustmentVal;
  };

  const uniqueClasses = Array.from(new Set(students.map(s => String(s.className || 'Khác')))).sort();
  const uniqueMonths = Array.from(new Set(students.map(s => s.month || 'Không xác định'))).sort().reverse();
  
  const filteredStudents = students.filter(s => {
      const matchClass = selectedClass === 'ALL' || String(s.className || 'Khác') === selectedClass;
      const matchMonth = selectedMonth === 'ALL' || (s.month || 'Không xác định') === selectedMonth;
      
      const term = searchTerm.toLowerCase();
      const matchSearch = term === '' || s.name.toLowerCase().includes(term);

      return matchClass && matchMonth && matchSearch;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Stats
  const statsTotal = filteredStudents.reduce((sum, s) => sum + calculateTotal(s), 0);
  const statsCollected = filteredStudents.filter(s => s.isPaid).reduce((sum, s) => sum + (s.paidAmount || calculateTotal(s)), 0);
  const statsRemaining = statsTotal - statsCollected;

  const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  // Export Logic
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
        alert("Không có dữ liệu để xuất");
        return;
    }

    const data = filteredStudents.map((s, index) => {
        const total = calculateTotal(s);
        const methodText = s.isPaid ? (s.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản') : '';
        const attCount = s.attendanceHistory ? s.attendanceHistory.length : (s.attendanceCount || 0);
        
        return {
            "STT": index + 1,
            "Họ và Tên": s.name,
            "Lớp": s.className,
            "Tháng": s.month,
            "Số buổi học": `${attCount}/8`,
            "Học phí gốc": s.baseFee,
            "Nội dung điều chỉnh": s.adjustmentContent,
            "Số tiền điều chỉnh": s.adjustmentAmount,
            "Tổng phải thu": total,
            "Đã thu": s.paidAmount || (s.isPaid ? total : 0),
            "Còn thiếu": s.isPaid ? (total - (s.paidAmount || total)) : total,
            "Trạng thái nộp": s.isPaid ? "Đã nộp" : "Chưa nộp",
            "Ngày nộp": s.paidDate || "",
            "Hình thức đóng": methodText,
            "Đã gửi phiếu": s.isSent ? "Rồi" : "Chưa",
            "Ghi chú": s.note
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BaoCaoThuPhi");
    const fileName = `BaoCao_HocPhi_${selectedMonth === 'ALL' ? 'TongHop' : selectedMonth.replace('/', '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
      window.print();
  };

  // Portal Target
  const printMount = document.getElementById('print-mount');

  // --- RENDER LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm animate-fade-in border border-slate-200">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                      <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">SmartTuition</h2>
                  <p className="text-slate-500 text-center mb-6 text-sm">Vui lòng nhập mã bí mật để truy cập</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <div className="relative">
                              <KeyRound className="absolute left-3 top-3 text-slate-400" size={20} />
                              <input 
                                  type="password" 
                                  value={passcodeInput}
                                  onChange={(e) => setPasscodeInput(e.target.value)}
                                  placeholder="Nhập mã..."
                                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                  autoFocus
                              />
                          </div>
                          {authError && <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{authError}</p>}
                      </div>
                      <button 
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                      >
                          Truy cập hệ thống <ChevronRight size={18} />
                      </button>
                  </form>
                  <p className="text-center text-xs text-slate-400 mt-6">Mã mặc định: 123456</p>
              </div>
          </div>
      )
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="min-h-screen pb-20 print:hidden font-sans">
      {/* Navbar - Hidden on Print */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">ST</div>
              <span className="font-bold text-gray-800 text-lg hidden sm:block">SmartTuition</span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              <button
                onClick={() => setActiveTab(AppTab.INPUT)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === AppTab.INPUT ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">Nhập Liệu</span>
              </button>
              <button
                onClick={() => setActiveTab(AppTab.LIST)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition relative ${activeTab === AppTab.LIST ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Danh Sách</span>
                {students.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {students.length}
                    </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab(AppTab.ATTENDANCE)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === AppTab.ATTENDANCE ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <CalendarCheck size={18} />
                <span className="hidden sm:inline">Điểm danh</span>
              </button>
              <button
                onClick={() => setActiveTab(AppTab.SETTINGS)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === AppTab.SETTINGS ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Cấu Hình</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2"
                title="Đăng xuất / Khóa màn hình"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Warning if no Bank Config */}
        {!bankConfig.accountNo && activeTab !== AppTab.SETTINGS && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-500 mr-3" />
              <div>
                <p className="font-bold text-yellow-800">Chưa cấu hình ngân hàng</p>
                <p className="text-sm text-yellow-700">Vui lòng vào mục Cấu Hình để thiết lập tài khoản nhận tiền cho mã QR.</p>
              </div>
              <button 
                onClick={() => setActiveTab(AppTab.SETTINGS)}
                className="ml-auto bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium transition"
              >
                Cài đặt ngay
              </button>
            </div>
          </div>
        )}

        {/* INPUT TAB */}
        {activeTab === AppTab.INPUT && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Nhập dữ liệu học phí</h2>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                    <span className="text-sm text-gray-500">Tháng thu:</span>
                    {/* UPDATED: Month Picker Input */}
                    <input 
                        type="month" 
                        value={toInputMonth(currentMonth)}
                        onChange={(e) => setCurrentMonth(fromInputMonth(e.target.value))}
                        className="font-bold text-gray-800 outline-none bg-transparent cursor-pointer"
                    />
                </div>
            </div>
            <InputSection 
                onAddStudents={handleAddStudents} 
                existingStudents={students} 
                currentMonth={currentMonth}
            />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === AppTab.SETTINGS && (
          <div className="animate-fade-in pt-4">
            <SettingsForm config={bankConfig} onSave={handleSaveConfig} />
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === AppTab.ATTENDANCE && (
          <div className="animate-fade-in">
             <AttendanceManager 
                students={students}
                onUpdateAttendance={handleUpdateAttendanceHistory}
                onBulkCheckIn={handleBulkCheckIn}
                calculateTotal={calculateTotal}
                fmtMoney={fmtMoney}
                today={getLocalDateString()}
             />
          </div>
        )}

        {/* LIST / RECEIPT TAB */}
        {activeTab === AppTab.LIST && (
          <div className="animate-fade-in">
            {students.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu</h3>
                    <p className="text-gray-500 mb-6">Hãy thêm học sinh hoặc nhập liệu từ Excel để tạo phiếu thu</p>
                    <button 
                        onClick={() => setActiveTab(AppTab.INPUT)}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Tạo mới ngay
                    </button>
                </div>
            ) : selectedStudent ? (
                // DETAIL VIEW
                <div>
                     <ReceiptCard 
                        student={selectedStudent} 
                        bankConfig={bankConfig} 
                        month={selectedStudent.month || currentMonth}
                        onBack={() => setSelectedStudentId(null)} 
                    />
                </div>
            ) : (
                // LIST VIEW
                <div>
                    {/* STATS DASHBOARD */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Tổng dự thu ({selectedMonth === 'ALL' ? 'Tất cả' : selectedMonth})</p>
                                <p className="text-xl font-bold text-blue-600">{fmtMoney(statsTotal)} đ</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-full text-blue-500"><TrendingUp size={20} /></div>
                        </div>
                         <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Đã thu thực tế</p>
                                <p className="text-xl font-bold text-green-600">{fmtMoney(statsCollected)} đ</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-full text-green-500"><CalendarCheck size={20} /></div>
                        </div>
                         <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Còn lại chưa thu</p>
                                <p className="text-xl font-bold text-orange-600">{fmtMoney(statsRemaining)} đ</p>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-full text-orange-500"><DollarSign size={20} /></div>
                        </div>
                    </div>

                    {/* FILTER TOOLBAR */}
                     <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">
                                Danh sách ({filteredStudents.length})
                            </h2>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1.5">
                                <Search size={16} className="text-gray-500"/>
                                <input 
                                    type="text"
                                    placeholder="Tìm tên..."
                                    className="outline-none text-sm text-gray-700 bg-transparent w-32 sm:w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1.5">
                                <Filter size={16} className="text-gray-500"/>
                                <select 
                                    className="outline-none text-sm text-gray-700 bg-transparent min-w-[80px]"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="ALL">Tất cả lớp</option>
                                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1.5">
                                <span className="text-xs text-gray-500">Tháng:</span>
                                <select 
                                    className="outline-none text-sm text-gray-700 bg-transparent min-w-[60px]"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="ALL">Tất cả</option>
                                    {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm whitespace-nowrap ml-auto"
                            >
                                <FileSpreadsheet size={16} /> Xuất Excel
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm whitespace-nowrap"
                            >
                                <Printer size={16} /> In / Lưu PDF
                            </button>
                        </div>
                    </div>

                    {/* STUDENT LIST */}
                    <div className="space-y-3">
                        {filteredStudents.map((student) => (
                            <StudentRow
                                key={student.id}
                                student={student}
                                calculateTotal={calculateTotal}
                                fmtMoney={fmtMoney}
                                onTogglePaid={handleTogglePaid}
                                onToggleSent={handleToggleSent}
                                onToggleAttendance={handleToggleAttendanceToday}
                                onView={setSelectedStudentId}
                                onEdit={openEditModal}
                                onNote={handleEditNote}
                                onDelete={handleRemoveStudent}
                            />
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
        
        {/* PAYMENT CONFIRM MODAL */}
        {paymentModal.open && paymentModal.student && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                 <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                    <div className="bg-green-600 p-4 text-white">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <CheckCircle size={24} /> Xác nhận thu tiền
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 text-center">
                            <p className="text-gray-500 text-sm">Học sinh</p>
                            <p className="text-xl font-bold text-gray-800">{paymentModal.student.name}</p>
                            
                            <div className="flex justify-between items-center mt-3 text-sm bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Cần thu:</span>
                                <span className="font-bold text-gray-800">
                                    {fmtMoney(calculateTotal(paymentModal.student))} đ
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số tiền thực thu</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={formatCurrencyInput(paymentModal.amount)}
                                        onChange={(e) => setPaymentModal({...paymentModal, amount: parseCurrencyInput(e.target.value)})}
                                        className="w-full p-2.5 border-2 border-green-500 rounded-lg focus:outline-none text-xl font-bold text-green-700 text-right pr-8"
                                    />
                                    <span className="absolute right-3 top-3 text-gray-400 font-bold">đ</span>
                                </div>
                                {/* Calculated Difference */}
                                {(() => {
                                    const totalDue = calculateTotal(paymentModal.student);
                                    const diff = paymentModal.amount - totalDue;
                                    return (
                                        <div className={`text-right text-xs mt-1 font-bold ${diff < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {diff < 0 ? `Còn thiếu: ${fmtMoney(Math.abs(diff))}` : (diff > 0 ? `Dư: ${fmtMoney(diff)}` : 'Đủ')}
                                        </div>
                                    )
                                })()}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày thu</label>
                                <input 
                                    type="date"
                                    value={paymentModal.date}
                                    onChange={(e) => setPaymentModal({...paymentModal, date: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:border-green-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hình thức</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentModal({...paymentModal, method: 'TRANSFER'})}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${paymentModal.method === 'TRANSFER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200'}`}
                                    >
                                        <Wallet size={20} className="mb-1" />
                                        <span className="text-sm font-bold">Chuyển khoản</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentModal({...paymentModal, method: 'CASH'})}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${paymentModal.method === 'CASH' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200'}`}
                                    >
                                        <DollarSign size={20} className="mb-1" />
                                        <span className="text-sm font-bold">Tiền mặt</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={() => setPaymentModal({ ...paymentModal, open: false })}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleConfirmPayment}
                                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                 </div>
             </div>
        )}

        {/* EDIT MODAL */}
        {editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Edit3 size={20} className="text-primary"/>
                            Sửa thông tin học sinh
                        </h3>
                        <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveEditedStudent} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ tên</label>
                                <input 
                                    type="text" 
                                    value={editingStudent.name}
                                    onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lớp</label>
                                <input 
                                    type="text" 
                                    value={editingStudent.className}
                                    onChange={e => setEditingStudent({...editingStudent, className: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Học phí cơ bản (VNĐ)</label>
                            <input 
                                type="text" 
                                value={formatCurrencyInput(editingStudent.baseFee)}
                                onChange={e => setEditingStudent({...editingStudent, baseFee: parseCurrencyInput(e.target.value)})}
                                className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none font-bold text-gray-800 text-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase">Điều chỉnh</label>
                            </div>
                            <div>
                                <label className="block text--[10px] text-gray-500 mb-1">Nội dung</label>
                                <input 
                                    type="text" 
                                    value={editingStudent.adjustmentContent || ''}
                                    onChange={e => setEditingStudent({...editingStudent, adjustmentContent: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none text-sm"
                                    placeholder="Nghỉ, nợ..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1">Số tiền (+/-)</label>
                                <input 
                                    type="text" 
                                    value={formatCurrencyInput(editingStudent.adjustmentAmount)}
                                    onChange={e => setEditingStudent({...editingStudent, adjustmentAmount: parseCurrencyInput(e.target.value)})}
                                    className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none text-sm"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setEditingStudent(null)}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* DELETE MODAL (REPLACES WINDOW.CONFIRM) */}
        {deleteModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                 <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa học sinh <br/> 
                        <span className="font-bold text-gray-800">{deleteModal.name}</span> không?
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setDeleteModal({ ...deleteModal, open: false })}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            Xóa ngay
                        </button>
                    </div>
                 </div>
            </div>
        )}

        {/* NOTE MODAL (REPLACES WINDOW.PROMPT) */}
        {noteModal.open && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                 <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare size={20} className="text-orange-500"/>
                            Ghi chú nhanh
                        </h3>
                        <button onClick={() => setNoteModal({ ...noteModal, open: false })} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nội dung ghi chú</label>
                        <input 
                            type="text" 
                            autoFocus
                            value={noteModal.note}
                            onChange={e => setNoteModal({...noteModal, note: e.target.value})}
                            placeholder="Ví dụ: Còn nợ 100k, Đã đóng 1 phần..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveNote();
                            }}
                        />
                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={() => setNoteModal({ ...noteModal, open: false })}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={saveNote}
                                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                            >
                                Lưu ghi chú
                            </button>
                        </div>
                    </div>
                 </div>
             </div>
        )}
      </main>

        {/* PRINT REPORT PORTAL - RENDERS OUTSIDE ROOT */}
        {printMount && createPortal(
            <div className="bg-white text-black p-8 font-serif">
                {/* Report Header */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold uppercase mb-2">Báo Cáo Thu Học Phí</h1>
                    <p className="text-lg">Tháng: <strong>{selectedMonth === 'ALL' ? 'Tổng hợp' : selectedMonth}</strong></p>
                    <p className="text-sm italic mt-2">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                
                <div className="mb-6 flex justify-between text-base font-bold border-b border-gray-300 pb-4">
                    <span>Tổng dự thu: {fmtMoney(statsTotal)} đ</span>
                    <span>Đã thu: {fmtMoney(statsCollected)} đ</span>
                    <span>Còn lại: {fmtMoney(statsRemaining)} đ</span>
                </div>

                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-center w-12">STT</th>
                            <th className="border border-black p-2 text-left">Họ và Tên</th>
                            <th className="border border-black p-2 text-center">Lớp</th>
                            <th className="border border-black p-2 text-center">Số buổi</th>
                            <th className="border border-black p-2 text-right">Tổng Tiền</th>
                            <th className="border border-black p-2 text-right">Đã Nộp</th>
                            <th className="border border-black p-2 text-center">Ngày nộp</th>
                            <th className="border border-black p-2 text-left w-32">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s, idx) => {
                            const total = calculateTotal(s);
                            const paid = s.paidAmount || (s.isPaid ? total : 0);
                            return (
                                <tr key={s.id}>
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-2 font-medium">{s.name}</td>
                                    <td className="border border-black p-2 text-center">{s.className}</td>
                                    <td className="border border-black p-2 text-center">{s.attendanceCount || 0}/8</td>
                                    <td className="border border-black p-2 text-right font-bold">{fmtMoney(total)}</td>
                                    <td className="border border-black p-2 text-right">{fmtMoney(paid)}</td>
                                    <td className="border border-black p-2 text-center">
                                        {s.isPaid ? (s.paidDate ? new Date(s.paidDate).toLocaleDateString('vi-VN') : 'Đã thu') : '-'}
                                    </td>
                                    <td className="border border-black p-2 text-left italic text-xs">
                                        {s.note}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>,
            printMount
        )}
    </div>
  );
}
