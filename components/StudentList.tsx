
import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Search, Edit2, Trash2, MessageCircle, MoreVertical, X } from 'lucide-react';
import { generatePaymentReminder } from '../services/geminiService';

interface StudentListProps {
  students: Student[];
  onAddStudent: (s: Omit<Student, 'id' | 'balance'>) => void;
  onEditStudent: (id: string, s: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent, onEditStudent, onDeleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reminderModal, setReminderModal] = useState<{ isOpen: boolean; student?: Student; content: string; loading: boolean }>({
    isOpen: false,
    content: '',
    loading: false
  });
  
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    phone: '',
    className: '',
    baseFee: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      name: formData.name,
      parentName: formData.parentName,
      phone: formData.phone,
      className: formData.className,
      baseFee: Number(formData.baseFee),
      note: ''
    });
    setIsModalOpen(false);
    setFormData({ name: '', parentName: '', phone: '', className: '', baseFee: '' });
  };

  const handleCreateReminder = async (student: Student) => {
    setReminderModal({ isOpen: true, student, content: '', loading: true });
    const content = await generatePaymentReminder(student, 15); // Assume 15 days late for demo logic
    setReminderModal(prev => ({ ...prev, content, loading: false }));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Danh Sách Học Sinh</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Thêm Học Sinh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên học sinh hoặc phụ huynh..." 
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Học Sinh</th>
                <th className="p-4 font-semibold text-slate-600 text-sm hidden md:table-cell">Lớp</th>
                <th className="p-4 font-semibold text-slate-600 text-sm hidden md:table-cell">Phụ Huynh</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Số Dư / Nợ</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-500 md:hidden">{student.className}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-600">{student.className}</td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-slate-700">{student.parentName || '-'}</p>
                    <p className="text-xs text-slate-400">{student.phone || '-'}</p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-bold px-2 py-1 rounded-lg text-sm ${student.balance < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {(student.balance || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {student.balance < 0 && (
                        <button 
                          onClick={() => handleCreateReminder(student)}
                          title="Nhắc nợ AI"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <MessageCircle size={18} />
                        </button>
                      )}
                      <button 
                         onClick={() => onDeleteStudent(student.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Không tìm thấy học sinh nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Thêm Học Sinh Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên học sinh</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                  <input required type="text" placeholder="VD: Toán 9" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Học phí (tháng/buổi)</label>
                  <input required type="number" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.baseFee} onChange={e => setFormData({...formData, baseFee: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên phụ huynh</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input required type="tel" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold mt-2 transition-colors">
                Lưu Thông Tin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Reminder Modal */}
      {reminderModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle size={24} className="text-indigo-600" />
                Trợ Lý AI Nhắc Nợ
              </h3>
              <button onClick={() => setReminderModal({...reminderModal, isOpen: false})} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {reminderModal.loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                 <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <p>AI đang soạn tin nhắn...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Gửi đến: {reminderModal.student?.parentName} ({reminderModal.student?.phone})</p>
                  <textarea 
                    className="w-full bg-white p-3 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none"
                    value={reminderModal.content}
                    onChange={(e) => setReminderModal({...reminderModal, content: e.target.value})}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigator.clipboard.writeText(reminderModal.content)}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Sao Chép
                  </button>
                  <a 
                    href={`https://zalo.me/${reminderModal.student?.phone}`} // Simple Zalo link attempt, usually needs API, simplified here
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-center transition-colors"
                  >
                    Mở Zalo
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
