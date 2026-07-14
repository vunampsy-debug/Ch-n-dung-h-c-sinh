import { SubjectScore, ExperientialActivity, SurveyResponse, CompetencyGroup } from '../types';

export function calculateCompetencies(
  academicScores: SubjectScore[],
  experiential: ExperientialActivity[],
  survey: SurveyResponse
): CompetencyGroup[] {
  // Helpers to get subject scores
  const getScore = (names: string[]): number => {
    const matches = academicScores.filter(s => 
      names.some(name => s.subjectName.toLowerCase().includes(name.toLowerCase()))
    );
    if (matches.length === 0) return 70; // default average
    
    const validScores = matches
      .filter(s => s.scoreType === 'numeric' || s.scoreType === 'pass_fail')
      .map(s => {
        if (s.scoreType === 'numeric') {
          return (s.score !== null && s.score !== undefined) ? s.score : (s.currentScore || 7.0);
        } else {
          return s.assessmentResult === 'Đạt' ? 8.5 : 4.0;
        }
      });

    if (validScores.length === 0) return 70;
    return (validScores.reduce((sum, val) => sum + val, 0) / validScores.length) * 10; // convert to 100 scale
  };

  const getExpValue = (nameKeywords: string[]): number => {
    const matches = experiential.filter(e =>
      nameKeywords.some(keyword => e.activityName.toLowerCase().includes(keyword.toLowerCase()))
    );
    if (matches.length === 0) return 75;
    return matches.reduce((sum, e) => sum + e.val, 0) / matches.length;
  };

  // 1. Năng lực Tự chủ & Tự học
  // Affected by target settings vs current performance, and self-reflection responses.
  let selfLearning = 70;
  const activeScores = academicScores.filter(s => s.scoreType === 'numeric' || s.scoreType === 'pass_fail');
  const avgAcademic = activeScores.length > 0 
    ? (activeScores.reduce((sum, s) => {
        if (s.scoreType === 'numeric') return sum + ((s.score !== null && s.score !== undefined) ? s.score : (s.currentScore || 0));
        return sum + (s.assessmentResult === 'Đạt' ? 8.5 : 4.0);
      }, 0) / activeScores.length) * 10 
    : 72;
  const avgTarget = activeScores.length > 0
    ? (activeScores.reduce((sum, s) => sum + (s.targetScore || (s.scoreType === 'numeric' ? ((s.score !== null && s.score !== undefined) ? s.score : 7.0) : 8.0)), 0) / activeScores.length) * 10
    : 85;
  const motivationBonus = Math.max(0, avgTarget - avgAcademic) * 0.5; // ambitious goals
  const studyHobbyBonus = survey.q2_favoriteSubjects.length * 4;
  selfLearning = Math.min(98, Math.max(45, (avgAcademic * 0.6 + 40) + motivationBonus + studyHobbyBonus));

  // 2. Năng lực Giao tiếp & Hợp tác
  // Affected by group role, experiential teamwork, and survey
  let communication = 65;
  const roleBonuses: Record<string, number> = {
    leader: 20,
    thinker: 10,
    mediator: 18,
    executor: 12,
    supporter: 15
  };
  const roleBonus = roleBonuses[survey.q3_teamRole] || 12;
  const communityExp = getExpValue(['hoạt động tập thể', 'đoàn đội', 'tình nguyện', 'xã hội', 'trải nghiệm', 'ngoại khóa']);
  communication = Math.min(98, Math.max(45, communityExp * 0.5 + roleBonus + 30));

  // 3. Năng lực Giải quyết vấn đề & Sáng tạo
  // Affected by STEM subjects, thinker role, future self reflection
  let problemSolving = 70;
  const stemAvg = getScore(['toán', 'vật lý', 'tin học', 'hóa học', 'khoa học']);
  const thinkerBonus = survey.q3_teamRole === 'thinker' || survey.q3_teamRole === 'leader' ? 12 : 5;
  const creativeBonus = survey.q4_strengths.some(s => s.toLowerCase().includes('sáng tạo') || s.toLowerCase().includes('tư duy')) ? 10 : 0;
  problemSolving = Math.min(98, Math.max(45, stemAvg * 0.6 + thinkerBonus + creativeBonus + 25));

  // 4. Năng lực Ngôn ngữ & Thẩm mỹ
  // Affected by Languages, Literature, Art, Music, and Hobby
  let languageAesthetics = 65;
  const langAvg = getScore(['ngữ văn', 'tiếng anh', 'âm nhạc', 'mỹ thuật', 'văn học', 'ngoại ngữ']);
  const artHobbyBonus = survey.q2_favoriteSubjects.some(s => s.toLowerCase().match(/(văn|anh|nhạc|họa|vẽ|nghệ thuật)/)) ? 12 : 5;
  languageAesthetics = Math.min(98, Math.max(45, langAvg * 0.6 + artHobbyBonus + 25));

  // 5. Năng lực Tính toán & Công nghệ
  // Affected by Math, IT, Technology
  let analyticalTech = 60;
  const mathTechAvg = getScore(['toán', 'tin học', 'vật lý', 'công nghệ']);
  const techHobbyBonus = survey.q6_jobCharacteristics.some(c => c.toLowerCase().includes('công nghệ') || c.toLowerCase().includes('kỹ thuật')) ? 12 : 0;
  analyticalTech = Math.min(98, Math.max(45, mathTechAvg * 0.7 + techHobbyBonus + 20));

  // 6. Năng lực Thể chất & Thích ứng
  // Affected by Physical Education, extracurricular, and Adaptability/Future self reflection
  let physicalAdaptability = 68;
  const physicalScore = getScore(['thể dục', 'giáo dục thể chất']);
  const sportExp = getExpValue(['thể thao', 'bóng đá', 'bóng rổ', 'bơi', 'võ thuật']);
  const activeBonus = survey.q1_activities.length * 3;
  physicalAdaptability = Math.min(98, Math.max(45, (physicalScore * 0.4 + sportExp * 0.4) + activeBonus + 20));

  const getLevel = (score: number): string => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 65) return 'Khá';
    if (score >= 50) return 'Trung bình';
    return 'Cần cố gắng';
  };

  const getDesc = (id: string, score: number): string => {
    const level = getLevel(score);
    const descriptions: Record<string, Record<string, string>> = {
      autonomy: {
        'Xuất sắc': 'Chủ động hoàn toàn trong việc lập kế hoạch học tập, tự tìm kiếm tài liệu và có tinh thần tự giác cực kỳ cao.',
        'Tốt': 'Có khả năng tự học tốt, biết xác định mục tiêu học tập và sắp xếp công việc cá nhân khoa học.',
        'Khá': 'Tự giác trong học tập, đôi lúc cần sự nhắc nhở từ thầy cô hoặc gia đình để duy trì mục tiêu.',
        'Trung bình': 'Khả năng tự học ở mức vừa phải, còn phụ thuộc nhiều vào hướng dẫn và giám sát của giáo viên.',
        'Cần cố gắng': 'Cần nỗ lực rèn luyện tính tự giác, rèn thói quen tự lập kế hoạch và chủ động tìm kiếm kiến thức.'
      },
      cooperation: {
        'Xuất sắc': 'Kỹ năng giao tiếp xuất sắc, luôn lắng nghe, chia sẻ và có năng lực lãnh đạo, hòa giải xung đột đội nhóm tuyệt vời.',
        'Tốt': 'Hợp tác hiệu quả với bạn bè, biết cách diễn đạt ý kiến rõ ràng và tôn trọng ý kiến tập thể.',
        'Khá': 'Tham gia tích cực vào các hoạt động nhóm, đôi khi còn rụt rè hoặc chưa chủ động bày tỏ quan điểm.',
        'Trung bình': 'Kỹ năng làm việc nhóm ở mức trung bình, có xu hướng làm việc độc lập hơn là phối hợp.',
        'Cần cố gắng': 'Cần cởi mở hơn, chủ động giao tiếp và học cách lắng nghe ý kiến của người khác để phối hợp tốt hơn.'
      },
      creativity: {
        'Xuất sắc': 'Tư duy độc lập nhạy bén, luôn đề xuất các giải pháp sáng tạo, đột phá trước các thử thách khó khăn.',
        'Tốt': 'Nhận diện vấn đề tốt, đưa ra được các ý tưởng mới mẻ và biết áp dụng kiến thức vào thực tế.',
        'Khá': 'Có khả năng giải quyết các bài toán cơ bản, mức độ sáng tạo ổn định nhưng cần phát huy thêm.',
        'Trung bình': 'Giải quyết vấn đề theo khuôn mẫu sẵn có, ít khi đề xuất các giải pháp mang tính đổi mới.',
        'Cần cố gắng': 'Cần kiên nhẫn hơn trước khó khăn, tích cực học hỏi cách suy nghĩ đa chiều để tăng sức sáng tạo.'
      },
      languages: {
        'Xuất sắc': 'Năng lực ngôn ngữ vượt trội, diễn đạt lưu loát cả nói và viết, có gu thẩm mỹ nghệ thuật tinh tế.',
        'Tốt': 'Sử dụng ngôn từ phong phú, giao tiếp tiếng Anh hoặc các ngôn ngữ khác tốt, có cảm thụ cái đẹp tốt.',
        'Khá': 'Diễn đạt ý kiến mạch lạc, rành mạch, có sự quan tâm và tham gia các hoạt động văn hóa nghệ thuật.',
        'Trung bình': 'Khả năng diễn đạt ở mức cơ bản, cảm thụ nghệ thuật chưa có nhiều điểm nổi bật.',
        'Cần cố gắng': 'Cần tích cực đọc sách, luyện viết và rèn luyện kỹ năng trình bày ý tưởng trước đám đông.'
      },
      analytical: {
        'Xuất sắc': 'Khả năng phân tích logic và tư duy định lượng cực kỳ sắc bén, nắm bắt nhanh và làm chủ công nghệ mới.',
        'Tốt': 'Tư duy tính toán mạch lạc, hiểu nhanh các thuật toán cơ bản và ứng dụng công nghệ hiệu quả.',
        'Khá': 'Tính toán chính xác, sử dụng thành thạo các thiết bị công nghệ hỗ trợ học tập hàng ngày.',
        'Trung bình': 'Xử lý các bài toán logic ở mức trung bình, cần nhiều thời gian để làm quen với công nghệ mới.',
        'Cần cố gắng': 'Cần thực hành nhiều bài tập tư duy logic, học cách sử dụng hiệu quả các công cụ số.'
      },
      physical: {
        'Xuất sắc': 'Thể lực tuyệt vời, năng động, có sức bền cao và khả năng thích ứng cực nhanh với môi trường mới.',
        'Tốt': 'Tích cực rèn luyện thân thể, có lối sống lành mạnh và phản ứng linh hoạt trước những thay đổi.',
        'Khá': 'Thể lực tốt, thích nghi ổn định với các hoạt động học tập dã ngoại, ngoại khóa.',
        'Trung bình': 'Ít khi tham gia các hoạt động thể thao, mức độ thích ứng môi trường mới còn chậm.',
        'Cần cố gắng': 'Cần nâng cao ý thức rèn luyện thể thao và tích cực tham gia các buổi dã ngoại tập thể.'
      }
    };

    return descriptions[id]?.[level] || 'Đang cập nhật đánh giá năng lực chi tiết.';
  };

  return [
    {
      id: 'autonomy',
      name: 'Tự chủ & Tự học',
      score: Math.round(selfLearning),
      level: getLevel(selfLearning),
      description: getDesc('autonomy', selfLearning)
    },
    {
      id: 'cooperation',
      name: 'Giao tiếp & Hợp tác',
      score: Math.round(communication),
      level: getLevel(communication),
      description: getDesc('cooperation', communication)
    },
    {
      id: 'creativity',
      name: 'Giải quyết vấn đề & Sáng tạo',
      score: Math.round(problemSolving),
      level: getLevel(problemSolving),
      description: getDesc('creativity', problemSolving)
    },
    {
      id: 'languages',
      name: 'Ngôn ngữ & Thẩm mỹ',
      score: Math.round(languageAesthetics),
      level: getLevel(languageAesthetics),
      description: getDesc('languages', languageAesthetics)
    },
    {
      id: 'analytical',
      name: 'Tính toán & Công nghệ',
      score: Math.round(analyticalTech),
      level: getLevel(analyticalTech),
      description: getDesc('analytical', analyticalTech)
    },
    {
      id: 'physical',
      name: 'Thể chất & Thích ứng',
      score: Math.round(physicalAdaptability),
      level: getLevel(physicalAdaptability),
      description: getDesc('physical', physicalAdaptability)
    }
  ];
}
