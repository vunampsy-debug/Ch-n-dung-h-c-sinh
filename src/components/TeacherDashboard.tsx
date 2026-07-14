import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Plus, Trash2, Eye, X, BookOpen, 
  Award, TrendingUp, Sparkles, Star, ChevronRight, FileSpreadsheet, LogOut, Printer,
  Upload, Loader2, Check
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import * as XLSX from 'xlsx';
import { StudentReport } from '../types';
import A4PortraitPreview from './A4PortraitPreview';
import { parseExperientialPdf, generateAIPortrait } from '../utils/geminiClient';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface TeacherDashboardProps {
  students: StudentReport[];
  onUpdateStudents: (updated: StudentReport[]) => void;
  onBackToRoleSelection: () => void;
}

export default function TeacherDashboard({ students, onUpdateStudents, onBackToRoleSelection }: TeacherDashboardProps) {
  // Initialize to true since they already entered the password on the RoleSelection screen!
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Online student portraits state from Firebase
  const [onlinePortraits, setOnlinePortraits] = useState<any[]>([]);
  const [isLoadingPortraits, setIsLoadingPortraits] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'roster' | 'online_submissions'>('roster');

  useEffect(() => {
    const loadOnlinePortraits = async () => {
      setIsLoadingPortraits(true);
      try {
        const q = query(collection(db, "student_portraits"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOnlinePortraits(data);
      } catch (err) {
        console.error("Lỗi khi tải chân dung từ Firebase student_portraits:", err);
      } finally {
        setIsLoadingPortraits(false);
      }
    };
    if (isAuthenticated) {
      loadOnlinePortraits();
    }
  }, [isAuthenticated, students]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'giaovien2026' || passwordInput === 'giaovien123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('teacher_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('Mật khẩu không chính xác. Vui lòng thử lại!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('teacher_logged_in');
    setPasswordInput('');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [viewingReport, setViewingReport] = useState<StudentReport | null>(null);
  
  // States to add new student manually
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newClass, setNewClass] = useState('11A1');
  const [newTeacher, setNewTeacher] = useState('Cô Nguyễn Thị Hoa');

  // PDF Parsing states
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Manual Activity editor states
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
  const [activityNameInput, setActivityNameInput] = useState('');
  const [activityValInput, setActivityValInput] = useState(80);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Portrait regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);

  // PDF upload and parse handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, studentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Vui lòng chỉ tải lên tệp tin PDF (.pdf)!');
      setPdfSuccess(false);
      return;
    }

    setIsUploadingPdf(true);
    setPdfError('');
    setPdfSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          const data = await parseExperientialPdf(base64Data);
          const extracted = data.activities || [];

          if (extracted.length === 0) {
            throw new Error('Không thể tìm thấy hoặc trích xuất được hoạt động trải nghiệm nào từ tệp PDF này.');
          }

          const updatedStudents = students.map(s => {
            if (s.id === studentId) {
              return {
                ...s,
                experientialActivities: extracted,
                isPortraitGenerated: false
              };
            }
            return s;
          });

          onUpdateStudents(updatedStudents);
          setPdfSuccess(true);
          
          const matched = updatedStudents.find(s => s.id === studentId);
          if (matched) {
            setViewingReport(matched);
          }
        } catch (err: any) {
          console.error(err);
          setPdfError(err.message || 'Có lỗi xảy ra khi phân tích tài liệu PDF.');
        } finally {
          setIsUploadingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setPdfError(err.message || 'Có lỗi xảy ra khi đọc tệp.');
      setIsUploadingPdf(false);
    }
  };

  // Delete activity manually
  const handleDeleteActivity = (studentId: string, idx: number) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        const list = [...s.experientialActivities];
        list.splice(idx, 1);
        return {
          ...s,
          experientialActivities: list,
          isPortraitGenerated: false
        };
      }
      return s;
    });
    onUpdateStudents(updatedStudents);
    const matched = updatedStudents.find(s => s.id === studentId);
    if (matched) {
      setViewingReport(matched);
    }
  };

  // Add/Edit activity manually
  const handleSaveActivity = (studentId: string) => {
    if (!activityNameInput.trim()) return;

    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        let list = [...s.experientialActivities];
        if (editingActivityIndex !== null) {
          list[editingActivityIndex] = {
            activityName: activityNameInput.trim(),
            val: activityValInput
          };
        } else {
          list.push({
            activityName: activityNameInput.trim(),
            val: activityValInput
          });
        }
        return {
          ...s,
          experientialActivities: list,
          isPortraitGenerated: false
        };
      }
      return s;
    });

    onUpdateStudents(updatedStudents);
    const matched = updatedStudents.find(s => s.id === studentId);
    if (matched) {
      setViewingReport(matched);
    }

    setEditingActivityIndex(null);
    setActivityNameInput('');
    setActivityValInput(80);
    setIsAddingActivity(false);
  };

  // Regenerate portrait
  const handleRegeneratePortrait = async (student: StudentReport) => {
    setIsRegenerating(true);
    try {
      const generated = await generateAIPortrait(
        student.profile,
        student.academicScores,
        student.experientialActivities,
        student.survey
      );
      
      const updatedStudents = students.map(s => {
        if (s.id === student.id) {
          return {
            ...s,
            ...generated,
            isPortraitGenerated: true
          };
        }
        return s;
      });

      onUpdateStudents(updatedStudents);
      
      const matched = updatedStudents.find(s => s.id === student.id);
      if (matched) {
        setViewingReport(matched);
      }
      alert('Đã cập nhật Chân dung AI thành công dựa trên bảng điểm trải nghiệm mới!');
    } catch (err: any) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo lại chân dung: ' + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Filter students based on search term and class select
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.profile.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || s.profile.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Calculate distinct class names for the filter dropdown
  const classes = ['ALL', ...Array.from(new Set(students.map(s => s.profile.class)))];

  // Calculate dynamic average competencies score across all students
  const competenciesAvg = [
    { name: 'Tự chủ & Tự học', score: 0, count: 0 },
    { name: 'Giao tiếp & Hợp tác', score: 0, count: 0 },
    { name: 'Giải quyết vấn đề & Sáng tạo', score: 0, count: 0 },
    { name: 'Ngôn ngữ & Thẩm mỹ', score: 0, count: 0 },
    { name: 'Tính toán & Công nghệ', score: 0, count: 0 },
    { name: 'Thể chất & Thích ứng', score: 0, count: 0 }
  ];

  students.forEach(s => {
    s.competencies.forEach((comp, idx) => {
      competenciesAvg[idx].score += comp.score;
      competenciesAvg[idx].count += 1;
    });
  });

  const chartData = competenciesAvg.map(c => ({
    name: c.name,
    'Điểm trung bình': c.count > 0 ? Math.round(c.score / c.count) : 0
  }));

  // Handle adding new student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newId.trim().toUpperCase();
    const name = newName.trim();

    if (!id || !name) return;

    if (students.some(s => s.id === id)) {
      alert("Mã số học sinh (MSHS) này đã tồn tại!");
      return;
    }

    const newStudent: StudentReport = {
      id,
      profile: {
        id,
        name,
        dob: '2009-01-01',
        class: newClass,
        school: students[0]?.profile.school || 'TRƯỜNG THCS & THPT THỰC NGHIỆM KHGD',
        avatar: '',
        hobbyDescription: 'Đang cập nhật',
        teacherInCharge: newTeacher
      },
      academicScores: [
        { subjectName: 'Toán', currentScore: 7.0, targetScore: 8.5, trend: 'stable', favoriteLevel: 5 },
        { subjectName: 'Ngữ văn', currentScore: 7.0, targetScore: 8.5, trend: 'stable', favoriteLevel: 5 },
        { subjectName: 'Tiếng Anh', currentScore: 7.0, targetScore: 8.5, trend: 'stable', favoriteLevel: 5 }
      ],
      experientialActivities: [
        { activityName: 'Hoạt động trải nghiệm Stem-Robotics', val: 75 },
        { activityName: 'Thể thao trường học', val: 75 }
      ],
      survey: {
        q1_activities: [],
        q2_favoriteSubjects: [],
        q2_reason: '',
        q3_teamRole: 'supporter',
        q4_strengths: [],
        q5_futureValues: [],
        q6_jobCharacteristics: [],
        q7_improvements: [],
        q8_proudAchievement: '',
        q9_fieldsOfStudy: [],
        q10_futureSelfThreeYears: ''
      },
      competencies: [
        { id: 'autonomy', name: 'Tự chủ & Tự học', score: 70, level: 'Khá', description: 'Đang cập nhật đánh giá' },
        { id: 'cooperation', name: 'Giao tiếp & Hợp tác', score: 70, level: 'Khá', description: 'Đang cập nhật đánh giá' },
        { id: 'creativity', name: 'Giải quyết vấn đề & Sáng tạo', score: 70, level: 'Khá', description: 'Đang cập nhật đánh giá' },
        { id: 'languages', name: 'Ngôn ngữ & Thẩm mỹ', score: 70, level: 'Khá', description: 'Đang cập nhật đánh giá' },
        { id: 'analytical', name: 'Tính toán & Công nghệ', score: 70, level: 'Khá', description: 'Đang cập nhật đánh giá' },
        { id: 'physical', name: 'Thể chất & Thích ứng', score: 70, level: 'Khá', description: 'Đang cập nhật đánh giá' }
      ],
      strengths: ['Sẵn sàng tiếp thu kiến thức và chủ động hỗ trợ bạn bè.'],
      weaknesses: ['Chưa bộc lộ nhiều điểm hạn chế, cần phân tích qua khảo sát.'],
      improvements: ['Cần rèn luyện tính chủ động trao đổi và thảo luận nhiều hơn.'],
      futureVision: { title: 'Đang cập nhật', description: 'Cần hoàn thiện khảo sát phản tư sâu.', matchPercentage: 80 },
      suitableCareers: [],
      advice: ['Cố gắng hoàn thành 10 câu hỏi khảo sát để AI tổng hợp chân dung chuyên nghiệp.'],
      isPortraitGenerated: false,
      createdAt: new Date().toISOString()
    };

    onUpdateStudents([newStudent, ...students]);
    setIsAddingNew(false);
    setNewName('');
    setNewId('');
  };

  // Delete student from list
  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Em có chắc chắn muốn xóa học sinh "${name}" (${id}) ra khỏi hệ thống lớp học không? Hành động này không thể hoàn tác.`)) {
      onUpdateStudents(students.filter(s => s.id !== id));
    }
  };

  // Export full student roster as multi-sheet Excel Workbook
  const handleExportFullExcel = () => {
    // Sheet 1: Profiles
    const profilesData = students.map(s => ({
      "Mã Học Sinh (MSHS)": s.profile.id,
      "Họ và Tên": s.profile.name,
      "Lớp": s.profile.class,
      "Ngày Sinh": s.profile.dob,
      "Trường THPT": s.profile.school,
      "GV Đồng Hành": s.profile.teacherInCharge,
      "Năng Khiếu & Sở Thích": s.profile.hobbyDescription,
      "Định Hướng Nghề Nghiệp": s.futureVision.title,
      "Độ Tương Thích (%)": s.futureVision.matchPercentage,
      "Ngày Thiết Lập": s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : ''
    }));

    // Sheet 2: Academics
    const academicsData: any[] = [];
    students.forEach(s => {
      s.academicScores.forEach(score => {
        academicsData.push({
          "Mã Học Sinh": s.profile.id,
          "Tên Học Sinh": s.profile.name,
          "Lớp": s.profile.class,
          "Môn Học": score.subjectName,
          "Điểm Hiện Tại": score.currentScore,
          "Điểm Mục Tiêu": score.targetScore,
          "Độ Yêu Thích (1-5)": score.favoriteLevel
        });
      });
    });

    // Sheet 3: Competencies
    const competenciesData = students.map(s => ({
      "Mã Học Sinh": s.profile.id,
      "Tên Học Sinh": s.profile.name,
      "Lớp": s.profile.class,
      "Tự Chủ & Tự Học (0-100)": s.competencies.find(c => c.id === 'autonomy')?.score || 70,
      "Giao Tiếp & Hợp Tác (0-100)": s.competencies.find(c => c.id === 'cooperation')?.score || 70,
      "Giải Quyết Vấn Đề (0-100)": s.competencies.find(c => c.id === 'creativity')?.score || 70,
      "Ngôn Ngữ & Thẩm Mỹ (0-100)": s.competencies.find(c => c.id === 'languages')?.score || 70,
      "Tính Toán & Công Nghệ (0-100)": s.competencies.find(c => c.id === 'analytical')?.score || 70,
      "Thể Chất & Thích Ứng (0-100)": s.competencies.find(c => c.id === 'physical')?.score || 70
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(profilesData);
    const ws2 = XLSX.utils.json_to_sheet(academicsData);
    const ws3 = XLSX.utils.json_to_sheet(competenciesData);

    XLSX.utils.book_append_sheet(wb, ws1, "Chân Dung Học Sinh");
    XLSX.utils.book_append_sheet(wb, ws2, "Bảng Điểm Học Tập");
    XLSX.utils.book_append_sheet(wb, ws3, "Năng Lực Cốt Lõi");

    XLSX.writeFile(wb, "Bao_Cao_Tong_Hop_Chan_Dung_Hoc_Sinh.xlsx");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden animate-fade-in" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Abstract background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 border border-slate-800/80 rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/15 text-orange-500 flex items-center justify-center mx-auto border border-orange-500/20">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-base font-black text-white uppercase tracking-widest pt-2">
              Không Gian Giáo Viên
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Vui lòng đăng nhập bằng mật khẩu giáo viên để phê duyệt chân dung và xem thống kê lớp học.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Mật khẩu truy cập:</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 placeholder-slate-600"
              />
            </div>

            {loginError && (
              <p className="text-[10px] text-red-400 font-bold bg-red-950/40 border border-red-900/30 p-2.5 rounded-xl text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Xác Nhận Đăng Nhập</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <button
            onClick={onBackToRoleSelection}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
          >
            Quay lại chọn vai trò
          </button>
        </motion.div>
      </div>
    );
  }

  const formatSubmissionDate = (createdAt: any) => {
    if (!createdAt) return 'Ngoại tuyến';
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleString('vi-VN');
    }
    return new Date(createdAt).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Teacher Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-xl text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bảng Điều Khiển Giáo Viên
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">Lớp: {students[0]?.profile.class || 'Khối 11'}</span>
              </div>
              <h1 className="text-lg font-black text-white leading-tight">
                Hệ Thống Phê Duyệt Chân Dung & Thống Kê Học Lực Học Sinh
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFullExcel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Xuất Excel Roster (.xlsx)</span>
            </button>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh thủ công</span>
            </button>
            <button
              onClick={() => {
                handleLogout();
                onBackToRoleSelection();
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 md:p-6 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Stats Chart Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Biểu đồ năng lực trung bình toàn lớp
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                Thống kê trung bình mức độ đạt được trên 6 nhóm năng lực cốt lõi Việt Nam của danh sách học sinh hiện có.
              </p>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 7.5, fontWeight: 'bold', fill: '#475569' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ fontSize: 10, fontWeight: 'bold', borderRadius: 12, border: '1px solid #e2e8f0' }} 
                  />
                  <Bar dataKey="Điểm trung bình" fill="#ea580c" radius={[8, 8, 0, 0]} maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] border-t">
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Tổng số học sinh</span>
                <span className="text-xl font-black font-mono text-slate-800">{students.length} em</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Tỷ lệ hoàn thành AI</span>
                <span className="text-xl font-black font-mono text-orange-600">
                  {students.filter(s => s.isPortraitGenerated).length} / {students.length} em
                </span>
              </div>
            </div>
          </div>

          {/* Quick instructions or school credit card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl" />
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
              Công cụ đồng hành định hướng học sinh
            </h4>
            <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
              Hệ thống này hỗ trợ giáo viên chủ nhiệm đồng hành bám sát năng lực thực tế, theo dõi các mục tiêu phấn đấu, từ đó đồng hành tư vấn hướng nghiệp cá nhân hóa cho từng em học sinh. Hãy in hoặc tải tệp Excel định kỳ để gửi báo cáo về nhà trường hoặc phụ huynh học sinh.
            </p>
          </div>
        </div>

        {/* Right Column: Students Card Grid */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Dashboard Tabs Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
            <button
              onClick={() => setActiveDashboardTab('roster')}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeDashboardTab === 'roster' 
                  ? 'bg-white text-slate-900 shadow-md border-b-2 border-orange-500' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📊 Quản lý Lớp học ({students.length})
            </button>
            <button
              onClick={() => setActiveDashboardTab('online_submissions')}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeDashboardTab === 'online_submissions' 
                  ? 'bg-white text-slate-900 shadow-md border-b-2 border-orange-500' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Nộp Bài Trực Tuyến ({onlinePortraits.length})</span>
            </button>
          </div>

          {activeDashboardTab === 'roster' ? (
            <>
              {/* Controls Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh theo tên hoặc MSHS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all placeholder-slate-400"
                  />
                </div>

                {/* Filter class select */}
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-3.5 h-3.5 shrink-0" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? 'Tất cả các lớp' : `Lớp ${c}`}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Student list Roster Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => {
                    // Find top calculated competency
                    const topComp = [...student.competencies].sort((a, b) => b.score - a.score)[0];
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:border-orange-500/25 transition-all relative overflow-hidden group"
                      >
                        
                        {/* Top basic card layout */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner">
                                {student.profile.avatar ? (
                                  <img src={student.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Users className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="text-[9px] font-black font-mono text-slate-400 block">{student.id}</span>
                                <h4 className="font-extrabold text-slate-800 text-xs leading-snug tracking-wide group-hover:text-orange-600 transition-all">
                                  {student.profile.name}
                                </h4>
                                <span className="text-[9px] font-bold text-slate-500">Lớp: {student.profile.class}</span>
                              </div>
                            </div>

                            {/* Approved Badge */}
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              student.isPortraitGenerated 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                            }`}>
                              {student.isPortraitGenerated ? 'Đã phản tư' : 'Nháp'}
                            </span>
                          </div>

                          {/* Small competencies overview line */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[10px] leading-relaxed">
                            <div className="flex justify-between text-slate-500 font-bold">
                              <span>Năng lực nổi bật nhất:</span>
                              <span className="font-black text-orange-600">{topComp?.name || 'Đang tính toán'}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-bold">
                              <span>Mục tiêu tương thích:</span>
                              <span className="font-black text-slate-800 truncate max-w-[130px]" title={student.futureVision.title}>
                                {student.futureVision.title || 'Chưa cập nhật'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions buttons block */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => setViewingReport(student)}
                            className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem chân dung A4</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.profile.name)}
                            className="py-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa học sinh</span>
                          </button>
                        </div>

                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-semibold italic">Không tìm thấy kết quả học sinh phù hợp!</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Controls Bar for Submissions */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học sinh nộp bài..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all placeholder-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-3.5 h-3.5 shrink-0" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? 'Tất cả các lớp' : `Lớp ${c}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingPortraits ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Đang đồng bộ hồ sơ học sinh trực tuyến từ Firestore...</p>
                </div>
              ) : onlinePortraits.filter(p => {
                const matchesSearch = (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchesClass = selectedClass === 'ALL' || (p.className || '') === selectedClass;
                return matchesSearch && matchesClass;
              }).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold italic">Chưa có học sinh nào nộp hồ sơ phản tư trực tuyến.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {onlinePortraits.filter(p => {
                    const matchesSearch = (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesClass = selectedClass === 'ALL' || (p.className || '') === selectedClass;
                    return matchesSearch && matchesClass;
                  }).map((student, idx) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <h3 className="text-sm font-black text-slate-800">
                            Học sinh: <span className="text-orange-600">{student.fullName}</span> {student.className ? `(Lớp: ${student.className})` : ''}
                          </h3>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 font-mono">
                          Nộp bài: {formatSubmissionDate(student.createdAt)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-xs leading-relaxed">
                        {/* SWOT Analysis */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                          <h4 className="font-black text-slate-800 flex items-center gap-1.5 uppercase text-[10px] tracking-wider border-b pb-1.5">
                            🧠 Đánh giá năng lực của AI
                          </h4>
                          <div className="space-y-1.5">
                            <p className="text-slate-600 text-xs">
                              <strong className="text-slate-800">Điểm mạnh:</strong> {student.aiEvaluation?.strengths || "Chưa có dữ liệu"}
                            </p>
                            <p className="text-slate-600 text-xs">
                              <strong className="text-slate-800">Cần cải thiện:</strong> {student.aiEvaluation?.improvements || "Chưa có dữ liệu"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Careers suggestions */}
                        <div className="bg-orange-50/45 p-4 rounded-2xl border border-orange-100/50 space-y-3">
                          <h4 className="font-black text-orange-800 flex items-center gap-1.5 uppercase text-[10px] tracking-wider border-b border-orange-100 pb-1.5">
                            💼 Top 5 ngành nghề đề xuất
                          </h4>
                          <ul className="space-y-1">
                            {student.aiEvaluation?.careers?.map((career: string, cIdx: number) => (
                              <li key={cIdx} className="text-xs text-orange-950 font-bold flex items-start gap-1.5">
                                <span className="text-orange-500 shrink-0 select-none">•</span>
                                <span>{career}</span>
                              </li>
                            )) || <li className="text-xs text-slate-500 italic">Chưa phân tích nghề nghiệp</li>}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* MODAL 1: View A4 Portrait Preview (Teacher modal) */}
      <AnimatePresence>
        {viewingReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl relative overflow-hidden my-4 border"
            >
              {/* Modal Banner Control Bar (Don't Print) */}
              <div className="bg-slate-950 text-white p-4 flex justify-between items-center no-print">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Phê duyệt Chân Dung Học Sinh • {viewingReport.profile.name} ({viewingReport.profile.class})
                  </span>
                </div>
                <button
                  onClick={() => setViewingReport(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Split Screen Panel for Workspace */}
              <div className="grid lg:grid-cols-12 max-h-[85vh] overflow-hidden">
                {/* Left Panel: Manage & PDF Import */}
                <div className="lg:col-span-4 bg-slate-50 border-r border-slate-200 p-5 overflow-y-auto flex flex-col justify-between space-y-5 no-print" style={{ maxHeight: '85vh' }}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-orange-600" />
                        Điểm Hoạt Động Trải Nghiệm
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                        Trích xuất tự động điểm trải nghiệm từ học bạ PDF hoặc tự chỉnh sửa thông số tham gia (0-100).
                      </p>
                    </div>

                    {/* PDF Importer Area */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm">
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">Import tệp PDF</span>
                      
                      <div className="relative border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-orange-50/10">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handlePdfUpload(e, viewingReport.id)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={isUploadingPdf}
                        />
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          {isUploadingPdf ? (
                            <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                          ) : pdfSuccess ? (
                            <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <Upload className="w-6 h-6 text-slate-400" />
                          )}
                          <span className="text-[11px] font-bold text-slate-700 block">
                            {isUploadingPdf ? 'Đang gửi phân tích PDF...' : 'Nhấp hoặc kéo thả tệp PDF'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">Hệ thống AI Gemini sẽ tự động bóc tách</span>
                        </div>
                      </div>

                      {pdfError && (
                        <p className="text-[9px] text-red-500 font-bold bg-red-50 border border-red-100 p-2 rounded-lg text-center">
                          {pdfError}
                        </p>
                      )}
                      {pdfSuccess && (
                        <p className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
                          Nhập dữ liệu thành công! Hãy tạo lại chân dung AI ở phía dưới.
                        </p>
                      )}
                    </div>

                    {/* Activities List Manager */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Danh sách hoạt động</span>
                        <button
                          onClick={() => {
                            setEditingActivityIndex(null);
                            setActivityNameInput('');
                            setActivityValInput(80);
                            setIsAddingActivity(true);
                          }}
                          className="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          Thêm mới
                        </button>
                      </div>

                      {/* Add/Edit Mini Form */}
                      {(isAddingActivity || editingActivityIndex !== null) && (
                        <div className="p-3 bg-white border border-orange-200/80 rounded-2xl space-y-3 shadow-md animate-fade-in">
                          <span className="text-[9px] font-black uppercase text-orange-600">
                            {editingActivityIndex !== null ? 'Sửa hoạt động' : 'Thêm hoạt động mới'}
                          </span>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Tên hoạt động:</label>
                            <input
                              type="text"
                              value={activityNameInput}
                              onChange={(e) => setActivityNameInput(e.target.value)}
                              placeholder="e.g. Hoạt động thiện nguyện hè"
                              className="w-full p-2 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                              <span>Mức độ tham gia:</span>
                              <span className="text-orange-600">{activityValInput}/100</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={activityValInput}
                              onChange={(e) => setActivityValInput(Number(e.target.value))}
                              className="w-full accent-orange-600"
                            />
                          </div>
                          <div className="flex justify-end gap-2 text-[9px]">
                            <button
                              onClick={() => {
                                setIsAddingActivity(false);
                                setEditingActivityIndex(null);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md font-bold"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleSaveActivity(viewingReport.id)}
                              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-bold"
                            >
                              Lưu
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {viewingReport.experientialActivities.map((act, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-white border border-slate-100 rounded-xl text-xs hover:border-slate-200 transition-all">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-extrabold text-slate-800 text-[11px] truncate" title={act.activityName}>
                                {act.activityName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-bold text-slate-400">Tham gia:</span>
                                <span className="text-[9px] font-black text-orange-600">{act.val}/100</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-orange-500" style={{ width: `${act.val}%` }} />
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingActivityIndex(i);
                                  setActivityNameInput(act.activityName);
                                  setActivityValInput(act.val);
                                  setIsAddingActivity(false);
                                }}
                                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded"
                                title="Sửa"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(viewingReport.id, i)}
                                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-red-600 rounded"
                                title="Xóa"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Regenerate Portrait Action Area */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100 text-[10px] text-orange-800 leading-relaxed font-semibold">
                      Sau khi nhập học bạ PDF hoặc sửa điểm hoạt động, giáo viên cần tạo lại Chân dung AI để phân tích sâu đồng bộ các kết quả năng lực.
                    </div>
                    <button
                      onClick={() => handleRegeneratePortrait(viewingReport)}
                      disabled={isRegenerating}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang tính toán lại chân dung...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          <span>Tạo lại chân dung AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Panel: Portrait Preview */}
                <div className="lg:col-span-8 bg-slate-100 overflow-y-auto flex justify-center p-6" style={{ maxHeight: '85vh' }}>
                  <A4PortraitPreview report={viewingReport} />
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add Student Manually */}
      <AnimatePresence>
        {isAddingNew && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border space-y-6"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
                  Thêm học sinh mới thủ công
                </h3>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500">Mã Số Học Sinh (MSHS):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HS004"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500">Họ và Tên Học Sinh:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nguyễn Khánh Linh"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500">Lớp:</label>
                    <input
                      type="text"
                      required
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500">Giáo Viên Đồng Hành:</label>
                    <input
                      type="text"
                      required
                      value={newTeacher}
                      onChange={(e) => setNewTeacher(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Thêm vào lớp
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
