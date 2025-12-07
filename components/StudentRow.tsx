
import React from 'react';
import { Student } from '../types';
import { Trash, Edit3, Eye, MessageSquare, Send, CheckCircle, Wallet, DollarSign, Calendar } from 'lucide-react';

interface StudentRowProps {
  student: Student;
  calculateTotal: (s: Student) => number;
  fmtMoney: (n: number) => string;
  onTogglePaid: (id: string) => void;
  onToggleSent: (id: string) => void;
  // onDateChange & onMethodChange removed as they are no longer editable inline
  onToggleAttendance: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (student: Student) => void;
  onNote: (id: string, currentNote: string) => void;
  onDelete: (id: string) => void;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  calculateTotal,
  fmtMoney,
  onTogglePaid,
  onToggleSent,
  onView,
  onEdit,
  onNote,
  onDelete,
}) => {
  const total = calculateTotal(student);
  const paidAmount = student.paidAmount !== undefined ? student.paidAmount : (student.isPaid ? total : 0);
  const isPartial = student.isPaid && paidAmount < total;

  const safeClassName = String(student.className || '');
  const displayClass = safeClassName.toLowerCase().startsWith('lớp') ? safeClassName : `Lớp ${safeClassName}`;
  
  // Calculate attendance based on history
  const history = student.attendanceHistory || [];
  const totalSessions = history.length;
  // Cycle calculation: 1-8. If 8, it's 8/8. If 9, it's 1/8. 0 is 0/8.
  const cycleCount = totalSessions === 0 ? 0 : ((totalSessions - 1) % 8) + 1;
  const isFull = cycleCount === 8;
  const maxAttendance = 8;
  
  // Helper to stop propagation ensures clicks don't bubble up
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
        className={`bg-white p-3 sm:p-4 rounded-xl shadow-sm border transition flex flex-col lg:flex-row lg:items-center justify-between gap-3
            ${student.isPaid ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-blue-200'}`}
    >
        {/* Left Side: Info & Toggles */}
        <div className="flex items-start sm:items-center gap-3 w-full lg:w-auto">
            {/* CHECKBOX PAID */}
            <div 
                onClick={() => onTogglePaid(student.id)}
                className={`flex flex-col items-center gap-1 min-w-[40px] cursor-pointer group`}
                title={student.isPaid ? "Nhấn để hủy thu tiền" : "Nhấn để xác nhận thu tiền"}
            >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${student.isPaid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 group-hover:border-green-400'}`}>
                    {student.isPaid && <CheckCircle size={16} />}
                </div>
                <span className={`text-[9px] font-bold uppercase ${student.isPaid ? 'text-green-600' : 'text-gray-400'}`}>
                    {student.isPaid ? 'Đã thu' : 'Thu tiền'}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-gray-800 text-base ${student.isPaid ? 'text-green-700' : ''}`}>
                        {student.name}
                    </h3>
                    <button
                        onClick={(e) => handleAction(e, () => onEdit(student))}
                        className="text-gray-400 hover:text-blue-600 transition p-1"
                        title="Sửa thông tin"
                        type="button"
                    >
                        <Edit3 size={14} /> 
                    </button>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm text-gray-500">
                        {displayClass}
                    </p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 rounded">
                        {student.month || 'N/A'}
                    </span>
                </div>

                {/* ATTENDANCE DISPLAY (READ ONLY) */}
                <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-bold text-gray-400 uppercase">Tiến độ:</span>
                    <span className={`font-bold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                        {cycleCount}/{maxAttendance}
                    </span>
                    {isFull && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">Đủ 8 buổi</span>}
                </div>
                
                {/* Note Display */}
                {student.note && (
                    <div className="mt-1">
                        <span className="text-[11px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 italic inline-block">
                            {student.note}
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* Right Side: Payment Details & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 lg:gap-6 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-dashed border-gray-200">
            
            {/* PAYMENT DETAILS (Only visible when PAID) - READ ONLY */}
            <div className={`transition-all duration-300 ${student.isPaid ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 {student.isPaid && (
                     <div className="flex flex-row sm:flex-col items-end gap-1">
                         <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Calendar size={12} className="text-gray-400"/>
                            {student.paidDate ? new Date(student.paidDate).toLocaleDateString('vi-VN') : '--/--/----'}
                         </div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border uppercase
                            ${student.paymentMethod === 'CASH' 
                                ? 'bg-orange-50 text-orange-600 border-orange-100' 
                                : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                         >
                            {student.paymentMethod === 'CASH' ? <DollarSign size={10} /> : <Wallet size={10} />}
                            {student.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                         </div>
                     </div>
                 )}
            </div>

            {/* Money & Total */}
            <div className="flex items-center justify-between sm:block min-w-[100px] text-right">
                <div className="sm:hidden text-sm text-gray-500 font-medium">Tổng thu:</div>
                <div>
                    {student.isPaid && isPartial ? (
                        <>
                            <div className="text-lg font-bold text-orange-600">
                                {fmtMoney(paidAmount)}
                            </div>
                            <div className="text-xs text-red-500 font-medium">
                                Thiếu: {fmtMoney(total - paidAmount)}
                            </div>
                        </>
                    ) : (
                        <div className={`text-lg font-bold ${student.isPaid ? 'text-green-600' : 'text-primary'}`}>
                            {fmtMoney(total)}
                        </div>
                    )}

                    {!student.isPaid && student.adjustmentAmount !== 0 && (
                        <div className={`text-xs ${student.adjustmentAmount! < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                            {student.adjustmentAmount! > 0 ? '+' : ''}{fmtMoney(student.adjustmentAmount!)}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center justify-end gap-1 pl-2 border-l border-gray-200">
                 {/* BUTTON SENT */}
                <button 
                    onClick={(e) => handleAction(e, () => onToggleSent(student.id))}
                    className={`p-2 rounded-lg transition border ${student.isSent ? 'bg-blue-50 text-blue-600 border-blue-100' : 'text-gray-300 border-transparent hover:bg-gray-50'}`}
                    title="Đánh dấu đã gửi phiếu"
                    type="button"
                >
                    <Send size={18} className={student.isSent ? 'fill-current' : ''} />
                </button>

                {/* VIEW BUTTON */}
                <button
                    onClick={(e) => handleAction(e, () => onView(student.id))}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Xem phiếu thu"
                    type="button"
                >
                    <Eye size={18} />
                </button>

                {/* NOTE BUTTON */}
                <button
                    onClick={(e) => handleAction(e, () => onNote(student.id, student.note))}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                    title="Ghi chú"
                    type="button"
                >
                    <MessageSquare size={18} />
                </button>

                {/* DELETE BUTTON */}
                <button
                    onClick={(e) => handleAction(e, () => onDelete(student.id))}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Xóa"
                    type="button"
                >
                    <Trash size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};
