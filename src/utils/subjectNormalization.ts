import { SubjectScore } from '../types';

/**
 * Normalizes assessment results for FSchool special subjects.
 * Mapped to standard results: 'Đạt' or 'Không đạt'
 */
export function normalizeAssessmentResult(val: any): 'Đạt' | 'Không đạt' | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().toLowerCase();
  if (!str) return null;

  const passStrings = ['đ', 'đạt', 'dat', 'd', 'pass', 'hoàn thành', 'ht', 'đạt yêu cầu', 'dat yeu cau', 'hoan thanh'];
  const failStrings = ['kđ', 'kd', 'không đạt', 'khong dat', 'cđ', 'cd', 'chưa đạt', 'chua dat', 'fail', 'chưa hoàn thành', 'cht', 'không đạt yêu cầu', 'khong dat yeu cau', 'chua hoan thanh'];

  if (passStrings.includes(str)) return 'Đạt';
  if (failStrings.includes(str)) return 'Không đạt';

  // Fallback for numbers
  const parsedNum = parseFloat(str);
  if (!isNaN(parsedNum)) {
    return parsedNum >= 5 ? 'Đạt' : 'Không đạt';
  }

  return null;
}

/**
 * Normalize Vietnamese school subject names according to FSchool guidelines:
 * 1. Standard subjects: "Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Địa lí", "Mỹ thuật", "Hóa học", "Sinh học", "Tin học", "Lịch sử", etc.
 * 2. FSchool Special subjects:
 *    - "Vovinam"
 *    - "PDP" (unifying Wellbeing, Project, Skills, Thinking, etc.)
 *    - "STEM-AI" (unifying STEM-AI variants, keeping pure STEM as STEM)
 */
export function normalizeSubjectName(name: string): string {
  if (!name) return '';
  const clean = name.trim();
  const lower = clean.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // 1. VOVINAM
  const isVovinam = 
    lower === 'vvn' ||
    lower.includes('vovinam') ||
    lower.includes('việt võ đạo') ||
    lower.includes('viet vo dao') ||
    lower.includes('việt võ dạo') ||
    lower.includes('viet vo dạo') ||
    lower.includes('võ thuật') ||
    lower.includes('vo thuat');
  if (isVovinam) {
    return 'Vovinam';
  }

  // 2. STEM-AI
  // Note: Do NOT match plain 'STEM' or 'STEAM' to 'STEM-AI'
  const isStemAi = 
    (lower.includes('stem') && (lower.includes('ai') || lower.includes('trí tuệ nhân tạo') || lower.includes('tri tue nhan tao'))) ||
    (lower.includes('steam') && (lower.includes('ai') || lower.includes('trí tuệ nhân tạo') || lower.includes('tri tue nhan tao')));
  if (isStemAi && lower !== 'stem' && lower !== 'steam') {
    return 'STEM-AI';
  }

  // 3. PDP
  // Check Wellbeing Group
  const isWellbeing = 
    lower.includes('wellbeing') ||
    lower.includes('well-being') ||
    lower.includes('well being') ||
    lower.includes('sức khỏe và hạnh phúc') ||
    lower.includes('suc khoe va hanh phuc') ||
    lower.includes('sức khỏe tinh thần') ||
    lower.includes('suc khoe tinh than') ||
    lower.includes('chăm sóc sức khỏe') ||
    lower.includes('cham soc suc khoe') ||
    lower === 'wb';

  // Check Project Group
  const isProject = 
    lower.includes('project') ||
    lower.includes('dự án') ||
    lower.includes('du an') ||
    lower.includes('pbl') ||
    lower.includes('project-based') ||
    lower.includes('project based');

  // Check Soft & Life Skills Group
  const isSkills = 
    lower.includes('kỹ năng') ||
    lower.includes('kĩ năng') ||
    lower.includes('ky nang') ||
    lower.includes('ki nang') ||
    lower.includes('soft skill') ||
    lower.includes('life skill') ||
    lower.includes('teamwork') ||
    lower.includes('leadership');

  // Check Thinking Group
  const isThinking = 
    lower.includes('tư duy') ||
    lower.includes('tu duy') ||
    lower.includes('thinking');

  // Check Personal Development Group
  const isPersonalDev = 
    lower.includes('pdp') ||
    lower.includes('phát triển cá nhân') ||
    lower.includes('phat trien ca nhan') ||
    lower.includes('personal development');

  if (isWellbeing || isProject || isSkills || isThinking || isPersonalDev) {
    return 'PDP';
  }

  // Standard subject names mapping (lowercase without punctuation)
  const cleanLower = lower.replace(/[.,\-_]/g, '').trim();

  if (cleanLower === 'toán học' || cleanLower === 'toan hoc' || cleanLower === 'toán' || cleanLower === 'toan' || cleanLower === 'math' || cleanLower === 'maths' || cleanLower === 'mathematics') {
    return 'Toán';
  }
  if (
    cleanLower === 'văn' || 
    cleanLower === 'van' || 
    cleanLower === 'văn học' || 
    cleanLower === 'van hoc' || 
    cleanLower === 'ngữ văn' || 
    cleanLower === 'ngu van' || 
    cleanLower === 'ngu van hoc' || 
    cleanLower === 'ngữ văn học' || 
    cleanLower === 'literature' || 
    cleanLower === 'vietnamese literature' || 
    cleanLower === 'nv'
  ) {
    return 'Ngữ văn';
  }
  if (cleanLower === 'tiếng anh' || cleanLower === 'tieng anh' || cleanLower === 'anh văn' || cleanLower === 'anh van' || cleanLower === 'anh' || cleanLower === 'english' || cleanLower === 'ta' || cleanLower === 'av' || cleanLower === 'eng') {
    return 'Tiếng Anh';
  }
  if (cleanLower === 'vật lý học' || cleanLower === 'vat ly hoc' || cleanLower === 'vật lý' || cleanLower === 'vat ly' || cleanLower === 'vật lí' || cleanLower === 'vat li' || cleanLower === 'vật lí học' || cleanLower === 'vat li hoc' || cleanLower === 'lý' || cleanLower === 'ly' || cleanLower === 'lí' || cleanLower === 'li' || cleanLower === 'physics' || cleanLower === 'vl') {
    return 'Vật lí';
  }
  if (cleanLower === 'địa lý học' || cleanLower === 'dia ly hoc' || cleanLower === 'địa lý' || cleanLower === 'dia ly' || cleanLower === 'địa lí' || cleanLower === 'dia li' || cleanLower === 'địa lí học' || cleanLower === 'dia li hoc' || cleanLower === 'địa' || cleanLower === 'dia' || cleanLower === 'geography' || cleanLower === 'đl' || cleanLower === 'dl' || cleanLower === 'geo') {
    return 'Địa lí';
  }
  if (cleanLower === 'mĩ thuật' || cleanLower === 'mi thuat' || cleanLower === 'vẽ' || cleanLower === 've' || cleanLower === 'fine arts' || cleanLower === 'visual arts' || cleanLower === 'mt' || cleanLower === 'mỹ thuật' || cleanLower === 'my thuat') {
    return 'Mỹ thuật';
  }
  if (cleanLower === 'hóa học' || cleanLower === 'hoa hoc' || cleanLower === 'hóa' || cleanLower === 'hoa' || cleanLower === 'chemistry' || cleanLower === 'hh') {
    return 'Hóa học';
  }
  if (cleanLower === 'sinh học' || cleanLower === 'sinh hoc' || cleanLower === 'sinh' || cleanLower === 'biology' || cleanLower === 'sh' || cleanLower === 'bio') {
    return 'Sinh học';
  }
  if (cleanLower === 'tin học' || cleanLower === 'tin hoc' || cleanLower === 'tin' || cleanLower === 'cntt' || cleanLower === 'it' || cleanLower === 'ict' || cleanLower === 'informatics' || cleanLower === 'information technology' || cleanLower === 'computer science') {
    return 'Tin học';
  }
  if (cleanLower === 'công nghệ học' || cleanLower === 'cong nghe hoc' || cleanLower === 'công nghệ' || cleanLower === 'cong nghe' || cleanLower === 'kĩ thuật' || cleanLower === 'ki thuat' || cleanLower === 'kỹ thuật' || cleanLower === 'ky thuat' || cleanLower === 'technology' || cleanLower === 'cn' || cleanLower === 'cng') {
    return 'Công nghệ';
  }
  if (cleanLower === 'lịch sử học' || cleanLower === 'lich su hoc' || cleanLower === 'lịch sử' || cleanLower === 'lich su' || cleanLower === 'sử' || cleanLower === 'su' || cleanLower === 'history' || cleanLower === 'ls') {
    return 'Lịch sử';
  }
  if (cleanLower === 'tiếng pháp' || cleanLower === 'tieng phap' || cleanLower === 'pháp' || cleanLower === 'phap' || cleanLower === 'pháp văn' || cleanLower === 'phap van' || cleanLower === 'french' || cleanLower === 'tp' || cleanLower === 'pv' || cleanLower === 'fr') {
    return 'Tiếng Pháp';
  }
  if (cleanLower === 'tiếng đức' || cleanLower === 'tieng duc' || cleanLower === 'đức' || cleanLower === 'duc' || cleanLower === 'đức văn' || cleanLower === 'duc van' || cleanLower === 'german' || cleanLower === 'tđ' || cleanLower === 'de') {
    return 'Tiếng Đức';
  }
  if (cleanLower === 'tiếng nga' || cleanLower === 'tieng nga' || cleanLower === 'nga' || cleanLower === 'nga văn' || cleanLower === 'nga van' || cleanLower === 'russian' || cleanLower === 'tn' || cleanLower === 'ru') {
    return 'Tiếng Nga';
  }
  if (cleanLower === 'tiếng nhật' || cleanLower === 'tieng nhat' || cleanLower === 'nhật' || cleanLower === 'nhat' || cleanLower === 'nhật ngữ' || cleanLower === 'nhat ngu' || cleanLower === 'japanese' || cleanLower === 'jp' || cleanLower === 'ja') {
    return 'Tiếng Nhật';
  }
  if (cleanLower === 'tiếng trung quốc' || cleanLower === 'tieng trung quoc' || cleanLower === 'tiếng trung' || cleanLower === 'tieng trung' || cleanLower === 'trung văn' || cleanLower === 'trung van' || cleanLower === 'hoa văn' || cleanLower === 'hoa van' || cleanLower === 'tiếng hoa' || cleanLower === 'tieng hoa' || cleanLower === 'chinese' || cleanLower === 'tt' || cleanLower === 'tq' || cleanLower === 'hv' || cleanLower === 'cn' || cleanLower === 'zh') {
    return 'Tiếng Trung Quốc';
  }
  if (cleanLower === 'tiếng hàn quốc' || cleanLower === 'tieng han quoc' || cleanLower === 'tiếng hàn' || cleanLower === 'tieng han' || cleanLower === 'hàn ngữ' || cleanLower === 'han ngu' || cleanLower === 'korean' || cleanLower === 'hq' || cleanLower === 'kr' || cleanLower === 'ko') {
    return 'Tiếng Hàn Quốc';
  }
  if (cleanLower === 'ngoại ngữ 1' || cleanLower === 'ngoai ngu 1' || cleanLower === 'ngoại ngữ i' || cleanLower === 'ngoai ngu i' || cleanLower === 'nn' || cleanLower === 'nn1') {
    return 'Ngoại ngữ 1';
  }
  if (cleanLower === 'ngoại ngữ 2' || cleanLower === 'ngoai ngu 2' || cleanLower === 'ngoại ngữ ii' || cleanLower === 'ngoai ngu ii' || cleanLower === 'nn2' || cleanLower === 'second foreign language') {
    return 'Ngoại ngữ 2';
  }
  if (cleanLower === 'khoa học tự nhiên' || cleanLower === 'khoa hoc tu nhien' || cleanLower === 'khtn' || cleanLower === 'khoa học tn' || cleanLower === 'khoa hoc tn' || cleanLower === 'natural science' || cleanLower === 'science') {
    return 'Khoa học tự nhiên';
  }
  if (
    cleanLower === 'lịch sử và địa lí' || 
    cleanLower === 'lich su va dia li' || 
    cleanLower === 'lịch sử địa lí' || 
    cleanLower === 'lich su dia li' || 
    cleanLower === 'lịch sử & địa lí' || 
    cleanLower === 'lịch sử - địa lí' || 
    cleanLower === 'sử và địa' || 
    cleanLower === 'su va dia' || 
    cleanLower === 'sử - địa' || 
    cleanLower === 'ls&đl' || 
    cleanLower === 'ls-đl' || 
    cleanLower === 'lịch sử và địa lý' || 
    cleanLower === 'lich su va dia ly' || 
    cleanLower === 'lịch sử địa lý' || 
    cleanLower === 'lich su dia ly'
  ) {
    return 'Lịch sử và Địa lí';
  }
  if (cleanLower === 'giáo dục công dân' || cleanLower === 'giao duc cong dan' || cleanLower === 'công dân' || cleanLower === 'cong dan' || cleanLower === 'gd công dân' || cleanLower === 'gd cong dan' || cleanLower === 'gdcd' || cleanLower === 'cd' || cleanLower === 'civic education') {
    return 'Giáo dục công dân';
  }
  if (
    cleanLower === 'giáo dục kinh tế và pháp luật' || 
    cleanLower === 'giao duc kinh te va phap luat' || 
    cleanLower === 'giáo dục kinh tế & pháp luật' || 
    cleanLower === 'kinh tế và pháp luật' || 
    cleanLower === 'kinh tế pháp luật' || 
    cleanLower === 'gdktpl' || 
    cleanLower === 'gdkt&pl' || 
    cleanLower === 'ktpl'
  ) {
    return 'Giáo dục kinh tế và pháp luật';
  }
  if (cleanLower === 'nghệ thuật' || cleanLower === 'nghe thuat' || cleanLower === 'arts' || cleanLower === 'nt') {
    return 'Nghệ thuật';
  }
  if (cleanLower === 'âm nhạc' || cleanLower === 'am nhac' || cleanLower === 'nhạc' || cleanLower === 'nhac' || cleanLower === 'music' || cleanLower === 'an' || cleanLower === 'ân') {
    return 'Âm nhạc';
  }
  if (cleanLower === 'giáo dục thể chất' || cleanLower === 'giao duc the chat' || cleanLower === 'thể dục' || cleanLower === 'the duc' || cleanLower === 'thể chất' || cleanLower === 'the chat' || cleanLower === 'physical education' || cleanLower === 'pe' || cleanLower === 'gdtc' || cleanLower === 'td') {
    return 'Giáo dục thể chất';
  }
  if (cleanLower === 'giáo dục quốc phòng và an ninh' || cleanLower === 'giao duc quoc phong va an ninh' || cleanLower === 'quốc phòng' || cleanLower === 'quoc phong' || cleanLower === 'quốc phòng và an ninh' || cleanLower === 'gdqp' || cleanLower === 'gdqpan' || cleanLower === 'gdqp-an' || cleanLower === 'qpan' || cleanLower === 'qp') {
    return 'Giáo dục quốc phòng và an ninh';
  }
  if (
    cleanLower === 'hoạt động trải nghiệm hướng nghiệp' || 
    cleanLower === 'hoat dong trai nghiem huong nghiep' || 
    cleanLower === 'hoạt động trải nghiệm, hướng nghiệp' || 
    cleanLower === 'trải nghiệm hướng nghiệp' || 
    cleanLower === 'hoạt động trải nghiệm' || 
    cleanLower === 'hướng nghiệp' || 
    cleanLower === 'hđtnhn' || 
    cleanLower === 'hđtn-hn' || 
    cleanLower === 'tnhn' || 
    cleanLower === 'hđtn'
  ) {
    return 'Hoạt động trải nghiệm, hướng nghiệp';
  }
  if (cleanLower === 'nội dung giáo dục của địa phương' || cleanLower === 'noi dung giao duc cua dia phuong' || cleanLower === 'giáo dục địa phương' || cleanLower === 'giao duc dia phuong' || cleanLower === 'nội dung địa phương' || cleanLower === 'chương trình địa phương' || cleanLower === 'gdđp' || cleanLower === 'gddp' || cleanLower === 'ndgdđp') {
    return 'Nội dung giáo dục của địa phương';
  }
  if (cleanLower === 'tiếng dân tộc thiểu số' || cleanLower === 'tieng dan toc thieu so' || cleanLower === 'tiếng dân tộc' || cleanLower === 'tieng dan toc' || cleanLower === 'ngôn ngữ dân tộc' || cleanLower === 'tdt' || cleanLower === 'tdtts') {
    return 'Tiếng dân tộc thiểu số';
  }
  if (cleanLower === 'chuyên đề học tập' || cleanLower === 'chuyen de hoc tap' || cleanLower === 'chuyên đề' || cleanLower === 'chuyen de' || cleanLower === 'chuyên đề lựa chọn' || cleanLower === 'cđht' || cleanLower === 'cdht') {
    return 'Chuyên đề học tập';
  }

  // Pure STEM school specific subject
  if (cleanLower === 'stem') {
    return 'STEM';
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Normalizes an array of subject scores by merging scores of the same subject name.
 * Respects special FSchool merge rules for PDP, Vovinam, STEM-AI:
 * 1. Mapped to PDP, Vovinam, STEM-AI.
 * 2. Default assessment format: Đạt/Không đạt.
 * 3. Never average multiple records for special subjects; instead, pick the most recent (last entered)
 *    unless a specific "tổng kết" / "summary" record is present (which is prioritized).
 */
export function normalizeAndMergeSubjectScores(scores: SubjectScore[]): SubjectScore[] {
  const mergedMap: { [normalizedName: string]: SubjectScore[] } = {};

  scores.forEach(score => {
    const rawName = score.subjectName;
    const normName = normalizeSubjectName(rawName);
    
    const isSpecial = normName === 'Vovinam' || normName === 'PDP' || normName === 'STEM-AI' || normName === 'Giáo dục thể chất' || normName === 'Giáo dục quốc phòng và an ninh' || normName === 'Hoạt động trải nghiệm, hướng nghiệp' || normName === 'Nội dung giáo dục của địa phương';
    
    // Determine the imported or raw score
    const rawScore = score.score !== undefined && score.score !== null ? score.score : score.currentScore;
    
    let scoreType: 'numeric' | 'pass_fail' | 'not_available' = 'numeric';
    let assessmentResult: 'Đạt' | 'Không đạt' | null = null;
    let finalScore: number | null = null;
    
    if (isSpecial) {
      // 1. Check if the cell represents a standard pass/fail string
      const textResult = score.assessmentResult || (typeof rawScore === 'string' ? rawScore : null);
      const normalizedResult = normalizeAssessmentResult(textResult);
      
      if (normalizedResult) {
        scoreType = 'pass_fail';
        assessmentResult = normalizedResult;
        finalScore = null;
      } else if (rawScore !== undefined && rawScore !== null && !isNaN(Number(rawScore))) {
        // If it's a numeric score, we check if it is a default slider placeholder or real data
        const numVal = Number(rawScore);
        if (score.scoreType === 'numeric') {
          scoreType = 'numeric';
          finalScore = numVal;
          assessmentResult = null;
        } else {
          // Default to pass/fail based on the number
          scoreType = 'pass_fail';
          assessmentResult = numVal >= 5 ? 'Đạt' : 'Không đạt';
          finalScore = null;
        }
      } else {
        // No valid data
        scoreType = 'not_available';
        assessmentResult = null;
        finalScore = null;
      }
    } else {
      // Regular subjects are numeric
      scoreType = 'numeric';
      finalScore = (rawScore !== undefined && rawScore !== null && !isNaN(Number(rawScore))) ? Number(rawScore) : 7.0;
    }

    const currentScore = finalScore !== null ? finalScore : (assessmentResult === 'Đạt' ? 8.5 : 4.0);

    const sanitized: SubjectScore = {
      ...score,
      subjectName: normName,
      originalSubjectName: score.originalSubjectName || rawName,
      scoreType,
      score: finalScore,
      assessmentResult,
      currentScore,
      targetScore: score.targetScore !== undefined && score.targetScore !== null ? score.targetScore : 8.5,
      favoriteLevel: score.favoriteLevel !== undefined && score.favoriteLevel !== null ? score.favoriteLevel : 3,
      trend: score.trend || 'stable'
    };

    if (!mergedMap[normName]) {
      mergedMap[normName] = [];
    }
    mergedMap[normName].push(sanitized);
  });

  return Object.entries(mergedMap).map(([normName, items]) => {
    if (items.length === 1) {
      return items[0];
    }

    const isSpecial = normName === 'Vovinam' || normName === 'PDP' || normName === 'STEM-AI' || normName === 'Giáo dục thể chất' || normName === 'Giáo dục quốc phòng và an ninh' || normName === 'Hoạt động trải nghiệm, hướng nghiệp' || normName === 'Nội dung giáo dục của địa phương';

    if (isSpecial) {
      // Rule: Find if any item is a summary row ("tổng kết")
      const isSummaryRow = (item: SubjectScore) => {
        const orig = (item.originalSubjectName || item.subjectName || '').toLowerCase();
        return orig.includes('tổng kết') || orig.includes('tong ket') || orig.includes('chung') || orig.includes('summary') || orig.includes('tb');
      };

      const summaryItems = items.filter(isSummaryRow);
      
      // If there are summary items, use the last summary item.
      // Otherwise, use the last item in the sequence (the most recent import).
      const chosenItem = summaryItems.length > 0 
        ? summaryItems[summaryItems.length - 1] 
        : items[items.length - 1];

      return {
        ...chosenItem,
        subjectName: normName,
        reason: summaryItems.length > 0 ? `Ưu tiên cột tổng kết "${chosenItem.originalSubjectName}".` : undefined
      };
    } else {
      // Standard subjects: Average their scores
      const validScoreItems = items.filter(item => item.scoreType === 'numeric' && item.score !== null);
      const avgScore = validScoreItems.length > 0
        ? validScoreItems.reduce((sum, item) => sum + (item.score || 0), 0) / validScoreItems.length
        : items.reduce((sum, item) => sum + item.currentScore, 0) / items.length;

      const targetSum = items.reduce((sum, item) => sum + item.targetScore, 0);
      const favLevelMax = items.reduce((max, item) => Math.max(max, item.favoriteLevel), 0);
      const lastItem = items[items.length - 1];

      return {
        ...lastItem,
        subjectName: normName,
        scoreType: 'numeric',
        score: Math.round(avgScore * 10) / 10,
        currentScore: Math.round(avgScore * 10) / 10,
        targetScore: Math.round((targetSum / items.length) * 10) / 10,
        favoriteLevel: favLevelMax,
        trend: lastItem.trend
      };
    }
  });
}
