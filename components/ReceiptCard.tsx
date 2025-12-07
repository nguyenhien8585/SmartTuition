
import React, { useRef, useState, useEffect } from 'react';
import { Student, BankConfig } from '../types';
import { VIETQR_BANKS } from '../constants';
import html2canvas from 'html2canvas';
import { Download, Quote, Copy, Check, ArrowLeft, Loader2 } from 'lucide-react';

interface ReceiptCardProps {
  student: Student;
  bankConfig: BankConfig;
  month: string; // e.g., "10/2023"
  onBack?: () => void; // Optional back button for list view
}

// Utility to remove Vietnamese accents for banking compatibility
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ student, bankConfig, month, onBack }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // QR State
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Fallback calculation
  const adjustmentVal = student.adjustmentAmount !== undefined 
    ? student.adjustmentAmount 
    : -((student.absentDays || 0) * (student.deductionPerDay || 0)) + (student.previousDebt || 0) + (student.otherFee || 0);
  
  const totalAmount = (student.baseFee || 0) + adjustmentVal;

  // Format currency
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // Determine Bank Name Display
  const bankNameDisplay = bankConfig.bankName || VIETQR_BANKS.find(b => b.id === bankConfig.bankId)?.name || `NH ${bankConfig.bankId}`;
  
  // Fix class name display
  const safeClassName = String(student.className || '');
  const displayClassName = safeClassName.toLowerCase().trim().startsWith('lớp') 
    ? safeClassName 
    : `Lớp ${safeClassName}`;

  // Content for Transfer
  const safeName = removeAccents(student.name);
  const transferContent = `${safeName} chuyen khoan`;

  // Effect to load QR as Base64
  useEffect(() => {
    if (!bankConfig.accountNo) {
        setQrBase64(null);
        return;
    }

    const loadQr = async () => {
        setQrLoading(true);
        // Requirement: [Student Name unaccented] chuyen khoan
        
        const url = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template}.png?amount=${Math.floor(totalAmount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankConfig.accountName)}&t=${new Date().getTime()}`;
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    setQrBase64(dataURL);
                } catch (e) {
                    console.error("Canvas taint error:", e);
                    setQrBase64(null);
                }
            }
            setQrLoading(false);
        };

        img.onerror = () => {
            console.error("Error loading QR image");
            setQrLoading(false);
            setQrBase64(null);
        };
    };

    const timer = setTimeout(loadQr, 500);
    return () => clearTimeout(timer);

  }, [bankConfig, totalAmount, student.name, transferContent]);


  const captureImage = async () => {
      if (!cardRef.current) return null;
      
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      try {
          // Scroll to top to prevent cropping
          window.scrollTo(0, 0);
          
          const canvas = await html2canvas(cardRef.current, {
              scale: 3,
              useCORS: false,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              scrollX: 0, 
              scrollY: 0,
              x: 0,
              y: 0,
              width: cardRef.current.offsetWidth,
              height: cardRef.current.offsetHeight
          });
          
          window.scrollTo(scrollX, scrollY);
          return canvas;
      } catch (err) {
          console.error("Capture error:", err);
          window.scrollTo(scrollX, scrollY); 
          return null;
      }
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    setTimeout(async () => {
        const canvas = await captureImage();
        if (canvas) {
            const link = document.createElement('a');
            link.download = `PhieuThu_${student.name.replace(/\s+/g, '_')}_${month.replace('/', '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            alert("Không thể tạo ảnh. Vui lòng thử lại.");
        }
        setIsDownloading(false);
    }, 100);
  };

  const handleCopyImage = async () => {
      setIsCopying(true);
      setTimeout(async () => {
        const canvas = await captureImage();
        if (canvas) {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    alert("Lỗi tạo ảnh");
                    setIsCopying(false);
                    return;
                }
                try {
                    const item = new ClipboardItem({ "image/png": blob });
                    await navigator.clipboard.write([item]);
                    setTimeout(() => setIsCopying(false), 2000);
                } catch (err) {
                    console.error(err);
                    alert("Trình duyệt không hỗ trợ copy ảnh trực tiếp. Vui lòng dùng nút Tải Về.");
                    setIsCopying(false);
                }
            });
        } else {
            setIsCopying(false);
        }
      }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
        <div className="w-full max-w-[500px] flex justify-between items-center print:hidden">
             {onBack && (
                <button 
                    onClick={onBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={20} /> Quay lại
                </button>
            )}
            
            <div className="flex gap-2 ml-auto">
                <button 
                    onClick={handleCopyImage}
                    disabled={isCopying || qrLoading || !qrBase64}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition shadow-md ${isCopying ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isCopying ? <Check size={18} /> : <Copy size={18} />}
                    {isCopying ? 'Đã copy!' : 'Copy Ảnh'}
                </button>
                <button 
                    onClick={handleDownloadImage}
                    disabled={isDownloading || qrLoading || !qrBase64}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    Tải Về
                </button>
            </div>
        </div>

        <div 
            ref={cardRef} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-[500px] mx-auto print:shadow-none print:border-none print:w-full overflow-hidden relative"
        >
            <div className="w-full h-3 bg-gradient-to-r from-blue-600 to-blue-500"></div>

            <div className="p-6 pt-5 bg-white">
                {/* Header */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td align="center" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                 <h1 style={{ 
                                    fontSize: '24px', 
                                    fontWeight: '700', 
                                    color: '#1d4ed8', 
                                    textTransform: 'uppercase', 
                                    margin: '0 0 12px 0',
                                    lineHeight: '1.2',
                                    fontFamily: 'sans-serif'
                                }}>
                                    Phiếu Thu Học Phí
                                </h1>
                                <div style={{ 
                                    display: 'inline-block',
                                    padding: '1px 24px 15px 24px', 
                                    lineHeight: 'normal', 
                                    backgroundColor: '#eff6ff',
                                    border: '2px solid #dbeafe',
                                    borderRadius: '50px',
                                    color: '#1e40af',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    fontFamily: 'sans-serif'
                                }}>
                                    Tháng {month}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Greeting removed as requested */}

                <div className="border-b-2 border-dashed border-gray-200 pb-6 mb-6">
                    <div className="flex flex-col gap-1 mb-4">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Học sinh</span>
                        <span className="text-2xl font-bold text-gray-800 leading-tight">{student.name}</span>
                        <span className="text-base text-gray-500">{displayClassName}</span>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-base">
                                <span className="text-gray-600">Học phí cơ bản</span>
                                <span className="font-semibold text-gray-900">{fmt(student.baseFee)}</span>
                            </div>
                            
                            {adjustmentVal !== 0 && (
                                <div className="flex justify-between items-start text-base">
                                    <div className="flex flex-col">
                                        <span className={`${adjustmentVal < 0 ? 'text-red-500' : 'text-orange-600'} italic`}>
                                            {student.adjustmentContent || (adjustmentVal < 0 ? 'Điều chỉnh giảm' : 'Điều chỉnh tăng/nợ')}
                                        </span>
                                    </div>
                                    <span className={`font-semibold ${adjustmentVal < 0 ? 'text-red-500' : 'text-orange-600'}`}>
                                        {adjustmentVal > 0 ? '+' : ''}{fmt(adjustmentVal)}
                                    </span>
                                </div>
                            )}
                            
                            <div className="h-px bg-blue-200 my-2"></div>

                            <div className="flex justify-between items-end pt-1">
                                <span className="text-base font-bold text-blue-800 uppercase">Tổng thanh toán</span>
                                <span className="text-3xl font-black text-blue-700 leading-none">{fmt(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {student.note && (
                        <div className="mt-3 text-sm text-gray-500 italic pl-2 border-l-4 border-yellow-400">
                            * {student.note}
                        </div>
                    )}
                </div>

                <div className="text-center relative">
                    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 inline-block shadow-sm mb-4 relative" style={{ zIndex: 10 }}>
                        {bankConfig.accountNo ? (
                            <div className="flex justify-center items-center w-full h-full min-w-[192px] min-h-[192px]">
                                {qrLoading ? (
                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <Loader2 className="animate-spin" size={32} />
                                        <span className="text-xs">Đang tạo QR...</span>
                                    </div>
                                ) : qrBase64 ? (
                                    <img
                                        src={qrBase64}
                                        alt="QR Code"
                                        className="w-48 h-48 object-contain block"
                                    />
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center text-sm text-red-400 bg-red-50 rounded">
                                        Lỗi tải QR
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded">
                                Chưa có QR
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 mb-4 relative z-0">
                        <p className="font-bold text-gray-800 text-lg">{bankNameDisplay}</p>
                        <p className="text-gray-600 text-base">STK: <span className="font-mono font-bold text-black text-xl tracking-wide">{bankConfig.accountNo}</span></p>
                        <p className="text-gray-600 text-sm uppercase">{bankConfig.accountName}</p>
                    </div>

                    <div className="bg-red-50 text-red-600 py-3 px-4 rounded-lg inline-block relative z-0 w-full">
                        <p className="text-sm text-gray-500 mb-1">Nội dung chuyển khoản:</p>
                        <p className="font-bold text-lg md:text-xl font-mono select-all">
                            {transferContent}
                        </p>
                    </div>
                </div>
                
                <div className="mt-6 text-center text-[10px] text-gray-300 print:hidden">
                    Generated by SmartTuition
                </div>
            </div>
        </div>
    </div>
  );
};
