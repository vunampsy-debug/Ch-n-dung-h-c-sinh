export interface StudentProfile {
  id: string; // MSHS
  name: string;
  dob: string;
  class: string;
  school: string;
  avatar: string; // Base64 data URL or placeholder
  hobbyDescription: string; // Năng khiếu & Sở thích
  teacherInCharge: string; // Giáo viên chủ nhiệm / đồng hành
}

export interface SubjectScore {
  subjectName: string;
  originalSubjectName?: string | null;
  scoreType?: 'numeric' | 'pass_fail' | 'not_available' | null;
  score?: number | null;
  assessmentResult?: 'Đạt' | 'Chưa đạt' | null;
  interestLevel?: number | null; // 1 to 5
  source?: 'manual' | 'slider' | 'pasted_text' | 'pdf' | null;
  sourceColumn?: string | null;
  sourceOrder?: number | null;
  updatedAt?: string | null;
  confidence?: number | null;
  status?: 'valid' | 'invalid' | 'needs_review' | null;
  reason?: string | null;

  // Backward compatibility fields
  currentScore: number;
  targetScore: number;
  trend: 'up' | 'down' | 'stable';
  favoriteLevel: number; // 1 to 5
}

export interface ExperientialActivity {
  activityName: string;
  val: number; // 0 to 100 rating of active participation/engagement
}

export interface SurveyResponse {
  q1_activities: string[]; // Hoạt động tham gia
  q2_favoriteSubjects: string[]; // Môn học yêu thích nhất
  q2_reason: string; // Lý do yêu thích môn học đó
  q3_teamRole: string; // Vai trò trong làm việc nhóm
  q4_strengths: string[]; // 3 thế mạnh tự cảm nhận
  q5_futureValues: string[]; // 3 giá trị tương lai quan trọng nhất
  q6_jobCharacteristics: string[]; // 3 đặc điểm công việc tương lai
  q7_improvements: string[]; // 3 khía cạnh muốn cải thiện trong 12 tháng
  q8_proudAchievement: string; // Hoạt động tự hào nhất
  q9_fieldsOfStudy: string[]; // Ngành học/Lĩnh vực quan tâm
  q10_futureSelfThreeYears: string; // Bản thân sau 3 năm
}

export interface CompetencyGroup {
  id: string;
  name: string;
  score: number; // 0 to 100
  level: string; // Xuất sắc, Tốt, Khá, Trung bình, Cần cố gắng
  description: string;
}

export interface CareerVision {
  title: string;
  description: string;
  matchPercentage: number;
}

export interface StudentReport {
  id: string; // Document ID / Student MSHS
  profile: StudentProfile;
  academicScores: SubjectScore[];
  experientialActivities: ExperientialActivity[];
  survey: SurveyResponse;
  competencies: CompetencyGroup[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  futureVision: CareerVision;
  suitableCareers: CareerVision[];
  advice: string[];
  isPortraitGenerated: boolean;
  createdAt: string;
}
