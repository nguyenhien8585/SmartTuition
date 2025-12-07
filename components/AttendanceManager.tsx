
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { CalendarCheck, Check, X, ChevronDown, ChevronUp, AlertCircle, Calendar, Users, CheckSquare, Square, Filter } from 'lucide-react';

interface AttendanceManagerProps {
  students: Student[];
  onUpdateAttendance: (studentId: string, newHistory: string[]) => void;
  onBulkCheckIn: (studentIds: string[]) => void;
  calculateTotal: (s: Student) => number;
  fmtMoney: (n: number) => string;
  today: string; // Receive synchronized date from parent YYYY-MM-DD
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ 
    students, 
    onUpdateAttendance, 
    onBulkCheckIn,
    calculateTotal,
    fmtMoney,
    today
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  
  // Initialize selected month based on "today" prop (format M/YYYY to match data)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
      const d = new Date(today);
      return `${d.getMonth() + 1}/${d.getFullYear()}`;
  });

  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Bulk Modal State
  const [bulkModal, setBulkModal] = useState<{
      isOpen: boolean;
      candidates: Student[];
      excludedIds: string[];
  }>({
      isOpen: false,
      candidates: [],
      excludedIds: []
  });

  // Extract Unique Classes
  const uniqueClasses = useMemo(() => {
      return Array.from(new Set(students.map(s => String(s.className || 'Khác')))).sort();
  }, [students]);

  // Extract Unique Months (Sorted Newest First)
  const uniqueMonths = useMemo(() => {
      return Array.from(new Set(students.map(s => s.month || 'Không xác định')))
        .sort((a, b) => {
            if (a === 'Không xác định') return 1;
            if (b === 'Không xác định') return -1;
            const [m1, y1] = a.split('/').map(Number);
            const [m2, y2] = b.split('/').map(Number);
            // Sort by Year Desc, then Month Desc
            if (y1 !== y2) return y2 - y1;
            return m2 - m1;
        });
  }, [students]);

  // Filter Logic
  const filteredStudents = students.filter(s => {
    const matchClass = selectedClass === 'ALL' || String(s.className || 'Khác') === selectedClass;
    const matchMonth = selectedMonth === 'ALL' || (s.month || 'Không xác định') === selectedMonth;
    return matchClass && matchMonth;
  });

  const handleCheckIn = (student: Student) => {
    const history = student.attendanceHistory || [];
    if (history.includes(today)) return; // Already checked in
    
    const newHistory = [...history, today];
    onUpdateAttendance(student.id, newHistory);
  };

  const handleRemoveDate = (student: Student, dateToRemove: string) => {
     const history = student.attendanceHistory || [];
     const newHistory = history.filter(d => d !== dateToRemove);
     onUpdateAttendance(student.id, newHistory);
  };

  // 1. Open Modal with Candidates
  const handleBulkCheckInClick = () => {
      // Find students in current filter who are NOT checked in today
      const candidates = filteredStudents.filter(s => {
          const history = s.attendanceHistory || [];
          return !history.includes(today);
      });
      
      if (candidates.length === 0) {
          alert("Tất cả học sinh trong danh sách hiện tại đã được điểm danh hôm nay rồi!");
          return;
      }

      setBulkModal({
          isOpen: true,
          candidates: candidates,
          excludedIds: [] // Default: Include everyone
      });
  }

  // 2. Toggle Exclusion in Modal
  const toggleBulkExclusion = (id: string) => {
      setBulkModal(prev => {
          const isExcluded = prev.excludedIds.includes(id);
          return {
              ...prev,
              excludedIds: isExcluded 
                  ? prev.excludedIds.filter(eId => eId !== id) // Re-include
                  : [...prev.excludedIds, id] // Exclude
          };
      });
  };

  // 3. Confirm Action
  const confirmBulkCheckIn = () => {
      const finalIds = bulkModal.candidates
          .filter(s => !bulkModal.excludedIds.includes(s.id))
          .map(s => s.id);
      
      if (finalIds.length > 0) {
          onBulkCheckIn(finalIds);
      }
      setBulkModal({ isOpen: false, candidates: [], excludedIds: [] });
  };

  const toggleExpand = (id: string) => {
      setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarCheck className="text-indigo-600" />
                Điểm Danh
            </h2>
            <p className="text-sm text-gray-500">Quản lý lịch sử học và chu kỳ 8 buổi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            {/* Month Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                <Calendar size={16} className="text-gray-500"/>
                <span className="text-sm text-gray-500 font-medium">Tháng:</span>
                <select 
                    className="outline-none text-sm text-gray-700 bg-transparent font-bold cursor-pointer"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                    {uniqueMonths.length === 0 && <option value={selectedMonth}>{selectedMonth}</option>}
                </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                <Filter size={16} className="text-gray-500"/>
                <span className="text-sm text-gray-500 font-medium">Lớp:</span>
                <select 
                    className="outline-none text-sm text-gray-700 bg-transparent min-w-[100px] cursor-pointer"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="ALL">Tất cả lớp</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            
            <button 
                onClick={handleBulkCheckInClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition ml-auto md:ml-0"
            >
                <Users size={16} />
                Điểm danh tất cả
            </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
              <p className="text-sm text-indigo-600 font-medium">Hôm nay ({new Date(today).toLocaleDateString('vi-VN')})</p>
              <p className="text-2xl font-bold text-indigo-800">
                  {filteredStudents.filter(s => (s.attendanceHistory || []).includes(today)).length} / {filteredStudents.length}
              </p>
              <p className="text-xs text-indigo-400">Đã điểm danh (Tháng {selectedMonth})</p>
          </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Học Sinh</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm text-center">Tài chính</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm text-center">Tiến độ (Chu kỳ 8)</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm text-center">Hôm nay</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm text-center">Chi tiết</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map(student => {
                        const history = student.attendanceHistory || [];
                        const totalSessions = history.length;
                        const cycleCount = totalSessions === 0 ? 0 : ((totalSessions - 1) % 8) + 1;
                        const isFull = cycleCount === 8;
                        const isCheckedToday = history.includes(today);
                        
                        const total = calculateTotal(student);
                        
                        return (
                            <React.Fragment key={student.id}>
                                <tr className={`hover:bg-gray-50 transition-colors ${isFull ? 'bg-yellow-50 hover:bg-yellow-100' : ''}`}>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{student.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 rounded">{student.className}</span>
                                            {/* Show month badge only if viewing ALL */}
                                            {selectedMonth === 'ALL' && (
                                                <span className="text-[10px] text-blue-500 border border-blue-200 px-1 rounded">{student.month}</span>
                                            )}
                                        </div>
                                        {isFull && (
                                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                                                <AlertCircle size={10} /> Đủ 8 buổi - Cần đóng tiền
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right min-w-[150px]">
                                        <div className="flex flex-col items-end gap-1">
                                            {/* Financial Breakdown */}
                                            <div className="text-xs text-gray-400 flex justify-between w-full">
                                                <span>Học phí:</span>
                                                <span>{fmtMoney(student.baseFee)}</span>
                                            </div>
                                            {student.adjustmentAmount !== 0 && (
                                                 <div className={`text-xs flex justify-between w-full ${student.adjustmentAmount! < 0 ? 'text-green-600' : 'text-orange-500'}`}>
                                                    <span>{student.adjustmentAmount! < 0 ? 'Giảm trừ:' : 'Phụ thu:'}</span>
                                                    <span>{fmtMoney(Math.abs(student.adjustmentAmount!))}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-100 w-full my-0.5"></div>
                                            <div className="text-sm font-bold text-indigo-700 flex justify-between w-full">
                                                <span>Tổng:</span>
                                                <span>{fmtMoney(total)}</span>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${student.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                                {student.isPaid ? 'Đã thu' : 'Chưa thu'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <span className={`text-xl font-bold ${isFull ? 'text-green-600' : 'text-gray-700'}`}>
                                                    {cycleCount}
                                                </span>
                                                <span className="text-gray-400 text-sm">/ 8</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${(cycleCount / 8) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] text-gray-400">Tổng: {totalSessions} buổi</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => isCheckedToday ? handleRemoveDate(student, today) : handleCheckIn(student)}
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm
                                                ${isCheckedToday 
                                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                                    : 'bg-white border border-gray-300 text-gray-300 hover:border-indigo-500 hover:text-indigo-500'}
                                            `}
                                            title={isCheckedToday ? "Hủy điểm danh hôm nay" : "Điểm danh hôm nay"}
                                        >
                                            <Check size={20} strokeWidth={3} />
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => toggleExpand(student.id)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 transition"
                                        >
                                            {expandedStudentId === student.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </td>
                                </tr>
                                {/* Expanded History View */}
                                {expandedStudentId === student.id && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={5} className="p-4">
                                            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-2xl mx-auto shadow-inner">
                                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Calendar size={16} /> Lịch sử điểm danh (Tháng {student.month})
                                                </h4>
                                                
                                                {history.length === 0 ? (
                                                    <p className="text-sm text-gray-400 italic">Chưa có dữ liệu điểm danh.</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* Sort history recent first */}
                                                        {[...history].sort().reverse().map((date, idx) => {
                                                            const d = new Date(date);
                                                            const isToday = date === today;
                                                            return (
                                                                <div 
                                                                    key={idx} 
                                                                    className={`
                                                                        flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm
                                                                        ${isToday ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'}
                                                                    `}
                                                                >
                                                                    <span className="font-mono">
                                                                        {d.getDate().toString().padStart(2,'0')}/{ (d.getMonth()+1).toString().padStart(2,'0') }/{d.getFullYear()}
                                                                    </span>
                                                                    <button 
                                                                        onClick={() => handleRemoveDate(student, date)}
                                                                        className="text-gray-400 hover:text-red-500 transition"
                                                                        title="Xóa buổi này"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {filteredStudents.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">
                                Không có học sinh trong tháng <b>{selectedMonth}</b> {selectedClass !== 'ALL' ? `lớp ${selectedClass}` : ''}.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>

      {/* Bulk Check-in Modal */}
      {bulkModal.isOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Users className="text-indigo-600" size={20} />
                            Điểm danh hàng loạt
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Ngày: {new Date(today).toLocaleDateString('vi-VN')} | Tháng: {selectedMonth}
                        </p>
                    </div>
                    <button onClick={() => setBulkModal({...bulkModal, isOpen: false})} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-2 bg-yellow-50 text-yellow-800 text-xs px-5 border-b border-yellow-100">
                    Bỏ chọn những em <b>Vắng mặt</b> hôm nay:
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {bulkModal.candidates.map(student => {
                        const isIncluded = !bulkModal.excludedIds.includes(student.id);
                        return (
                            <div 
                                key={student.id} 
                                onClick={() => toggleBulkExclusion(student.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border mb-2 transition-colors
                                    ${isIncluded ? 'bg-white border-indigo-200 hover:bg-indigo-50' : 'bg-gray-100 border-gray-200 opacity-60'}
                                `}
                            >
                                <div className={isIncluded ? 'text-indigo-600' : 'text-gray-400'}>
                                    {isIncluded ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${isIncluded ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {student.name}
                                    </p>
                                    <p className="text-xs text-gray-400">{student.className}</p>
                                </div>
                                {isIncluded && <span className="text-xs font-bold text-green-600">Sẽ điểm danh</span>}
                                {!isIncluded && <span className="text-xs font-bold text-gray-400">Vắng</span>}
                            </div>
                        )
                    })}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button 
                        onClick={() => setBulkModal({...bulkModal, isOpen: false})}
                        className="flex-1 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={confirmBulkCheckIn}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm flex justify-center items-center gap-2"
                        disabled={bulkModal.candidates.length === bulkModal.excludedIds.length}
                    >
                        <Check size={18} />
                        Xác nhận ({bulkModal.candidates.length - bulkModal.excludedIds.length})
                    </button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};
