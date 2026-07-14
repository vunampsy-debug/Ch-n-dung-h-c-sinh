import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Compass, Award, Sparkles, Save, Upload, Plus, Trash2, 
  ChevronRight, BrainCircuit, CheckCircle, HelpCircle, FileText, ArrowLeft, Loader2, Star
} from 'lucide-react';
import { StudentReport, SubjectScore, ExperientialActivity, SurveyResponse } from '../types';
import SurveyWizard from './SurveyWizard';
import ExcelImporter from './ExcelImporter';
import A4PortraitPreview from './A4PortraitPreview';
import { normalizeSubjectName, normalizeAndMergeSubjectScores } from '../utils/subjectNormalization';
import { parseTranscript, parseExperientialText, parseExperientialPdf, generateAIPortrait } from '../utils/geminiClient';

interface StudentWorkspaceProps {
  report: StudentReport;
  onSaveReport: (report: StudentReport) => void;
  onBackToRoleSelection: () => void;
}

const LOADING_MESSAGES = [
  "Đang đọc dữ liệu bảng điểm học tập của em...",
  "Đang phân tích các điểm số và thiết lập mục tiêu học tập...",
  "Đang tổng hợp thông số hoạt động ngoại khóa trải nghiệm...",
  "Đang kết nối 6 nhóm năng lực cốt lõi Việt Nam...",
  "AI đang phân tích sâu 10 câu hỏi khảo sát phản tư...",
  "Đang tính toán mức độ tương thích của ngành nghề mong ước...",
  "Đang viết lời khuyên rèn luyện và xây dựng lộ trình hành động...",
  "Hoàn tất! Chuẩn bị hiển thị tệp hồ sơ Chân Dung A4..."
];

export default function StudentWorkspace({ report, onSaveReport, onBackToRoleSelection }: StudentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'experiential' | 'survey' | 'portrait'>('profile');
  
  // Local states mimicking the report structures
  const [profile, setProfile] = useState(report.profile);
  const [academicScores, setAcademicScores] = useState<SubjectScore[]>(() => 
    normalizeAndMergeSubjectScores(report.academicScores || [])
  );
  const [experientialActivities, setExperientialActivities] = useState<ExperientialActivity[]>(report.experientialActivities);
  const [survey, setSurvey] = useState<SurveyResponse>(report.survey);
  
  // States for generating portrait
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [generateError, setGenerateError] = useState('');
  
  // States for transcript parsing
  const [transcriptText, setTranscriptText] = useState('');
  const [isParsingTranscript, setIsParsingTranscript] = useState(false);
  const [parseStatus, setParseStatus] = useState({ success: false, message: '' });

  // States for experiential activities parsing
  const [experientialText, setExperientialText] = useState('');
  const [isParsingExperiential, setIsParsingExperiential] = useState(false);
  const [experientialParseStatus, setExperientialParseStatus] = useState({ success: false, message: '' });
  const [isUploadingExperientialPdf, setIsUploadingExperientialPdf] = useState(false);

  // State to add custom subject
  const [newSubjectName, setNewSubjectName] = useState('');
  // State to add custom activity
  const [newActivityName, setNewActivityName] = useState('');

  // Handle avatar image upload as Base64
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh đại diện phải nhỏ hơn 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({
          ...profile,
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Synchronize loading messages during AI generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Save current progress back to parent state
  const handleSaveProgress = (silent = false) => {
    const updatedReport: StudentReport = {
      ...report,
      profile,
      academicScores,
      experientialActivities,
      survey
    };
    onSaveReport(updatedReport);
    if (!silent) {
      alert("Đã lưu tiến trình hồ sơ của em thành công!");
    }
  };

  // Call API to parse Transcript text with AI
  const handleParseTranscript = async () => {
    if (!transcriptText.trim()) return;
    setIsParsingTranscript(true);
    setParseStatus({ success: false, message: '' });

    try {
      const data = await parseTranscript(transcriptText);
      if (data.scores && data.scores.length > 0) {
        // Merge or update the scores list
        const updated = [...academicScores];
        data.scores.forEach((newS: any) => {
          const normName = normalizeSubjectName(newS.subjectName);
          const idx = updated.findIndex(s => normalizeSubjectName(s.subjectName).toLowerCase() === normName.toLowerCase());
          if (idx !== -1) {
            updated[idx].currentScore = newS.currentScore;
          } else {
            updated.push({
              subjectName: normName,
              currentScore: newS.currentScore,
              targetScore: 10,
              trend: 'stable',
              favoriteLevel: 5
            });
          }
        });
        setAcademicScores(normalizeAndMergeSubjectScores(updated));
        setParseStatus({ success: true, message: `Đồng bộ thành công! Đã trích xuất ${data.scores.length} điểm môn học.` });
        setTranscriptText('');
      } else {
        setParseStatus({ success: false, message: 'AI không tìm thấy tên môn học và điểm số phù hợp trong đoạn văn trên. Hãy thử nhập rõ ràng hơn.' });
      }
    } catch (err: any) {
      setParseStatus({ success: false, message: 'Lỗi: ' + err.message });
    } finally {
      setIsParsingTranscript(false);
    }
  };

  // Call API to parse experiential text with AI
  const handleParseExperientialText = async () => {
    if (!experientialText.trim()) return;
    setIsParsingExperiential(true);
    setExperientialParseStatus({ success: false, message: '' });

    try {
      const data = await parseExperientialText(experientialText);
      if (data.activities && data.activities.length > 0) {
        const updated = [...experientialActivities];
        data.activities.forEach((newAct: any) => {
          const idx = updated.findIndex(act => act.activityName.toLowerCase() === newAct.activityName.toLowerCase());
          if (idx !== -1) {
            updated[idx].val = newAct.val;
          } else {
            updated.push({
              activityName: newAct.activityName,
              val: newAct.val
            });
          }
        });
        setExperientialActivities(updated);
        setExperientialParseStatus({ success: true, message: `Đồng bộ thành công! Đã trích xuất ${data.activities.length} hoạt động trải nghiệm.` });
        setExperientialText('');
      } else {
        setExperientialParseStatus({ success: false, message: 'AI không tìm thấy tên hoạt động phù hợp trong đoạn văn trên. Hãy thử nhập rõ ràng hơn.' });
      }
    } catch (err: any) {
      setExperientialParseStatus({ success: false, message: 'Lỗi: ' + err.message });
    } finally {
      setIsParsingExperiential(false);
    }
  };

  // Handle experiential PDF upload
  const handleExperientialPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setExperientialParseStatus({ success: false, message: 'Vui lòng chỉ tải lên tệp tin PDF (.pdf)!' });
      return;
    }

    setIsUploadingExperientialPdf(true);
    setExperientialParseStatus({ success: false, message: '' });

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

          const updated = [...experientialActivities];
          extracted.forEach((newAct: any) => {
            const idx = updated.findIndex(act => act.activityName.toLowerCase() === newAct.activityName.toLowerCase());
            if (idx !== -1) {
              updated[idx].val = newAct.val;
            } else {
              updated.push({
                activityName: newAct.activityName,
                val: newAct.val
              });
            }
          });

          setAcademicScores(normalizeAndMergeSubjectScores(academicScores)); // Ensure synchronization
          setExperientialActivities(updated);
          setExperientialParseStatus({
            success: true,
            message: `Nhập dữ liệu thành công! Đã bóc tách ${extracted.length} hoạt động trải nghiệm từ tệp học bạ PDF.`
          });
        } catch (err: any) {
          console.error(err);
          setExperientialParseStatus({ success: false, message: err.message || 'Có lỗi xảy ra khi phân tích tài liệu PDF.' });
        } finally {
          setIsUploadingExperientialPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setExperientialParseStatus({ success: false, message: 'Lỗi: ' + err.message });
      setIsUploadingExperientialPdf(false);
    }
  };

  // Call API to Generate complete Portrait with AI
  const handleGenerateAIPortrait = async () => {
    setIsGenerating(true);
    setGenerateError('');
    setLoadingMsgIdx(0);

    try {
      const data = await generateAIPortrait(
        profile,
        academicScores,
        experientialActivities,
        survey
      );

      // Successfully received generated portrait analysis
      const updatedReport: StudentReport = {
        ...report,
        profile,
        academicScores,
        experientialActivities,
        survey,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        futureVision: data.futureVision || { title: 'Đang phân tích', description: '', matchPercentage: 80 },
        advice: data.advice || [],
        competencies: data.competencies || report.competencies,
        isPortraitGenerated: true,
        createdAt: new Date().toISOString()
      };

      onSaveReport(updatedReport);
      setActiveTab('portrait');
    } catch (err: any) {
      setGenerateError('Hệ thống AI bận hoặc chưa thiết lập khoá API. Vui lòng bấm thử lại hoặc liên hệ giáo viên đồng hành.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helpers to add custom subjects or activities
  const handleAddSubject = () => {
    const rawName = newSubjectName.trim();
    if (!rawName) return;
    const name = normalizeSubjectName(rawName);
    if (academicScores.some(s => normalizeSubjectName(s.subjectName).toLowerCase() === name.toLowerCase())) {
      alert("Môn học này đã tồn tại!");
      return;
    }
    setAcademicScores(normalizeAndMergeSubjectScores([
      ...academicScores,
      { subjectName: name, currentScore: 8.0, targetScore: 9.0, trend: 'stable', favoriteLevel: 5 }
    ]));
    setNewSubjectName('');
  };

  const handleAddActivity = () => {
    const name = newActivityName.trim();
    if (!name) return;
    if (experientialActivities.some(e => e.activityName.toLowerCase() === name.toLowerCase())) {
      alert("Hoạt động này đã tồn tại!");
      return;
    }
    setExperientialActivities([
      ...experientialActivities,
      { activityName: name, val: 75 }
    ]);
    setNewActivityName('');
  };

  const handleRemoveSubject = (name: string) => {
    setAcademicScores(academicScores.filter(s => s.subjectName !== name));
  };

  const handleRemoveActivity = (name: string) => {
    setExperientialActivities(experientialActivities.filter(e => e.activityName !== name));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Workspace Header Navbar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToRoleSelection}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-500"
              title="Quay lại chọn vai trò"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Học sinh tự phản tư
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">MSHS: {profile.id}</span>
              </div>
              <h1 className="text-lg font-black text-slate-800 leading-tight">
                Không Gian Thiết Lập Chân Dung • {profile.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveProgress(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Tiến Trình</span>
            </button>
            <button
              onClick={handleGenerateAIPortrait}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Đồng Bộ AI & Tạo Chân Dung</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 md:p-6 grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Sidebar navigation tabs */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2.5 pb-2 border-b border-slate-100 mb-2">
              Các bước lập hồ sơ
            </h4>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>I. Thông Tin Cá Nhân</span>
            </button>

            <button
              onClick={() => setActiveTab('academic')}
              className={`w-full p-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'academic' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>II. Kết Quả Học Tập</span>
              </div>
              <span className="text-[9px] font-bold opacity-80 font-mono">({academicScores.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('experiential')}
              className={`w-full p-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'experiential' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4" />
                <span>III. Hoạt Động Trải Nghiệm</span>
              </div>
              <span className="text-[9px] font-bold opacity-80 font-mono">({experientialActivities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('survey')}
              className={`w-full p-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'survey' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>IV. Khảo Sát Phản Tự</span>
            </button>

            <button
              onClick={() => setActiveTab('portrait')}
              className={`w-full p-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'portrait' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                  : report.isPortraitGenerated 
                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4" />
                <span>V. Chân Dung Năng Lực AI</span>
              </div>
              {report.isPortraitGenerated && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
            </button>
          </div>

          {/* Guidelines info card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h5 className="text-[11px] font-black uppercase text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
              Hướng dẫn nhanh
            </h5>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Hãy hoàn thiện lần lượt các mục I, II, III, IV bằng thông tin thực tế của em. Sau đó bấm nút <strong>"Đồng Bộ AI & Tạo Chân Dung"</strong> để AI chuyên gia phân tích 6 nhóm năng lực và xuất bản hồ sơ in A4 hoàn chỉnh.
            </p>
          </div>
        </div>

        {/* Right column: Form Content & Portals */}
        <div className="md:col-span-9 space-y-6">
          
          {/* TAB 1: PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b pb-2">
                  I. THÔNG TIN CÁ NHÂN HỌC SINH
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Cập nhật hồ sơ học vụ cơ bản để hiển thị trên bản in.</p>
              </div>

              <div className="grid md:grid-cols-12 gap-6 items-start">
                {/* Profile Picture Upload Column */}
                <div className="md:col-span-4 flex flex-col items-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-24 h-24 rounded-full border-2 border-orange-500/40 bg-slate-200 overflow-hidden shadow-sm relative flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  <label className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-orange-500 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm transition-all cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Tải ảnh đại diện</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <span className="text-[9px] text-slate-400 font-semibold text-center leading-normal">
                    Hỗ trợ ảnh JPG/PNG dung lượng dưới 2MB
                  </span>
                </div>

                {/* Profile Details Inputs */}
                <div className="md:col-span-8 grid sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500">Họ và tên học sinh:</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500">Mã số học sinh (MSHS):</label>
                    <input
                      type="text"
                      disabled
                      value={profile.id}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none font-mono font-black text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500">Ngày sinh:</label>
                    <input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500">Lớp học:</label>
                    <input
                      type="text"
                      placeholder="e.g. 11A1"
                      value={profile.class}
                      onChange={(e) => setProfile({ ...profile, class: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] uppercase font-black text-slate-500">Tên trường:</label>
                    <select
                      value={profile.school || 'THPT FPT Tây Hà Nội'}
                      onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-black text-slate-800 bg-white"
                    >
                      <option value="THPT FPT Tây Hà Nội">THPT FPT Tây Hà Nội</option>
                      <option value="TH & THCS FPT Cầu Giấy">TH & THCS FPT Cầu Giấy</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] uppercase font-black text-slate-500">Giáo viên chủ nhiệm chủ quản:</label>
                    <input
                      type="text"
                      value={profile.teacherInCharge}
                      onChange={(e) => setProfile({ ...profile, teacherInCharge: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] uppercase font-black text-slate-500">Năng khiếu đặc biệt & Sở thích:</label>
                    <input
                      type="text"
                      placeholder="e.g. Chơi đàn Guitar, lập trình Python, bóng rổ..."
                      value={profile.hobbyDescription}
                      onChange={(e) => setProfile({ ...profile, hobbyDescription: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => { handleSaveProgress(true); setActiveTab('academic'); }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <span>Lưu & Tiếp tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACADEMIC SCORE */}
          {activeTab === 'academic' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b pb-2 text-balance">
                  II. KẾT QUẢ HỌC TẬP & MỨC ĐỘ YÊU THÍCH MÔN HỌC
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1 text-balance">
                  Cập nhật điểm trung bình học tập hiện tại và đánh giá mức độ yêu thích của em đối với các môn học.
                </p>
              </div>

              {/* Dynamic import boxes */}
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                
                {/* Excel importer link */}
                <ExcelImporter 
                  onImportAcademic={(scores) => setAcademicScores(normalizeAndMergeSubjectScores(scores))} 
                  onImportExperiential={(activities) => setExperientialActivities(activities)} 
                />

                {/* AI Transcript Copy Paste box */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1">
                      <BrainCircuit className="w-4 h-4 text-orange-600 animate-pulse" />
                      Nhập Điểm Bằng Trí Tuệ Nhân Tạo AI
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Dán nội dung học bạ/bảng điểm copy từ file ảnh/văn bản vào đây, AI sẽ tự động phân tích và điền điểm hộ em!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Toán 9.2, Ngữ văn 8.5, Tiếng Anh Kỳ II 9.0..."
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-slate-400 bg-white"
                    />

                    {parseStatus.message && (
                      <p className={`text-[9px] font-bold p-1.5 rounded-lg border ${
                        parseStatus.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                      }`}>
                        {parseStatus.message}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={isParsingTranscript || !transcriptText.trim()}
                      onClick={handleParseTranscript}
                      className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      {isParsingTranscript ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI đang phân tích bảng điểm...</span>
                        </>
                      ) : (
                        <span>Bấm Gửi Cho AI Phân Tích</span>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Add New Custom Subject row */}
              <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-md">
                <input
                  type="text"
                  placeholder="Nhập tên môn học mới..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm môn
                </button>
              </div>

              {/* Subjects Score Adjustment list */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b">
                  <div className="col-span-4">Tên môn học</div>
                  <div className="col-span-4 text-center">Điểm Hiện Tại (0-10)</div>
                  <div className="col-span-3 text-center">Yêu Thích (1-5)</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {academicScores.map((score, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-white p-2.5 rounded-xl border border-slate-150 hover:shadow-sm transition-all text-xs font-semibold">
                      
                      {/* Name */}
                      <div className="col-span-4 font-extrabold text-slate-800 truncate">
                        {score.subjectName}
                      </div>

                      {/* Current Score Slider */}
                      <div className="col-span-4 flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={score.currentScore}
                          onChange={(e) => {
                            const copy = [...academicScores];
                            copy[idx].currentScore = parseFloat(e.target.value);
                            setAcademicScores(copy);
                          }}
                          className="w-full accent-orange-600 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="font-mono font-black text-slate-800 text-right w-8">{score.currentScore.toFixed(1)}</span>
                      </div>

                      {/* Favorite Level Checkbox/Buttons */}
                      <div className="col-span-3 flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => {
                              const copy = [...academicScores];
                              copy[idx].favoriteLevel = star;
                              setAcademicScores(copy);
                            }}
                            className="p-0.5 hover:scale-110 transition-all cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${
                              star <= score.favoriteLevel ? 'fill-orange-500 text-orange-500' : 'text-slate-200'
                            }`} />
                          </button>
                        ))}
                      </div>

                      {/* Trash Button */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(score.subjectName)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => { handleSaveProgress(true); setActiveTab('experiential'); }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <span>Lưu & Tiếp tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: EXPERIENTIAL ACTIVITIES */}
          {activeTab === 'experiential' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b pb-2 text-balance">
                  III. HOẠT ĐỘNG TRẢI NGHIỆM & NGOẠI KHÓA
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1 text-balance">
                  Đánh giá mức độ tích cực tham gia các hoạt động ngoại khóa, kỹ năng mềm (Thang điểm từ 0 đến 100).
                </p>
              </div>

              {/* Dynamic import boxes for Section III */}
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fade-in">
                
                {/* PDF/Excel Importer */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1">
                      <FileText className="w-4 h-4 text-orange-600" />
                      Import Học Bạ/Chứng Nhận PDF Trải Nghiệm
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Tải lên tệp tin PDF kết quả hoạt động, học bạ hoặc chứng nhận trải nghiệm để AI tự động trích xuất các hoạt động.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white hover:bg-orange-50/10">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleExperientialPdfUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploadingExperientialPdf}
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        {isUploadingExperientialPdf ? (
                          <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400" />
                        )}
                        <span className="text-[10px] font-bold text-slate-700 block">
                          {isUploadingExperientialPdf ? 'Đang phân tích tài liệu PDF...' : 'Nhấp hoặc kéo thả tệp học bạ PDF'}
                        </span>
                        <span className="text-[8px] text-slate-400 font-medium">Hệ thống AI Gemini tự động bóc tách</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Copy Paste Box */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1">
                      <BrainCircuit className="w-4 h-4 text-orange-600 animate-pulse" />
                      Phân Tích Hoạt Động Bằng Trí Tuệ Nhân Tạo AI
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Dán danh sách hoạt động, dự án, câu lạc bộ, rèn luyện ngoại khóa đã tham gia vào đây để AI tự bóc tách và chấm điểm hộ em!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Tham gia CLB Thể thao trường FPT đạt giải nhì, tham gia chiến dịch tình nguyện hè 2024 xuất sắc..."
                      value={experientialText}
                      onChange={(e) => setExperientialText(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-slate-400 bg-white"
                    />

                    {experientialParseStatus.message && (
                      <p className={`text-[9px] font-bold p-1.5 rounded-lg border ${
                        experientialParseStatus.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                      }`}>
                        {experientialParseStatus.message}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={isParsingExperiential || !experientialText.trim()}
                      onClick={handleParseExperientialText}
                      className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      {isParsingExperiential ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI đang phân tích hoạt động...</span>
                        </>
                      ) : (
                        <span>Bấm Gửi Cho AI Phân Tích</span>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Add New Custom Activity row */}
              <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-md">
                <input
                  type="text"
                  placeholder="Tên hoạt động trải nghiệm mới..."
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm hoạt động
                </button>
              </div>

              {/* Experiential Activities Sliders list */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b">
                  <div className="col-span-6">Tên hoạt động trải nghiệm</div>
                  <div className="col-span-5 text-center">Mức độ tích cực tham gia (0-100)</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {experientialActivities.map((act, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-xl border border-slate-150 hover:shadow-sm transition-all text-xs font-semibold">
                      
                      <div className="col-span-6 text-slate-800 font-extrabold truncate">
                        {act.activityName}
                      </div>

                      <div className="col-span-5 flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={act.val}
                          onChange={(e) => {
                            const copy = [...experientialActivities];
                            copy[idx].val = parseInt(e.target.value);
                            setExperientialActivities(copy);
                          }}
                          className="w-full accent-orange-600 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="font-mono font-black text-slate-800 text-right w-10">{act.val}</span>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(act.activityName)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('academic')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => { handleSaveProgress(true); setActiveTab('survey'); }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <span>Lưu & Tiếp tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SURVEY WIZARD */}
          {activeTab === 'survey' && (
            <div className="space-y-6">
              <SurveyWizard 
                initialValue={survey} 
                onChange={(updatedSurvey) => setSurvey(updatedSurvey)} 
              />

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setActiveTab('experiential')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Quay lại
                </button>
                
                <button
                  onClick={handleGenerateAIPortrait}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-orange-500/15 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <BrainCircuit className="w-4 h-4 animate-bounce" />
                  <span>Tổng Hợp Lập Chân Dung AI</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PORTRAIT GENERATOR / VIEW PREVIEW */}
          {activeTab === 'portrait' && (
            <div className="space-y-6">
              {!report.isPortraitGenerated ? (
                // Locked Portrait state
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                  <div className="inline-flex p-4 rounded-full bg-orange-50 text-orange-600">
                    <BrainCircuit className="w-12 h-12 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">
                      Đồng Bộ & Sáng Tạo Bản Chân Dung
                    </h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                      Em đã cập nhật thông tin và trả lời các phản tư. Hãy bấm nút dưới đây để kích hoạt Trí tuệ Nhân tạo phân tích, nhận dạng năng lực và định hướng tương lai cho riêng em.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateAIPortrait}
                    className="py-3 px-8 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <span>Kích Hoạt Chân Dung Năng Lực AI</span>
                  </button>
                </div>
              ) : (
                // Unlocked portrait page
                <A4PortraitPreview report={report} />
              )}
            </div>
          )}

        </div>
      </main>

      {/* Cyclical Reassuring Loading Modal overlay during AI calculation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 border border-slate-100"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
                <BrainCircuit className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                  AI Đang Vẽ Chân Dung Của Em
                </h3>
                <p className="text-xs text-slate-500 font-bold tracking-wide italic">
                  Vui lòng đợi giây lát, chuyên gia ảo đang phân tích...
                </p>
              </div>

              {/* Cycling message display with key to animate on transition */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 min-h-[55px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsgIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold text-slate-600 leading-normal"
                  >
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <p className="text-[10px] text-slate-400 font-medium">
                AI sẽ tổng hợp 6 nhóm năng lực cốt lõi Việt Nam dựa trên học bạ và các câu hỏi tự phản tư em vừa cung cấp.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
