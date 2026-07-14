import { StudentReport } from '../types';
import { calculateCompetencies } from '../utils/portraitCalculations';
import { normalizeAndMergeSubjectScores } from '../utils/subjectNormalization';

const rawMockStudents = [
  {
    id: 'HS001',
    profile: {
      id: 'HS001',
      name: 'Nguyễn Minh Anh',
      dob: '2009-04-15',
      class: '11A1',
      school: 'TRƯỜNG THCS & THPT THỰC NGHIỆM KHGD',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      hobbyDescription: 'Lập trình Python, Robot, thiết kế đồ họa 3D',
      teacherInCharge: 'Cô Nguyễn Thị Hoa'
    },
    academicScores: [
      { subjectName: 'Toán học', currentScore: 9.2, targetScore: 9.5, trend: 'up' as const, favoriteLevel: 5 },
      { subjectName: 'Tin học', currentScore: 9.5, targetScore: 10.0, trend: 'up' as const, favoriteLevel: 5 },
      { subjectName: 'Vật lý', currentScore: 8.8, targetScore: 9.0, trend: 'stable' as const, favoriteLevel: 4 },
      { subjectName: 'Ngữ văn', currentScore: 7.2, targetScore: 8.0, trend: 'up' as const, favoriteLevel: 3 },
      { subjectName: 'Tiếng Anh', currentScore: 8.5, targetScore: 9.0, trend: 'stable' as const, favoriteLevel: 4 },
      { subjectName: 'Hóa học', currentScore: 8.0, targetScore: 8.5, trend: 'up' as const, favoriteLevel: 3 }
    ],
    experientialActivities: [
      { activityName: 'Học tập trải nghiệm Stem-Robotics', val: 95 },
      { activityName: 'Câu lạc bộ Tin học & Công nghệ', val: 90 },
      { activityName: 'Hoạt động dã ngoại thực địa địa lý', val: 80 },
      { activityName: 'Công tác tình nguyện hỗ trợ xã hội', val: 75 }
    ],
    survey: {
      q1_activities: ['Nghiên cứu khoa học kỹ thuật', 'Lắp ráp Robot', 'Lập trình website'],
      q2_favoriteSubjects: ['Toán học', 'Tin học'],
      q2_reason: 'Em yêu thích giải quyết các bài toán logic phức tạp và tự tay viết code chế tạo những ứng dụng, sản phẩm công nghệ có ích.',
      q3_teamRole: 'thinker',
      q4_strengths: ['Tư duy logic', 'Giải quyết vấn đề', 'Sử dụng công cụ công nghệ'],
      q5_futureValues: ['Sự đổi mới, sáng tạo', 'Cống hiến cho xã hội', 'Phát triển chuyên môn sâu'],
      q6_jobCharacteristics: ['Công việc công nghệ cao', 'Môi trường làm việc tự do', 'Nhiều thử thách trí tuệ'],
      q7_improvements: ['Kỹ năng trình bày trước đám đông', 'Quản lý thời gian tối ưu', 'Kỹ năng thương lượng'],
      q8_proudAchievement: 'Đạt giải Ba cuộc thi Khoa học Kỹ thuật dành cho học sinh trung học cấp Thành phố với dự án xe tự hành thông minh.',
      q9_fieldsOfStudy: ['Khoa học máy tính', 'Kỹ thuật Robot', 'Trí tuệ nhân tạo (AI)'],
      q10_futureSelfThreeYears: 'Là một sinh viên Đại học chuyên ngành Khoa học máy tính năng động, tự tin phát triển các dự án khởi nghiệp công nghệ.'
    },
    strengths: [
      'Năng lực phân tích và tư duy thuật toán cực kỳ sắc bén.',
      'Chủ động sáng tạo trong việc tự học lập trình và công nghệ mới.',
      'Có khả năng tập trung cao độ khi giải quyết các vấn đề phức tạp.'
    ],
    improvements: [
      'Cần tích cực rèn luyện kỹ năng nói trước công chúng để tự tin bảo vệ dự án.',
      'Nên mở rộng kỹ năng lắng nghe ý kiến đóng góp của các thành viên khác trong nhóm.'
    ],
    futureVision: {
      title: 'Kỹ sư Trí tuệ Nhân tạo / Nhà Phát triển Công nghệ',
      description: 'Nghiên cứu, phát triển những ứng dụng trí tuệ nhân tạo để giải quyết các vấn đề thực tiễn trong y tế, giáo dục.',
      matchPercentage: 94
    },
    advice: [
      'Tiếp tục duy trì đam mê công nghệ thông qua các dự án khoa học kỹ thuật lớn hơn.',
      'Đăng ký tham gia câu lạc bộ tranh biện để cải thiện tốc độ phản xạ ngôn ngữ và kỹ năng thuyết trình.',
      'Học thêm các kỹ năng quản lý dự án Agile để tối ưu hóa khả năng làm việc nhóm.'
    ],
    isPortraitGenerated: true,
    createdAt: '2026-07-10T14:30:00Z'
  },
  {
    id: 'HS002',
    profile: {
      id: 'HS002',
      name: 'Trần Hoàng Nam',
      dob: '2008-11-22',
      class: '12A2',
      school: 'TRƯỜNG THCS & THPT THỰC NGHIỆM KHGD',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      hobbyDescription: 'Chụp ảnh nghệ thuật, tổ chức sự kiện học đường, bóng rổ',
      teacherInCharge: 'Thầy Lê Văn Thành'
    },
    academicScores: [
      { subjectName: 'Toán học', currentScore: 7.5, targetScore: 8.0, trend: 'stable' as const, favoriteLevel: 3 },
      { subjectName: 'Ngữ văn', currentScore: 8.5, targetScore: 9.0, trend: 'up' as const, favoriteLevel: 5 },
      { subjectName: 'Tiếng Anh', currentScore: 9.0, targetScore: 9.5, trend: 'up' as const, favoriteLevel: 5 },
      { subjectName: 'Lịch sử', currentScore: 8.2, targetScore: 8.5, trend: 'stable' as const, favoriteLevel: 4 },
      { subjectName: 'Địa lý', currentScore: 8.0, targetScore: 8.5, trend: 'up' as const, favoriteLevel: 4 },
      { subjectName: 'Thể dục', currentScore: 9.0, targetScore: 9.5, trend: 'up' as const, favoriteLevel: 5 }
    ],
    experientialActivities: [
      { activityName: 'Tổ chức Chương trình Trung thu / Sự kiện trường', val: 96 },
      { activityName: 'Đội trưởng CLB Bóng rổ học sinh', val: 95 },
      { activityName: 'Hoạt động Trại hè Thủ lĩnh trẻ học sinh', val: 92 },
      { activityName: 'Dự án Truyền thông học đường', val: 88 }
    ],
    survey: {
      q1_activities: ['Tổ chức sự kiện văn nghệ', 'Phát thanh viên học đường', 'Thi đấu thể thao bóng rổ'],
      q2_favoriteSubjects: ['Ngữ văn', 'Tiếng Anh'],
      q2_reason: 'Em thích viết lách, giao tiếp tiếng Anh với bạn bè quốc tế và tổ chức các hoạt động tập thể sôi nổi.',
      q3_teamRole: 'leader',
      q4_strengths: ['Giao tiếp và truyền cảm hứng', 'Tổ chức công việc đội nhóm', 'Phản ứng linh hoạt trước thay đổi'],
      q5_futureValues: ['Sự ảnh hưởng tích cực', 'Kết nối con người', 'Môi trường năng động, vui tươi'],
      q6_jobCharacteristics: ['Làm việc tương tác con người', 'Có yếu tố sáng tạo nội dung', 'Di chuyển và trải nghiệm thực tế'],
      q7_improvements: ['Kỹ năng tư duy logic số liệu', 'Kiên nhẫn khi làm việc chi tiết', 'Tự kiểm soát cảm xúc'],
      q8_proudAchievement: 'Làm trưởng ban tổ chức giải đấu bóng rổ nội bộ của trường, quyên góp được quỹ từ thiện hơn 10 triệu đồng.',
      q9_fieldsOfStudy: ['Truyền thông đa phương tiện', 'Quản trị sự kiện', 'Quan hệ công chúng (PR)'],
      q10_futureSelfThreeYears: 'Là chủ tịch câu lạc bộ sinh viên ngành Truyền thông, tự tin sản xuất các chương trình âm nhạc lớn đầy sáng tạo.'
    },
    strengths: [
      'Năng lực lãnh đạo tự nhiên, kết nối và dẫn dắt đội nhóm cực kỳ hiệu quả.',
      'Khả năng ngôn ngữ trôi chảy và kỹ năng giao tiếp thuyết phục.',
      'Sở hữu năng lượng tích cực, thích ứng nhanh với các sự kiện thay đổi đột ngột.'
    ],
    improvements: [
      'Nên rèn luyện tư duy số liệu chặt chẽ khi lập kế hoạch tài chính cho sự kiện.',
      'Tránh ôm đồm quá nhiều đầu việc mà cần tin tưởng phân quyền sâu cho các thành viên.'
    ],
    futureVision: {
      title: 'Chuyên gia Truyền thông / Giám đốc Quản trị Sự kiện',
      description: 'Lập kế hoạch, quản trị và sản xuất các sự kiện văn hóa, truyền thông, kết nối xã hội quy mô lớn.',
      matchPercentage: 92
    },
    advice: [
      'Tham gia các lớp bổ trợ về quản trị tài chính cơ bản hoặc thống kê số liệu truyền thông.',
      'Học thêm các công cụ quản lý tiến độ số như Trello, Notion để quản trị nhóm khoa học hơn.',
      'Tìm cơ hội thực tập sớm tại các văn phòng tổ chức sự kiện học sinh, sinh viên.'
    ],
    isPortraitGenerated: true,
    createdAt: '2026-07-11T09:15:00Z'
  },
  {
    id: 'HS003',
    profile: {
      id: 'HS003',
      name: 'Lê Quỳnh Chi',
      dob: '2010-08-05',
      class: '10A3',
      school: 'TRƯỜNG THCS & THPT THỰC NGHIỆM KHGD',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      hobbyDescription: 'Vẽ tranh minh họa, viết nhật ký, chơi đàn piano',
      teacherInCharge: 'Cô Phạm Thanh Mai'
    },
    academicScores: [
      { subjectName: 'Toán học', currentScore: 8.0, targetScore: 8.5, trend: 'up' as const, favoriteLevel: 4 },
      { subjectName: 'Mỹ thuật', currentScore: 9.5, targetScore: 9.8, trend: 'up' as const, favoriteLevel: 5 },
      { subjectName: 'Ng ngữ văn', currentScore: 8.8, targetScore: 9.2, trend: 'up' as const, favoriteLevel: 5 },
      { subjectName: 'Tiếng Anh', currentScore: 8.2, targetScore: 8.8, trend: 'stable' as const, favoriteLevel: 4 },
      { subjectName: 'Sinh học', currentScore: 7.8, targetScore: 8.0, trend: 'stable' as const, favoriteLevel: 3 }
    ],
    experientialActivities: [
      { activityName: 'Triển lãm tranh vẽ học sinh thủ đô', val: 94 },
      { activityName: 'Dự án thiết kế ấn phẩm báo chí trường', val: 92 },
      { activityName: 'Tham gia câu lạc bộ hội họa', val: 90 },
      { activityName: 'Hoạt động bảo tồn môi trường xanh', val: 82 }
    ],
    survey: {
      q1_activities: ['Vẽ tranh nghệ thuật', 'Thiết kế thời trang tái chế', 'Viết truyện ngắn học đường'],
      q2_favoriteSubjects: ['Mỹ thuật', 'Ngữ văn'],
      q2_reason: 'Vẽ tranh giúp em thể hiện thế giới nội tâm phong phú, còn văn học nuôi dưỡng sự đồng cảm của em với mọi người.',
      q3_teamRole: 'supporter',
      q4_strengths: ['Sáng tạo nghệ thuật thị giác', 'Cảm nhận thẩm mỹ tinh tế', 'Đồng cảm và thấu hiểu người khác'],
      q5_futureValues: ['Sự bình yên nội tâm', 'Tự do sáng tác nghệ thuật', 'Giúp đỡ mọi người bằng tình thương'],
      q6_jobCharacteristics: ['Môi trường làm việc yên tĩnh', 'Sáng tác không giới hạn', 'Ý nghĩa nhân văn sâu sắc'],
      q7_improvements: ['Kỹ năng từ chối áp lực', 'Tự tin phản biện bảo vệ ý kiến', 'Quản lý tài chính cá nhân'],
      q8_proudAchievement: 'Đạt giải Nhì cuộc thi Vẽ tranh vì môi trường xanh của học sinh quận Ba Đình với bức họa về mẹ thiên nhiên.',
      q9_fieldsOfStudy: ['Thiết kế đồ họa', 'Mỹ thuật tạo hình', 'Tâm lý học hành vi'],
      q10_futureSelfThreeYears: 'Là một nhà thiết kế đồ họa tự do tài hoa, có một phòng trưng bày tranh nhỏ của riêng mình.'
    },
    strengths: [
      'Gu thẩm mỹ xuất sắc và năng lực hội họa thiên bẩm.',
      'Sự thấu hiểu, đồng cảm cao, luôn là chỗ dựa tinh thần bình yên cho cả nhóm.',
      'Sự tỉ mỉ, kiên trì đặc biệt khi thực hiện các tác phẩm nghệ thuật chi tiết.'
    ],
    improvements: [
      'Cần rèn luyện tính quyết đoán và tự tin tranh biện bảo vệ ý tưởng cá nhân.',
      'Nên học cách ứng phó tích cực khi đối mặt với áp lực thời gian dồn dập.'
    ],
    futureVision: {
      title: 'Họa sĩ Minh họa / Chuyên viên Thiết kế Đồ họa',
      description: 'Thiết kế các ấn phẩm sách, minh họa truyện, truyền tải những thông điệp yêu thương cuộc sống qua nghệ thuật thị giác.',
      matchPercentage: 95
    },
    advice: [
      'Học thêm các phần mềm thiết kế chuyên sâu như Adobe Illustrator, Photoshop, Figma.',
      'Thử sức với vai trò người quản lý hoặc đại diện truyền thông cho một dự án mỹ thuật nhỏ của trường.',
      'Tham gia lớp rèn luyện kỹ năng sinh tồn và thích ứng để tăng tính dạn dĩ xã hội.'
    ],
    isPortraitGenerated: true,
    createdAt: '2026-07-12T15:45:00Z'
  }
];

// Hydrate reports with dynamic calculated competencies
export const mockStudents: StudentReport[] = rawMockStudents.map(s => {
  const normalizedScores = normalizeAndMergeSubjectScores(s.academicScores as any);
  const calculatedComp = calculateCompetencies(normalizedScores, s.experientialActivities, s.survey);
  return {
    ...s,
    academicScores: normalizedScores,
    competencies: calculatedComp
  };
});
