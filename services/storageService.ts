
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
            if (getRes.ok) {
                const json = await getRes.json();
                sha = json.sha;
            }
        } catch (e) {
            // File might not exist yet, ignore
        }

        // 2. Prepare content
        const backupData = JSON.parse(generateBackupData()); // Parse back to obj to prettify
        const jsonStr = JSON.stringify(backupData, null, 2);
        
        // Unicode safe Base64 encoding
        const content = btoa(unescape(encodeURIComponent(jsonStr)));
        
        // 3. PUT
        const body: any = {
            message: `SmartTuition Auto Backup: ${new Date().toLocaleString('vi-VN')}`,
            content: content
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!putRes.ok) {
            const err = await putRes.json();
            throw new Error(err.message || 'Failed to save to GitHub');
        }
        
        return true;
    } catch (error) {
        console.error("GitHub Save Error:", error);
        alert(`Lỗi lưu lên GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
};

export const loadFromGitHub = async (config: GithubConfig): Promise<boolean> => {
    try {
         const { token, owner, repo, path } = config;
         const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
         
         const res = await fetch(url, {
            headers: { 
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        if (!res.ok) throw new Error("File not found on GitHub or unauthorized access");
        
        const json = await res.json();
        
        // Unicode safe Base64 decoding
        const content = decodeURIComponent(escape(atob(json.content)));
        
        return restoreFromBackup(content);
    } catch (error) {
        console.error("GitHub Load Error:", error);
        alert(`Lỗi tải từ GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
};
