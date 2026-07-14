import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SubjectScore, ExperientialActivity } from '../types';

interface ExcelImporterProps {
  onImportAcademic: (scores: SubjectScore[]) => void;
  onImportExperiential: (activities: ExperientialActivity[]) => void;
}

export default function ExcelImporter({ onImportAcademic, onImportExperiential }: ExcelImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

  // Generate and download a sample excel file template
  const downloadTemplate = () => {
    // Academic sheet data
    const academicData = [
      { "Tên Môn Học": "Toán học", "Điểm Trung Bình": 8.5, "Mục Tiêu": 9.0, "Độ Yêu Thích (1-5)": 4 },
      { "Tên Môn Học": "Ngữ văn", "Điểm Trung Bình": 7.8, "Mục Tiêu": 8.5, "Độ Yêu Thích (1-5)": 3 },
      { "Tên Môn Học": "Tiếng Anh", "Điểm Trung Bình": 8.8, "Mục Tiêu": 9.5, "Độ Yêu Thích (1-5)": 5 },
      { "Tên Môn Học": "Vật lý", "Điểm Trung Bình": 8.0, "Mục Tiêu": 8.5, "Độ Yêu Thích (1-5)": 4 },
      { "Tên Môn Học": "Hóa học", "Điểm Trung Bình": 7.5, "Mục Tiêu": 8.0, "Độ Yêu Thích (1-5)": 3 },
      { "Tên Môn Học": "Tin học", "Điểm Trung Bình": 9.2, "Mục Tiêu": 10.0, "Độ Yêu Thích (1-5)": 5 }
    ];

    // Experiential sheet data
    const experientialData = [
      { "Tên Hoạt Động": "Hoạt động trải nghiệm Stem-Robotics", "Điểm Đánh Giá (0-100)": 90 },
      { "Tên Hoạt Động": "Câu lạc bộ Tin học & Công nghệ", "Điểm Đánh Giá (0-100)": 85 },
      { "Tên Hoạt Động": "Thể thao học đường", "Điểm Đánh Giá (0-100)": 95 },
      { "Tên Hoạt Động": "Chiến dịch tình nguyện mùa hè xanh", "Điểm Đánh Giá (0-100)": 80 }
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(academicData);
    const ws2 = XLSX.utils.json_to_sheet(experientialData);

    XLSX.utils.book_append_sheet(wb, ws1, "Bảng Điểm Học Tập");
    XLSX.utils.book_append_sheet(wb, ws2, "Hoạt Động Trải Nghiệm");

    XLSX.writeFile(wb, "Mau_Khao_Sat_Chan_Dung_Hoc_Sinh.xlsx");
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setStatus({ type: 'error', message: 'Vui lòng chọn file Excel đúng định dạng (.xlsx, .xls) hoặc file CSV!' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let importedAcademicCount = 0;
        let importedExperientialCount = 0;

        // Parse Sheet 1: Academic Scores
        const sheet1Name = workbook.SheetNames[0];
        if (sheet1Name) {
          const sheet1 = workbook.Sheets[sheet1Name];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet1);
          
          const academicScores: SubjectScore[] = [];
          rows.forEach(row => {
            const subjectName = row["Tên Môn Học"] || row["subject"] || row["SubjectName"] || row["môn học"] || row["Môn học"];
            const currentScore = parseFloat(row["Điểm Trung Bình"] || row["score"] || row["CurrentScore"] || row["điểm"] || row["Điểm"]);
            const targetScore = parseFloat(row["Mục Tiêu"] || row["target"] || row["TargetScore"] || row["mục tiêu"] || row["Mục tiêu"]) || 10;
            const favLevel = parseInt(row["Độ Yêu Thích (1-5)"] || row["favorite"] || row["FavoriteLevel"]) || 5;

            if (subjectName && !isNaN(currentScore)) {
              academicScores.push({
                subjectName: String(subjectName).trim(),
                currentScore: Math.min(10, Math.max(0, currentScore)),
                targetScore: Math.min(10, Math.max(0, targetScore)),
                trend: 'stable',
                favoriteLevel: Math.min(5, Math.max(1, favLevel))
              });
            }
          });

          if (academicScores.length > 0) {
            onImportAcademic(academicScores);
            importedAcademicCount = academicScores.length;
          }
        }

        // Parse Sheet 2: Experiential Activities
        const sheet2Name = workbook.SheetNames[1] || workbook.SheetNames.find(n => n.toLowerCase().includes('hoạt động') || n.toLowerCase().includes('trải nghiệm'));
        if (sheet2Name) {
          const sheet2 = workbook.Sheets[sheet2Name];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet2);
          
          const experientialActivities: ExperientialActivity[] = [];
          rows.forEach(row => {
            const activityName = row["Tên Hoạt Động"] || row["activity"] || row["ActivityName"] || row["hoạt động"] || row["Hoạt động"];
            const val = parseFloat(row["Điểm Đánh Giá (0-100)"] || row["val"] || row["value"] || row["điểm"] || row["Điểm"]);

            if (activityName && !isNaN(val)) {
              experientialActivities.push({
                activityName: String(activityName).trim(),
                val: Math.min(100, Math.max(0, val))
              });
            }
          });

          if (experientialActivities.length > 0) {
            onImportExperiential(experientialActivities);
            importedExperientialCount = experientialActivities.length;
          }
        }

        if (importedAcademicCount > 0 || importedExperientialCount > 0) {
          setStatus({
            type: 'success',
            message: `Nhập dữ liệu thành công! Đã nhập ${importedAcademicCount} môn học và ${importedExperientialCount} hoạt động trải nghiệm.`
          });
        } else {
          setStatus({
            type: 'error',
            message: 'Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng sử dụng file mẫu.'
          });
        }
      } catch (err: any) {
        setStatus({ type: 'error', message: 'Lỗi khi đọc file Excel: ' + err.message });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Nhập Dữ Liệu Nhanh Qua Excel
          </h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Nhập nhanh bảng điểm môn học và điểm hoạt động trải nghiệm học sinh.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Tải file mẫu Excel (.xlsx)</span>
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 min-h-[110px] ${
          isDragActive 
            ? 'border-orange-500 bg-orange-50/20' 
            : 'border-slate-200 hover:border-orange-500/40 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        <div className="p-2.5 rounded-full bg-orange-50 text-orange-600">
          <Upload className="w-4 h-4" />
        </div>
        <p className="text-[11px] font-bold text-slate-700">
          Kéo thả file Excel vào đây hoặc <span className="text-orange-600 hover:underline">bấm để chọn file</span>
        </p>
        <p className="text-[9px] text-slate-400 font-medium">
          Chấp nhận định dạng .xlsx, .xls, .csv theo cấu trúc file mẫu
        </p>
      </div>

      {status.type !== 'idle' && (
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
          status.type === 'success' 
            ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
            : 'bg-red-50 border-red-150 text-red-800'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
