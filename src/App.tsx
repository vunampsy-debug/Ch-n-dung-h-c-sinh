import React, { useState, useEffect } from 'react';
import { StudentReport } from './types';
import RoleSelection from './components/RoleSelection';
import StudentWorkspace from './components/StudentWorkspace';
import TeacherDashboard from './components/TeacherDashboard';
import { normalizeAndMergeSubjectScores } from './utils/subjectNormalization';

export default function App() {
  const [role, setRole] = useState<'selection' | 'student' | 'teacher'>('selection');
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Load students from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('student_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StudentReport[];
        const normalized = parsed.map(s => ({
          ...s,
          academicScores: normalizeAndMergeSubjectScores(s.academicScores || [])
        }));
        setStudents(normalized);
      } catch (err) {
        console.error('Failed to parse saved students reports:', err);
        setStudents([]);
      }
    } else {
      // Default to empty array per user request: "Khi đăng nhập vào ứng dụng thì chỉ có phần tạo hồ sơ mới, không có bất kỳ một hồ sơ mẫu nào cả."
      setStudents([]);
    }
  }, []);

  // Sync state changes back to localStorage
  const saveStudentsToStorage = (updatedStudents: StudentReport[]) => {
    const normalized = updatedStudents.map(s => ({
      ...s,
      academicScores: normalizeAndMergeSubjectScores(s.academicScores || [])
    }));
    setStudents(normalized);
    localStorage.setItem('student_reports', JSON.stringify(normalized));
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
      improvements: [],
      futureVision: { title: 'Chưa thiết lập', description: 'Vui lòng thực hiện Đồng Bộ AI.', matchPercentage: 0 },
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
    </div>
  );
}
