
import React from 'react';
import { Student, Payment } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle, DollarSign } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  payments: Payment[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; subtext?: string }> = ({ title, value, icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} text-white`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ students, payments }) => {
  // Calculate Stats
  const totalStudents = students.length;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = students.reduce((sum, s) => (s.balance < 0 ? sum + Math.abs(s.balance) : sum), 0);
  const studentsInDebt = students.filter(s => s.balance < 0).length;

  // Prepare Chart Data (Revenue by Month)
  const revenueByMonth = React.useMemo(() => {
    const data: Record<string, number> = {};
    payments.forEach(p => {
      const date = new Date(p.date);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      data[key] = (data[key] || 0) + p.amount;
    });
    return Object.keys(data).map(key => ({
      name: key,
      amount: data[key]
    })).slice(-6); // Last 6 months
  }, [payments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Tổng Quan</h2>
        <span className="text-sm text-slate-500">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value={`${totalRevenue.toLocaleString('vi-VN')} đ`} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Học Phí Chưa Thu" 
          value={`${totalDebt.toLocaleString('vi-VN')} đ`} 
          icon={<AlertCircle size={24} />} 
          color="bg-rose-500" 
          subtext={`${studentsInDebt} học sinh đang nợ`}
        />
        <StatCard 
          title="Tổng Học Sinh" 
          value={totalStudents.toString()} 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Giao Dịch" 
          value={payments.length.toString()} 
          icon={<DollarSign size={24} />} 
          color="bg-indigo-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu Đồ Doanh Thu</h3>
          <div className="h-80 w-full">
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => [`${value.toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {revenueByMonth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#6366f1" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Debtors List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Danh Sách Nợ Phí</h3>
          <div className="space-y-4 overflow-y-auto max-h-80">
            {students.filter(s => s.balance < 0).sort((a,b) => a.balance - b.balance).map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                <div>
                  <p className="font-semibold text-slate-800">{student.name}</p>
                  <p className="text-xs text-rose-600">{student.parentName || 'Chưa cập nhật PH'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-600">{Math.abs(student.balance).toLocaleString('vi-VN')} đ</p>
                  <p className="text-xs text-rose-500">Chưa đóng</p>
                </div>
              </div>
            ))}
            {students.filter(s => s.balance < 0).length === 0 && (
              <p className="text-center text-slate-400 py-8">Tuyệt vời! Không ai nợ học phí.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
