import React, { useState, useEffect } from 'react';
import { BankConfig, UserProfile } from '../types';
import { VIETQR_BANKS, DEFAULT_BANK_CONFIG } from '../constants';
import { CreditCard, Save, User, Users, Plus, Trash2, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SettingsFormProps {
  config: BankConfig;
  onSave: (config: BankConfig) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<BankConfig>(config);
  const [isManual, setIsManual] = useState(false);
  
  // Profile Management State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // Load profiles from local storage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('tuition_profiles');
    if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed);
        if (parsed.length > 0) {
             // Try to find if current config matches a profile, otherwise default to first
             const match = parsed.find((p: UserProfile) => 
                 p.config.accountNo === config.accountNo && p.config.teacherName === config.teacherName
             );
             if (match) {
                 setCurrentProfileId(match.id);
                 setFormData(match.config);
             } else {
                 // Or just creating a temporary state based on passed prop
                 setFormData(config);
             }
        }
    } else {
        // Init with default if nothing exists
        const defaultProfile: UserProfile = {
            id: uuidv4(),
            name: 'Mặc định',
            config: config
        };
        setProfiles([defaultProfile]);
        setCurrentProfileId(defaultProfile.id);
        localStorage.setItem('tuition_profiles', JSON.stringify([defaultProfile]));
    }
  }, []);

  // Sync isManual check
  useEffect(() => {
    const inList = VIETQR_BANKS.some(b => b.id === formData.bankId);
    setIsManual(!inList);
  }, [formData.bankId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'bankId' && !isManual) {
        const selectedBank = VIETQR_BANKS.find(b => b.id === value);
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            bankName: selectedBank ? selectedBank.name : prev.bankName 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleManualToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsManual(checked);
      if (!checked && !VIETQR_BANKS.find(b => b.id === formData.bankId)) {
         setFormData(prev => ({
             ...prev,
             bankId: VIETQR_BANKS[0].id,
             bankName: VIETQR_BANKS[0].name
         }));
      }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const profileId = e.target.value;
      if (profileId === 'new') {
          setIsCreatingNew(true);
          setNewProfileName('');
          setFormData(DEFAULT_BANK_CONFIG);
          setCurrentProfileId('');
          return;
      }

      setIsCreatingNew(false);
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
          setCurrentProfileId(profile.id);
          setFormData(profile.config);
          onSave(profile.config); // Auto apply when switching
      }
  };

  const handleCreateProfile = () => {
      if (!newProfileName.trim()) {
          alert("Vui lòng nhập tên hồ sơ");
          return;
      }
      const newProfile: UserProfile = {
          id: uuidv4(),
          name: newProfileName,
          config: formData
      };
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      localStorage.setItem('tuition_profiles', JSON.stringify(updatedProfiles));
      
      setCurrentProfileId(newProfile.id);
      setIsCreatingNew(false);
      onSave(formData);
      alert(`Đã tạo hồ sơ "${newProfileName}"`);
  };

  const handleDeleteProfile = () => {
      if (profiles.length <= 1) {
          alert("Phải giữ lại ít nhất 1 hồ sơ.");
          return;
      }
      if (confirm("Bạn có chắc chắn xóa hồ sơ này?")) {
          const updatedProfiles = profiles.filter(p => p.id !== currentProfileId);
          setProfiles(updatedProfiles);
          localStorage.setItem('tuition_profiles', JSON.stringify(updatedProfiles));
          
          // Switch to first available
          setCurrentProfileId(updatedProfiles[0].id);
          setFormData(updatedProfiles[0].config);
          onSave(updatedProfiles[0].config);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to current profile
    if (currentProfileId) {
        const updatedProfiles = profiles.map(p => 
            p.id === currentProfileId ? { ...p, config: formData } : p
        );
        setProfiles(updatedProfiles);
        localStorage.setItem('tuition_profiles', JSON.stringify(updatedProfiles));
        onSave(formData);
        alert("Đã lưu cấu hình thành công!");
    } else if (isCreatingNew) {
        handleCreateProfile();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cấu hình Hệ thống</h2>
          <p className="text-sm text-gray-500">Quản lý nhiều giáo viên và tài khoản ngân hàng</p>
        </div>
      </div>

      {/* Profile Switcher */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                <Users size={16} /> Hồ sơ đang chọn
            </h3>
            {currentProfileId && (
                <button 
                    type="button" 
                    onClick={handleDeleteProfile}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                >
                    <Trash2 size={12}/> Xóa hồ sơ này
                </button>
            )}
          </div>
          
          {!isCreatingNew ? (
              <div className="flex gap-2">
                  <select 
                    value={currentProfileId}
                    onChange={handleProfileChange}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                      {profiles.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.config.teacherName}</option>
                      ))}
                      <option value="new">+ Thêm hồ sơ mới...</option>
                  </select>
              </div>
          ) : (
              <div className="flex gap-2 items-end animate-fade-in">
                  <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Tên hồ sơ mới (Ví dụ: Thầy A)</label>
                      <input 
                        type="text" 
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Nhập tên gợi nhớ..."
                        autoFocus
                      />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                      Hủy
                  </button>
              </div>
          )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Teacher Info */}
        <div className="border-b border-gray-100 pb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User size={18} className="text-gray-500"/>
                Thông tin Giáo viên
            </h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị trong tin nhắn</label>
                <input
                    type="text"
                    name="teacherName"
                    value={formData.teacherName || ''}
                    onChange={handleChange}
                    placeholder="Ví dụ: Cô Lan"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>
        </div>

        {/* Bank Config */}
        <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500"/>
                Tài khoản nhận tiền
            </h3>
            
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="manualMode"
                            checked={isManual}
                            onChange={handleManualToggle}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <label htmlFor="manualMode" className="text-xs text-gray-500 select-none cursor-pointer">
                            Nhập mã PIN/BIN thủ công
                        </label>
                    </div>
                </div>
                
                {!isManual ? (
                    <select
                        name="bankId"
                        value={formData.bankId}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        {VIETQR_BANKS.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                            {bank.code} - {bank.name}
                        </option>
                        ))}
                    </select>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Mã PIN (BIN)</label>
                            <input
                                type="text"
                                name="bankId"
                                value={formData.bankId}
                                onChange={handleChange}
                                placeholder="9704xx"
                                className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Tên hiển thị</label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName || ''}
                                onChange={handleChange}
                                placeholder="Tên ngân hàng..."
                                className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
            <input
                type="text"
                name="accountNo"
                value={formData.accountNo}
                onChange={handleChange}
                placeholder="Ví dụ: 101010xxxx"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
            />
            </div>

            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản (Viết hoa không dấu)</label>
            <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="NGUYEN VAN A"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary uppercase"
                required
            />
            </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Save size={18} />
            {isCreatingNew ? 'Tạo hồ sơ mới' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SettingsIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);