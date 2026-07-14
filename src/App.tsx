import React, { useState, useEffect } from 'react';
import { StudentReport } from './types';
import RoleSelection from './components/RoleSelection';
import StudentWorkspace from './components/StudentWorkspace';
import TeacherDashboard from './components/TeacherDashboard';
import { normalizeAndMergeSubjectScores } from './utils/subjectNormalization';
import { saveStudentReportToFirestore, getStudentReportsFromFirestore } from './utils/firebase';

export default function App() {
  const [role, setRole] = useState<'selection' | 'student' | 'teacher'>('selection');
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');

  // Load students from localStorage and Firestore on mount
  useEffect(() => {
    // 1. Initial instant load from local storage
    const saved = localStorage.getItem('student_reports');
    let localReports: StudentReport[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StudentReport[];
        localReports = parsed.map(s => ({
          ...s,
          academicScores: normalizeAndMergeSubjectScores(s.academicScores || []),
          weaknesses: s.weaknesses || [],
          suitableCareers: s.suitableCareers || []
        }));
        setStudents(localReports);
      } catch (err) {
        console.error('Failed to parse saved students reports:', err);
      }
    }

    // 2. Fetch and merge latest data from Firestore
    const syncWithFirestore = async () => {
      setSyncStatus('syncing');
      try {
        const remoteReports = await getStudentReportsFromFirestore();
        if (remoteReports && remoteReports.length > 0) {
          const mergedMap = new Map<string, StudentReport>();
          
          // Populate with local first
          localReports.forEach(r => mergedMap.set(r.id, r));
          
          // Override with remote reports
          remoteReports.forEach(r => {
            const local = mergedMap.get(r.id);
            // If remote doesn't exist locally, or is newer/same, merge it
            if (!local || !local.createdAt || (r.createdAt && r.createdAt >= local.createdAt)) {
              mergedMap.set(r.id, {
                ...r,
                academicScores: normalizeAndMergeSubjectScores(r.academicScores || []),
                weaknesses: r.weaknesses || [],
                suitableCareers: r.suitableCareers || []
              });
            }
          });
          
          const mergedList = Array.from(mergedMap.values());
          setStudents(mergedList);
          localStorage.setItem('student_reports', JSON.stringify(mergedList));
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Firestore sync failed or offline on mount:', err);
        setSyncStatus('error');
      }
    };

    syncWithFirestore();
  }, []);

  // Sync state changes back to localStorage and Firestore
  const saveStudentsToStorage = async (updatedStudents: StudentReport[]) => {
    const normalized = updatedStudents.map(s => ({
      ...s,
      academicScores: normalizeAndMergeSubjectScores(s.academicScores || [])
    }));
    setStudents(normalized);
    localStorage.setItem('student_reports', JSON.stringify(normalized));

    setSyncStatus('syncing');
    try {
      // Persist each changed student report to Cloud Firestore
      await Promise.all(
        normalized.map(report => saveStudentReportToFirestore(report))
      );
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
      setSyncStatus('error');
    }
  };

  // Create a brand new student roster with default fields specified in the requirements
  const handleCreateNewStudent = (name: string, mshs: string) => {
    const newStudent: StudentReport = {
      id: mshs,
      profile: {
        id: mshs,
        name,
        dob: '',
        class: '11A1', // Default starter class
        school: 'THPT FPT Tây Hà Nội', // Default starter school
        avatar: '',
        hobbyDescription: '',
        teacherInCharge: 'Cô Nguyễn Thị Hoa'
      },
      // Requirement: pre-populate core subjects with default score 0
      academicScores: [
        { subjectName: 'Toán', currentScore: 0, targetScore: 0, trend: 'stable', favoriteLevel: 5 },
        { subjectName: 'Ngữ văn', currentScore: 0, targetScore: 0, trend: 'stable', favoriteLevel: 5 },
        { subjectName: 'Tiếng Anh', currentScore: 0, targetScore: 0, trend: 'stable', favoriteLevel: 5 },
        { subjectName: 'Lịch sử', currentScore: 0, targetScore: 0, trend: 'stable', favoriteLevel: 5 },
        { subjectName: 'Vật lý', currentScore: 0, targetScore: 0, trend: 'stable', favoriteLevel: 5 }
      ],
      // Requirement: experiential activity is optional and starts empty
      experientialActivities: [],
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
      // Initial calculated placeholder competencies
      competencies: [
        { id: 'autonomy', name: 'Tự chủ & Tự học', score: 0, level: 'Chưa Đánh Giá', description: 'Nhấp Đồng bộ AI để đánh giá' },
        { id: 'cooperation', name: 'Giao tiếp & Hợp tác', score: 0, level: 'Chưa Đánh Giá', description: 'Nhấp Đồng bộ AI để đánh giá' },
        { id: 'creativity', name: 'Giải quyết vấn đề & Sáng tạo', score: 0, level: 'Chưa Đánh Giá', description: 'Nhấp Đồng bộ AI để đánh giá' },
        { id: 'languages', name: 'Ngôn ngữ & Thẩm mỹ', score: 0, level: 'Chưa Đánh Giá', description: 'Nhấp Đồng bộ AI để đánh giá' },
        { id: 'analytical', name: 'Tính toán & Công nghệ', score: 0, level: 'Chưa Đánh Giá', description: 'Nhấp Đồng bộ AI để đánh giá' },
        { id: 'physical', name: 'Thể chất & Thích ứng', score: 0, level: 'Chưa Đánh Giá', description: 'Nhấp Đồng bộ AI để đánh giá' }
      ],
      strengths: [],
      weaknesses: [],
      improvements: [],
      futureVision: { title: 'Chưa thiết lập', description: 'Vui lòng thực hiện Đồng Bộ AI.', matchPercentage: 0 },
      suitableCareers: [],
      advice: [],
      isPortraitGenerated: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newStudent, ...students];
    saveStudentsToStorage(updated);
    
    // Auto-login the student into their newly created workspace
    setActiveStudentId(mshs);
    setRole('student');
  };

  const handleUpdateStudentReport = (updatedReport: StudentReport) => {
    const updated = students.map(s => s.id === updatedReport.id ? updatedReport : s);
    saveStudentsToStorage(updated);
  };

  // Find currently active student's report
  const activeStudentReport = students.find(s => s.id === activeStudentId);

  return (
    <div className="bg-slate-50 min-h-screen">
      {role === 'selection' && (
        <RoleSelection
          students={students}
          onSelectRole={(selectedRole, studentId) => {
            setRole(selectedRole);
            if (selectedRole === 'student' && studentId) {
              setActiveStudentId(studentId);
            }
          }}
          onCreateNewStudent={handleCreateNewStudent}
        />
      )}

      {role === 'student' && activeStudentReport && (
        <StudentWorkspace
          report={activeStudentReport}
          onSaveReport={handleUpdateStudentReport}
          onBackToRoleSelection={() => {
            setRole('selection');
            setActiveStudentId(null);
          }}
        />
      )}

      {role === 'student' && !activeStudentReport && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 animate-fade-in">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
            <h2 className="text-lg font-black text-slate-800">Không tìm thấy tài khoản học sinh</h2>
            <p className="text-xs text-slate-600 leading-relaxed">Có vẻ như tài khoản này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
            <button
              onClick={() => {
                setRole('selection');
                setActiveStudentId(null);
              }}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Quay lại Trang Chủ
            </button>
          </div>
        </div>
      )}

      {role === 'teacher' && (
        <TeacherDashboard
          students={students}
          onUpdateStudents={saveStudentsToStorage}
          onBackToRoleSelection={() => setRole('selection')}
        />
      )}

      {/* Floating Firebase Cloud Sync Indicator */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur border border-slate-200/80 rounded-full shadow-lg text-[10px] font-bold text-slate-600 transition-all hover:bg-white select-none">
        <div className={`w-1.5 h-1.5 rounded-full ${
          syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' :
          syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' :
          syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400'
        }`} />
        <span>
          {syncStatus === 'synced' ? 'Đã đồng bộ Cloud' :
           syncStatus === 'syncing' ? 'Đang đồng bộ...' :
           syncStatus === 'error' ? 'Lỗi kết nối Cloud' : 'Chưa đồng bộ Cloud'}
        </span>
      </div>
    </div>
  );
}
