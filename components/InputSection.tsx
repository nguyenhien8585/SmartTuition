
import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../types';
import { Plus, FileSpreadsheet, Download, Upload, Loader2, FileUp, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

interface InputSectionProps {
  onAddStudents: (students: Student[]) => void;
  existingStudents: Student[];
  currentMonth: string; // Receive current month context
}

// Helper for currency input formatting (1.000.000)
const formatCurrencyInput = (value: number | string | undefined) => {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseCurrencyInput = (value: string) => {
    return Number(value.replace(/\./g, ''));
};

// Helper to check if a month string (MM/YYYY) is in the past relative to now
const isPastMonth = (monthStr: string): boolean => {
    if (!monthStr || !monthStr.includes('/')) return false;
    const [m, y] = monthStr.split('/').map(Number);
    const now = new Date();
    const currentM = now.getMonth() + 1;
    const currentY = now.getFullYear();

    if (y < currentY) return true;
    if (y === currentY && m < currentM) return true;
    return false;
};

// Helper to generate N dummy dates for a past month
const generatePastMonthAttendance = (monthStr: string, count: number = 8): string[] => {
    const [m, y] = monthStr.split('/');
    // Format YYYY-MM
    const year = y;
    const month = m.padStart(2, '0');
    
    // Cap at 31 days to be safe, though context implies max 8 sessions usually
    const safeCount = Math.min(count, 28); 
    
    // Generate dates from 01 to N
    return Array.from({ length: safeCount }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
};

export const InputSection: React.FC<InputSectionProps> = ({ onAddStudents, existingStudents, currentMonth }) => {
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPast = isPastMonth(currentMonth);
  
  const [manualForm, setManualForm] = useState<Partial<Student> & { attendanceCount?: number }>({
    baseFee: 0,
    adjustmentAmount: 0,
    adjustmentContent: '',
    attendanceCount: 8, // Default to full for past months
  });

  // Reset attendance count default when month changes
  useEffect(() => {
      setManualForm(prev => ({ ...prev, attendanceCount: 8 }));
  }, [currentMonth]);

  // Updated Duplicate Check: Include Month
  const checkDuplicate = (name: string, className: string): boolean => {
      const normalizedName = name.toLowerCase().trim();
      const normalizedClass = String(className).toLowerCase().trim();
      const targetMonth = currentMonth.trim();
      
      return existingStudents.some(s => {
          const sName = s.name.toLowerCase().trim();
          const sClass = String(s.className || '').toLowerCase().trim();
          const sMonth = (s.month || '').trim();
          
          // Duplicate only if Name + Class + Month matches
          return sName === normalizedName && sClass === normalizedClass && sMonth === targetMonth;
      });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;
    
    // Check Duplicate with Month context
    if (checkDuplicate(manualForm.name, manualForm.className || '')) {
        const msg = `Học sinh "${manualForm.name}" (Lớp: ${manualForm.className}) đã có trong danh sách tháng ${currentMonth}.\n\nBạn có chắc chắn muốn thêm trùng không?`;
        if (!confirm(msg)) {
            return;
        }
    }

    const fee = Number(manualForm.baseFee) || 0;
    const adj = Number(manualForm.adjustmentAmount) || 0;

    // Determine initial attendance based on month and input
    const initialHistory = isPast 
        ? generatePastMonthAttendance(currentMonth, manualForm.attendanceCount ?? 8) 
        : [];
    const initialCount = initialHistory.length;

    const newStudent: Student = {
      id: uuidv4(),
      name: manualForm.name,
      className: manualForm.className || 'Chung',
      baseFee: fee,
      adjustmentContent: manualForm.adjustmentContent,
      adjustmentAmount: adj,
      note: manualForm.note || '',
      isPaid: false,
      isSent: false,
      month: currentMonth, // Use prop
      attendanceCount: initialCount, 
      attendanceHistory: initialHistory,
      balance: -(fee + adj) // Initialize balance as negative (debt)
    };
    onAddStudents([newStudent]);

    setManualForm({
        baseFee: 0,
        adjustmentAmount: 0,
        adjustmentContent: '',
        name: '',
        className: '',
        note: '',
        attendanceCount: 8
    });
    
    if (isPast) {
        alert(`Đã thêm học sinh vào tháng cũ (${currentMonth}) với ${initialCount} buổi học.`);
    }
  };

  const downloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
        {
            "Họ và Tên": "Nguyễn Văn A",
            "Lớp": "Piano 01",
            "Số buổi": 8,
            "Học phí": 500000,
            "Nội dung điều chỉnh": "Nghỉ 1 buổi",
            "Số tiền điều chỉnh": -50000,
        },
        {
            "Họ và Tên": "Trần Thị B",
            "Lớp": "Vẽ T7",
            "Số buổi": 4,
            "Học phí": 800000,
            "Nội dung điều chỉnh": "Nợ tháng trước",
            "Số tiền điều chỉnh": 200000,
        }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Phi_Moi.xlsx");
  };

  const processExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      try {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const students: Student[] = [];
          const duplicates: string[] = [];

          jsonData.forEach((row: any) => {
              // 1. Name
              const name = row['Họ và Tên'] || row['Tên Học Sinh'] || row['Họ tên'] || row['Name'] || 'Không tên';
              
              // 2. Class - Force string conversion to prevent errors
              let rawClass = row['Lớp'] || row['Lớp Học'] || row['Class'] || 'Excel Import';
              const className = String(rawClass);
              
              // Check Duplicate with Month
              if (checkDuplicate(name, className)) {
                  duplicates.push(`${name} (${className})`);
              }

              // 3. Base Fee
              let baseFee = 0;
              const keys = Object.keys(row);
              const feeKey = keys.find(k => k.toLowerCase().includes('học phí') || k.toLowerCase().includes('hp'));
              if (feeKey) {
                  baseFee = Number(row[feeKey]) || 0;
              }

              // 4. Adjustment Content
              const contentKey = keys.find(k => k.toLowerCase().includes('nội dung điều chỉnh'));
              const adjustmentContent = contentKey ? (row[contentKey] || '') : '';
              
              // 5. Adjustment Amount
              const amountKey = keys.find(k => k.toLowerCase().includes('số tiền điều chỉnh'));
              const adjustmentAmount = amountKey ? (Number(row[amountKey]) || 0) : 0;
              
              // 6. Attendance Count (For Past Months)
              let initialHistory: string[] = [];
              if (isPast) {
                  // Look for "Số buổi" column
                  const countKey = keys.find(k => k.toLowerCase().includes('số buổi') || k.toLowerCase().includes('buổi'));
                  let count = 8; // Default to 8 if not found
                  if (countKey && row[countKey] !== undefined) {
                      count = Number(row[countKey]);
                  }
                  initialHistory = generatePastMonthAttendance(currentMonth, count);
              }

              const initialCount = initialHistory.length;

              students.push({
                  id: uuidv4(),
                  name,
                  className,
                  baseFee,
                  adjustmentContent,
                  adjustmentAmount,
                  note: '',
                  isPaid: false,
                  isSent: false,
                  month: currentMonth, // Use prop
                  attendanceCount: initialCount,
                  attendanceHistory: initialHistory,
                  balance: -(baseFee + adjustmentAmount) // Initialize balance
              });
          });

          if (duplicates.length > 0) {
              const confirmMsg = `Cảnh báo: Có ${duplicates.length} học sinh trong file đã tồn tại trong danh sách tháng ${currentMonth}:\n- ${duplicates.slice(0, 3).join('\n- ')}\n${duplicates.length > 3 ? '...' : ''}\n\nBạn có muốn tiếp tục nhập không (sẽ tạo trùng)?`;
              if (!confirm(confirmMsg)) {
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  return;
              }
          }

          if (students.length > 0) {
            onAddStudents(students);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setMode('manual'); 
            let msg = `Đã nhập thành công ${students.length} học sinh vào tháng ${currentMonth}!`;
            if (isPast) {
                msg += `\n(Tháng cũ: Đã tự động tạo dữ liệu điểm danh theo file)`;
            }
            alert(msg);
          } else {
            alert('Không tìm thấy dữ liệu hợp lệ trong file Excel.');
          }

      } catch (error) {
          console.error(error);
          alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 min-w-[100px] py-2 rounded-md font-medium text-sm transition ${mode === 'manual' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Thủ Công
        </button>
         <button
          onClick={() => setMode('excel')}
          className={`flex-1 min-w-[100px] py-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-1 ${mode === 'excel' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileSpreadsheet size={16} />
          Nhập Excel
        </button>
      </div>

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center justify-between">
              <span>Thêm học sinh mới</span>
              <span className="text-sm font-normal bg-blue-50 text-blue-600 px-2 py-1 rounded">Tháng {currentMonth}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                className="w-full p-2 border rounded focus:border-primary outline-none"
                placeholder="Nguyễn Văn A"
                value={manualForm.name || ''}
                onChange={e => setManualForm({...manualForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lớp / Nhóm</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:border-primary outline-none"
                placeholder="Piano T2-T5"
                value={manualForm.className || ''}
                onChange={e => setManualForm({...manualForm, className: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Học phí cơ bản (VNĐ)</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:border-primary outline-none font-medium"
                value={formatCurrencyInput(manualForm.baseFee)}
                placeholder="0"
                onChange={e => setManualForm({...manualForm, baseFee: parseCurrencyInput(e.target.value)})}
              />
            </div>
            
             <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Điều chỉnh (Nếu có)</label>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Nội dung</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded focus:border-primary outline-none"
                        placeholder="VD: Nghỉ 2 buổi, Nợ..."
                        value={manualForm.adjustmentContent || ''}
                        onChange={e => setManualForm({...manualForm, adjustmentContent: e.target.value})}
                    />
                </div>
                <div>
                     <label className="block text-xs text-gray-500 mb-1">Số tiền (+/-)</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded focus:border-primary outline-none font-medium"
                        placeholder="0"
                        value={formatCurrencyInput(manualForm.adjustmentAmount)}
                        onChange={e => setManualForm({...manualForm, adjustmentAmount: parseCurrencyInput(e.target.value)})}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Nhập số âm để giảm trừ (bôi đỏ)</p>
                </div>
            </div>

            {isPast && (
                <div className="md:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-center gap-3">
                    <AlertCircle className="text-yellow-600" size={24} />
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-yellow-800 uppercase mb-1">Số buổi học thực tế (Tháng cũ)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="31"
                                className="w-20 p-2 border border-yellow-300 rounded focus:border-yellow-500 outline-none font-bold text-center"
                                value={manualForm.attendanceCount}
                                onChange={e => setManualForm({...manualForm, attendanceCount: Number(e.target.value)})}
                            />
                            <span className="text-sm text-yellow-700">buổi (Hệ thống sẽ tự tạo dữ liệu điểm danh)</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ghi chú khác</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:border-primary outline-none"
                placeholder="Ghi chú thêm..."
                value={manualForm.note || ''}
                onChange={e => setManualForm({...manualForm, note: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Plus size={18} /> Thêm vào danh sách tháng {currentMonth}
          </button>
        </form>
      )}

      {mode === 'excel' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 animate-fade-in">
              <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                      <FileSpreadsheet size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Nhập từ Excel (Tháng {currentMonth})</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                      Tải lên file Excel (.xlsx) chứa danh sách học sinh. 
                      Hệ thống sẽ tự động gán tháng <b>{currentMonth}</b> cho dữ liệu nhập vào.
                  </p>
                  {isPast && (
                      <p className="text-yellow-600 text-sm mt-2 font-medium bg-yellow-50 p-2 rounded inline-block">
                          Lưu ý: Vì là tháng cũ, hãy thêm cột "Số buổi" trong Excel nếu muốn chính xác. Nếu không có sẽ mặc định là 8 buổi.
                      </p>
                  )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Step 1: Download Template */}
                  <div className="border border-gray-200 rounded-lg p-5 hover:border-green-500 transition cursor-pointer group" onClick={downloadSampleExcel}>
                      <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 group-hover:text-green-600 transition">
                              <Download size={20} />
                          </div>
                          <span className="font-semibold text-gray-700">Bước 1: Tải file mẫu mới</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                          File mẫu với các cột: Họ tên, Lớp, <b>Số buổi</b>, Học phí, Nội dung điều chỉnh, Số tiền điều chỉnh.
                      </p>
                      <button className="text-sm font-medium text-green-600 hover:text-green-700 underline">
                          Tải xuống ngay (.xlsx)
                      </button>
                  </div>

                  {/* Step 2: Upload */}
                  <div className="border border-gray-200 rounded-lg p-5 hover:border-green-500 transition relative">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                              <FileUp size={20} />
                          </div>
                          <span className="font-semibold text-gray-700">Bước 2: Tải lên</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                          Chọn file Excel đã nhập dữ liệu để xử lý.
                      </p>
                      
                      <input 
                        type="file" 
                        accept=".xlsx, .xls"
                        onChange={processExcelFile}
                        ref={fileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessing}
                      />
                      
                      <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        {isProcessing ? 'Đang xử lý...' : 'Chọn file Excel'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
