
import React, { useState, useRef } from 'react';
import { Payment, Student } from '../types';
import { Plus, Search, Upload, Camera, CheckCircle, Clock } from 'lucide-react';
import { fileToGenerativePart, parsePaymentReceipt } from '../services/geminiService';

interface PaymentManagerProps {
  payments: Payment[];
  students: Student[];
  onAddPayment: (p: Omit<Payment, 'id'>) => void;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ payments, students, onAddPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'TRANSFER' as 'CASH' | 'TRANSFER',
    note: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const base64 = await fileToGenerativePart(file);
      const result = await parsePaymentReceipt(base64);
      
      if (result) {
        // Auto-fill logic
        let matchedStudentId = '';
        if (result.possibleName) {
            // Simple fuzzy match simulation
            const lowerName = result.possibleName.toLowerCase();
            const found = students.find(s => 
                lowerName.includes(s.name.toLowerCase()) || 
                (s.parentName && lowerName.includes(s.parentName.toLowerCase()))
            );
            if (found) matchedStudentId = found.id;
        }

        setFormData(prev => ({
          ...prev,
          amount: result.amount ? String(result.amount) : prev.amount,
          date: result.date || prev.date,
          studentId: matchedStudentId || prev.studentId,
          note: `Quét từ ảnh (Độ tin cậy: ${result.confidence || 'N/A'})`
        }));
      }
    } catch (err) {
      alert("Không thể phân tích ảnh. Vui lòng nhập thủ công.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
        alert("Vui lòng chọn học sinh");
        return;
    }
    onAddPayment({
      studentId: formData.studentId,
      amount: Number(formData.amount),
      date: formData.date,
      method: formData.method,
      note: formData.note,
      status: 'COMPLETED'
    });
    setIsModalOpen(false);
    // Reset form
    setFormData({
        studentId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'TRANSFER',
        note: ''
    });
  };

  // Sort payments by date desc
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Lịch Sử Thu Chi</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Ghi Nhận Thu Tiền
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Ngày</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Học Sinh</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Số Tiền</th>
                <th className="p-4 font-semibold text-slate-600 text-sm hidden sm:table-cell">Hình Thức</th>
                <th className="p-4 font-semibold text-slate-600 text-sm hidden md:table-cell">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {sortedPayments.map(p => {
                    const student = students.find(s => s.id === p.studentId);
                    return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-600">{new Date(p.date).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4 font-medium text-slate-800">{student?.name || 'Không xác định'}</td>
                            <td className="p-4 font-bold text-emerald-600">+{p.amount.toLocaleString('vi-VN')} đ</td>
                            <td className="p-4 hidden sm:table-cell">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${p.method === 'TRANSFER' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {p.method === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                                </span>
                            </td>
                            <td className="p-4 hidden md:table-cell text-slate-500 text-sm max-w-xs truncate">{p.note || '-'}</td>
                        </tr>
                    );
                })}
                 {sortedPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Chưa có giao dịch nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add Payment Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl relative overflow-hidden">
            {uploadLoading && (
                <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-600 font-medium">Đang quét biên lai bằng AI...</p>
                </div>
            )}

            <h3 className="text-xl font-bold text-slate-800 mb-6">Ghi Nhận Đóng Tiền</h3>
            
            {/* AI Scan Button */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="mb-6 border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors group"
            >
                <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="text-indigo-600" size={24} />
                </div>
                <p className="text-sm font-medium text-indigo-700">Tự động điền từ ảnh biên lai</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Học sinh</label>
                <select 
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={formData.studentId}
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                >
                    <option value="">Chọn học sinh...</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.className}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền</label>
                  <input required type="number" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thu</label>
                    <input required type="date" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="method" value="TRANSFER" checked={formData.method === 'TRANSFER'} onChange={() => setFormData({...formData, method: 'TRANSFER'})} className="accent-indigo-600" />
                        <span>Chuyển khoản</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="method" value="CASH" checked={formData.method === 'CASH'} onChange={() => setFormData({...formData, method: 'CASH'})} className="accent-indigo-600" />
                        <span>Tiền mặt</span>
                    </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">Hủy</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors">
                    Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
