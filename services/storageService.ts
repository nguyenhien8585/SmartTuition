
import { Student, Payment, BankConfig, UserProfile, GithubConfig } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'tutorfee_students',
  PAYMENTS: 'tutorfee_payments',
  BANK_CONFIG: 'tuition_bank_config',
  PROFILES: 'tuition_profiles',
  AUTH: 'smarttuition_auth',
  GITHUB_CONFIG: 'smarttuition_gh_config'
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

// --- BACKUP & RESTORE SYSTEM ---

export interface BackupData {
    version: number;
    timestamp: string;
    students: Student[];
    payments: Payment[];
    bankConfig: BankConfig | null;
    profiles: UserProfile[];
}

export const generateBackupData = (): string => {
    const students = getStudents();
    const payments = getPayments();
    const bankConfigStr = localStorage.getItem(STORAGE_KEYS.BANK_CONFIG);
    const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);

    const backup: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        students: students,
        payments: payments,
        bankConfig: bankConfigStr ? JSON.parse(bankConfigStr) : null,
        profiles: profilesStr ? JSON.parse(profilesStr) : []
    };

    return JSON.stringify(backup, null, 2);
};

export const restoreFromBackup = (jsonString: string): boolean => {
    try {
        const data: BackupData = JSON.parse(jsonString);
        
        // Basic validation
        if (!data.students || !Array.isArray(data.students)) {
            throw new Error("Invalid format: missing students data");
        }

        // Restore Data
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
        
        if (data.payments) {
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data.payments));
        }
        
        if (data.bankConfig) {
            localStorage.setItem(STORAGE_KEYS.BANK_CONFIG, JSON.stringify(data.bankConfig));
        }

        if (data.profiles) {
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data.profiles));
        }

        return true;
    } catch (error) {
        console.error("Restore failed:", error);
        return false;
    }
};

// --- GITHUB SYNC ---

export const getGithubConfig = (): GithubConfig | null => {
    const data = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
    return data ? JSON.parse(data) : null;
};

export const saveGithubConfig = (config: GithubConfig) => {
    localStorage.setItem(STORAGE_KEYS.GITHUB_CONFIG, JSON.stringify(config));
};

export const saveToGitHub = async (config: GithubConfig): Promise<boolean> => {
    try {
        const { token, owner, repo, path } = config;
        
        // Validate inputs
        if (!token || !owner || !repo || !path) {
            throw new Error('Thiếu thông tin cấu hình GitHub. Vui lòng kiểm tra lại Token, Owner, Repo và Path.');
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        
        // 1. Get current SHA (if file exists)
        let sha = '';
        try {
            const getRes = await fetch(url, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json"
                }
            });
            
            if (getRes.status === 404) {
                console.log('File does not exist yet, will create new file');
            } else if (getRes.ok) {
                const json = await getRes.json();
                sha = json.sha;
                console.log('File exists, will update with SHA:', sha);
            } else if (getRes.status === 401) {
                throw new Error('Token không hợp lệ hoặc đã hết hạn. Vui lòng tạo token mới.');
            } else if (getRes.status === 403) {
                throw new Error('Token không có quyền truy cập. Đảm bảo token có scope "repo".');
            } else {
                throw new Error(`Không thể kiểm tra file: ${getRes.status} ${getRes.statusText}`);
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('Token')) {
                throw e; // Re-throw authentication errors
            }
            // File might not exist yet, ignore other errors
            console.warn('Error checking existing file:', e);
        }

        // 2. Prepare content
        const backupData = JSON.parse(generateBackupData()); // Parse back to obj to prettify
        // Add metadata
        backupData.lastBackup = new Date().toISOString();
        backupData.appVersion = '1.0.0';
        
        const jsonStr = JSON.stringify(backupData, null, 2);
        
        // Unicode safe Base64 encoding
        const content = btoa(unescape(encodeURIComponent(jsonStr)));
        
        // 3. PUT
        const commitMessage = `SmartTuition Backup: ${new Date().toLocaleString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        
        const body: any = {
            message: commitMessage,
            content: content,
            committer: {
                name: "SmartTuition App",
                email: "app@smarttuition.local"
            }
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/vnd.github.v3+json"
            },
            body: JSON.stringify(body)
        });

        if (!putRes.ok) {
            const err = await putRes.json().catch(() => ({ message: putRes.statusText }));
            
            if (putRes.status === 401) {
                throw new Error('Token không hợp lệ. Vui lòng kiểm tra lại.');
            } else if (putRes.status === 404) {
                throw new Error(`Repository "${owner}/${repo}" không tồn tại hoặc là Private mà token không có quyền.`);
            } else if (putRes.status === 409) {
                throw new Error('Xung đột dữ liệu. Vui lòng thử lại.');
            }
            
            throw new Error(err.message || `Lỗi ${putRes.status}: ${putRes.statusText}`);
        }
        
        console.log('✅ Backup to GitHub successful');
        return true;
    } catch (error) {
        console.error("GitHub Save Error:", error);
        const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
        alert(`❌ Lỗi lưu lên GitHub:\n\n${errorMsg}\n\nVui lòng kiểm tra:\n• Kết nối internet\n• Token còn hạn\n• Repository name đúng\n• Token có quyền "repo"`);
        return false;
    }
};

export const loadFromGitHub = async (config: GithubConfig): Promise<boolean> => {
    try {
        const { token, owner, repo, path } = config;
        
        // Validate inputs
        if (!token || !owner || !repo || !path) {
            throw new Error('Thiếu thông tin cấu hình GitHub.');
        }
        
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        
        const res = await fetch(url, {
            headers: { 
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error(`Không tìm thấy file "${path}" trong repository "${owner}/${repo}".\n\nVui lòng lưu dữ liệu lên GitHub trước khi tải về.`);
            } else if (res.status === 401) {
                throw new Error('Token không hợp lệ hoặc đã hết hạn.');
            } else if (res.status === 403) {
                throw new Error('Token không có quyền truy cập repository này.');
            }
            throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        
        // Check if it's a file (not a directory)
        if (json.type !== 'file') {
            throw new Error(`"${path}" không phải là file. Vui lòng kiểm tra đường dẫn.`);
        }
        
        // Unicode safe Base64 decoding
        // Remove newlines from base64 content (GitHub adds them)
        const base64Content = json.content.replace(/\n/g, '');
        const content = decodeURIComponent(escape(atob(base64Content)));
        
        // Validate JSON before restoring
        try {
            const parsed = JSON.parse(content);
            if (!parsed.students || !Array.isArray(parsed.students)) {
                throw new Error('File không đúng định dạng SmartTuition');
            }
        } catch (e) {
            throw new Error('File dữ liệu không hợp lệ hoặc bị hỏng.');
        }
        
        const success = restoreFromBackup(content);
        if (!success) {
            throw new Error('Khôi phục dữ liệu thất bại');
        }
        
        console.log('✅ Restore from GitHub successful');
        return true;
    } catch (error) {
        console.error("GitHub Load Error:", error);
        const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
        alert(`❌ Lỗi tải từ GitHub:\n\n${errorMsg}\n\nVui lòng kiểm tra:\n• Kết nối internet\n• Repository và file path đúng\n• Đã backup lên GitHub chưa`);
        return false;
    }
};
