
import React, { useState, useEffect, useRef } from 'react';
import { BankConfig, UserProfile, GithubConfig } from '../types';
import { VIETQR_BANKS, DEFAULT_BANK_CONFIG } from '../constants';
import { CreditCard, Save, User, Users, Plus, Trash2, Check, Database, Download, Upload, RefreshCw, Github, Key, FolderGit2, AlertTriangle, Cloud, CheckCircle, CalendarDays } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateBackupData, restoreFromBackup, getGithubConfig, saveGithubConfig, saveToGitHub, loadFromGitHub } from '../services/storageService';

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

  // Backup State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub Sync State
  const [ghConfig, setGhConfig] = useState<GithubConfig>({
      token: '',
      owner: '',
      repo: '',
      path: 'data/tuition_backup.json'
  });
  const [isGhLoading, setIsGhLoading] = useState(false);
  const [ghTestStatus, setGhTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

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

    // Load Github Config
    const savedGh = getGithubConfig();
    if (savedGh) setGhConfig(savedGh);

    // Load last sync time
    const lastSync = localStorage.getItem('smarttuition_last_sync');
    if (lastSync) setLastSyncTime(lastSync);
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

  // --- BACKUP & RESTORE HANDLERS ---
  const handleBackup = () => {
      const data = generateBackupData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `SmartTuition_Backup_${date}.json`;
      link.click();
      URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
      if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!confirm("CẢNH BÁO: Việc khôi phục sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại trên máy này.\nBạn có chắc chắn muốn tiếp tục không?")) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
              const success = restoreFromBackup(content);
              if (success) {
                  alert("Khôi phục dữ liệu thành công! Trang sẽ tự tải lại.");
                  window.location.reload();
              } else {
                  alert("Lỗi: File dữ liệu không hợp lệ.");
              }
          }
      };
      reader.readAsText(file);
  };

  // --- GITHUB SYNC HANDLERS ---
  const handleGhTestConnection = async () => {
      if (!ghConfig.token || !ghConfig.owner || !ghConfig.repo) {
          alert("Vui lòng nhập đầy đủ Token, Owner và Repository name");
          return;
      }
      
      setGhTestStatus('testing');
      
      try {
          // Test API connection
          const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}`;
          const res = await fetch(url, {
              headers: {
                  Authorization: `Bearer ${ghConfig.token}`,
                  Accept: "application/vnd.github.v3+json"
              }
          });
          
          if (res.ok) {
              const data = await res.json();
              setGhTestStatus('success');
              alert(`✅ Kết nối thành công!\n\nRepository: ${data.full_name}\nPrivate: ${data.private ? 'Có' : 'Không'}\nMô tả: ${data.description || 'Không có'}`);
              saveGithubConfig(ghConfig); // Save after successful test
          } else if (res.status === 404) {
              setGhTestStatus('error');
              alert(`❌ Không tìm thấy repository "${ghConfig.owner}/${ghConfig.repo}".\n\nVui lòng kiểm tra:\n• Tên repository đúng chưa (phân biệt hoa thường)\n• Username đúng chưa\n• Repository có tồn tại không`);
          } else if (res.status === 401) {
              setGhTestStatus('error');
              alert("❌ Token không hợp lệ hoặc đã hết hạn.\n\nVui lòng tạo token mới.");
          } else {
              setGhTestStatus('error');
              alert(`❌ Lỗi ${res.status}: ${res.statusText}`);
          }
      } catch (error) {
          setGhTestStatus('error');
          alert(`❌ Lỗi kết nối:\n\n${error instanceof Error ? error.message : 'Unknown'}\n\nKiểm tra kết nối internet của bạn.`);
      }
  };

  const handleGhSave = async () => {
      if (!ghConfig.token || !ghConfig.owner || !ghConfig.repo) {
          alert("Vui lòng nhập đầy đủ Token, Owner và Repository name");
          return;
      }
      saveGithubConfig(ghConfig); // Save config first
      
      setIsGhLoading(true);
      const success = await saveToGitHub(ghConfig);
      setIsGhLoading(false);
      
      if (success) {
          const now = new Date().toLocaleString('vi-VN');
          setLastSyncTime(now);
          localStorage.setItem('smarttuition_last_sync', now);
          alert("✅ Đã lưu dữ liệu lên GitHub thành công!");
      }
  };

  const handleGhLoad = async () => {
      if (!ghConfig.token || !ghConfig.owner || !ghConfig.repo) {
          alert("Vui lòng nhập đầy đủ Token, Owner và Repository name");
          return;
      }
      saveGithubConfig(ghConfig);
      
      if (!confirm("⚠️ CẢNH BÁO: Tải từ GitHub sẽ GHI ĐÈ dữ liệu hiện tại của bạn.\n\nBạn có chắc chắn muốn tiếp tục không?")) return;

      setIsGhLoading(true);
      const success = await loadFromGitHub(ghConfig);
      setIsGhLoading(false);

      if (success) {
          alert("✅ Đã đồng bộ dữ liệu từ GitHub thành công!\n\nTrang sẽ tự động tải lại.");
          window.location.reload();
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-8">
      {/* 1. CONFIGURATION SECTION */}
      <div>
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
      
      {/* 2. GITHUB CLOUD SYNC */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-800 rounded-full text-white">
                <Github size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">Đồng bộ GitHub (Cloud)</h2>
                <p className="text-sm text-gray-500">
                    Lưu trữ dữ liệu an toàn trên kho chứa riêng tư (Private Repo) của bạn.
                </p>
            </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Key size={12}/> Personal Access Token (Classic)
                    </label>
                    <input 
                        type="password" 
                        value={ghConfig.token}
                        onChange={(e) => setGhConfig({...ghConfig, token: e.target.value})}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full p-2 border border-gray-300 rounded focus:border-gray-800 outline-none font-mono text-sm"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Yêu cầu quyền (scope) <b>repo</b>. Token được lưu trên trình duyệt của bạn.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <User size={12}/> GitHub Username
                        </label>
                        <input 
                            type="text" 
                            value={ghConfig.owner}
                            onChange={(e) => setGhConfig({...ghConfig, owner: e.target.value})}
                            placeholder="e.g. yourname"
                            className="w-full p-2 border border-gray-300 rounded focus:border-gray-800 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <FolderGit2 size={12}/> Repository Name
                        </label>
                        <input 
                            type="text" 
                            value={ghConfig.repo}
                            onChange={(e) => setGhConfig({...ghConfig, repo: e.target.value})}
                            placeholder="e.g. tuition-app"
                            className="w-full p-2 border border-gray-300 rounded focus:border-gray-800 outline-none text-sm"
                        />
                    </div>
                </div>
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">File Path</label>
                     <input 
                        type="text" 
                        value={ghConfig.path}
                        onChange={(e) => setGhConfig({...ghConfig, path: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:border-gray-800 outline-none text-sm font-mono text-gray-600"
                    />
                </div>
            </div>

            <div className="space-y-3 mt-4">
                {/* Test Connection Button */}
                <button 
                    onClick={handleGhTestConnection}
                    disabled={ghTestStatus === 'testing'}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                        ghTestStatus === 'success' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                        ghTestStatus === 'error' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                        'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200'
                    }`}
                >
                    {ghTestStatus === 'testing' ? (
                        <>
                            <RefreshCw className="animate-spin" size={16}/>
                            Đang kiểm tra...
                        </>
                    ) : ghTestStatus === 'success' ? (
                        <>
                            <CheckCircle size={16}/>
                            Kết nối thành công!
                        </>
                    ) : ghTestStatus === 'error' ? (
                        <>
                            <AlertTriangle size={16}/>
                            Kết nối thất bại
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16}/>
                            Test kết nối
                        </>
                    )}
                </button>

                {/* Sync buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleGhLoad}
                        disabled={isGhLoading}
                        className="py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGhLoading ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16} />}
                        Tải về máy
                    </button>
                    <button 
                        onClick={handleGhSave}
                        disabled={isGhLoading}
                        className="py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-black flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGhLoading ? <RefreshCw className="animate-spin" size={16}/> : <Cloud size={16} />}
                        Lưu lên GitHub
                    </button>
                </div>

                {/* Last sync info */}
                {lastSyncTime && (
                    <div className="text-xs text-gray-500 text-center pt-1 flex items-center justify-center gap-1">
                        <CalendarDays size={12}/>
                        Lần backup cuối: {lastSyncTime}
                    </div>
                )}
            </div>
        </div>

        {/* Quick Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-1">
                💡 Hướng dẫn nhanh
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Tạo <strong>Private Repository</strong> trên GitHub</li>
                <li>Tạo <strong>Personal Access Token</strong> với scope <code className="bg-blue-100 px-1 rounded">repo</code></li>
                <li>Nhập thông tin ở trên</li>
                <li>Click <strong>"Test kết nối"</strong> để kiểm tra</li>
                <li>Dùng <strong>"Lưu lên GitHub"</strong> để backup</li>
            </ol>
            <a 
                href="https://github.com/settings/tokens/new?scopes=repo&description=SmartTuition%20App"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
            >
                <Key size={14}/> Tạo Token ngay →
            </a>
        </div>
      </div>

      {/* 3. DATA MANAGEMENT SECTION (Backup/Restore) */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-full text-green-700">
                <Database size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">Sao lưu & Khôi phục (File)</h2>
                <p className="text-sm text-gray-500">
                    Lưu file .JSON thủ công vào máy tính.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BACKUP */}
            <div className="p-5 border border-gray-200 rounded-xl hover:border-green-500 transition bg-gray-50">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Download size={18} className="text-green-600"/> Sao lưu (Backup)
                </h3>
                <button 
                    onClick={handleBackup}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition"
                >
                    Tải file .JSON
                </button>
            </div>

            {/* RESTORE */}
            <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-500 transition bg-gray-50">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Upload size={18} className="text-blue-600"/> Khôi phục (Restore)
                </h3>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={handleFileChange}
                />
                <button 
                    onClick={handleRestoreClick}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition flex justify-center items-center gap-2"
                >
                    <RefreshCw size={16} /> Chọn file phục hồi
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
