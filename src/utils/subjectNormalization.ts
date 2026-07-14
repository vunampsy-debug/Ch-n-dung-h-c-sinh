/**
 * Normalize Vietnamese school subject names according to the requested guidelines:
 * 1. Map variations to standard names like "Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Địa lí", "Mỹ thuật", "Hóa học", "Sinh học", "Tin học", "Lịch sử".
 * 2. Unify variations into standard form to ensure no duplicates.
 */
export function normalizeSubjectName(name: string): string {
  if (!name) return '';
  const clean = name.trim();
  const lower = clean.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,\-_]/g, '');

  // Explicit mappings for common school subjects as per standard list
  if (lower === 'toán học' || lower === 'toan hoc' || lower === 'toán' || lower === 'toan' || lower === 'math' || lower === 'maths' || lower === 'mathematics') {
    return 'Toán';
  }
  if (
    lower === 'văn' || 
    lower === 'van' || 
    lower === 'văn học' || 
    lower === 'van hoc' || 
    lower === 'ngữ văn' || 
    lower === 'ngu van' || 
    lower === 'ngu van hoc' || 
    lower === 'ngữ văn học' || 
    lower === 'literature' || 
    lower === 'vietnamese literature' || 
    lower === 'nv'
  ) {
    return 'Ngữ văn';
  }
  if (lower === 'tiếng anh' || lower === 'tieng anh' || lower === 'anh văn' || lower === 'anh van' || lower === 'anh' || lower === 'english' || lower === 'ta' || lower === 'av' || lower === 'eng') {
    return 'Tiếng Anh';
  }
  if (lower === 'vật lý học' || lower === 'vat ly hoc' || lower === 'vật lý' || lower === 'vat ly' || lower === 'vật lí' || lower === 'vat li' || lower === 'vật lí học' || lower === 'vat li hoc' || lower === 'lý' || lower === 'ly' || lower === 'lí' || lower === 'li' || lower === 'physics' || lower === 'vl') {
    return 'Vật lí';
  }
  if (lower === 'địa lý học' || lower === 'dia ly hoc' || lower === 'địa lý' || lower === 'dia ly' || lower === 'địa lí' || lower === 'dia li' || lower === 'địa lí học' || lower === 'dia li hoc' || lower === 'địa' || lower === 'dia' || lower === 'geography' || lower === 'đl' || lower === 'dl' || lower === 'geo') {
    return 'Địa lí';
  }
  if (lower === 'mĩ thuật' || lower === 'mi thuat' || lower === 'vẽ' || lower === 've' || lower === 'fine arts' || lower === 'visual arts' || lower === 'mt' || lower === 'mỹ thuật' || lower === 'my thuat') {
    return 'Mỹ thuật';
  }
  if (lower === 'hóa học' || lower === 'hoa hoc' || lower === 'hóa' || lower === 'hoa' || lower === 'chemistry' || lower === 'hh') {
    return 'Hóa học';
  }
  if (lower === 'sinh học' || lower === 'sinh hoc' || lower === 'sinh' || lower === 'biology' || lower === 'sh' || lower === 'bio') {
    return 'Sinh học';
  }
  if (lower === 'tin học' || lower === 'tin hoc' || lower === 'tin' || lower === 'cntt' || lower === 'it' || lower === 'ict' || lower === 'informatics' || lower === 'information technology' || lower === 'computer science') {
    return 'Tin học';
  }
  if (lower === 'công nghệ học' || lower === 'cong nghe hoc' || lower === 'công nghệ' || lower === 'cong nghe' || lower === 'kĩ thuật' || lower === 'ki thuat' || lower === 'kỹ thuật' || lower === 'ky thuat' || lower === 'technology' || lower === 'cn' || lower === 'cng') {
    return 'Công nghệ';
  }
  if (lower === 'lịch sử học' || lower === 'lich su hoc' || lower === 'lịch sử' || lower === 'lich su' || lower === 'sử' || lower === 'su' || lower === 'history' || lower === 'ls') {
    return 'Lịch sử';
  }
  if (lower === 'tiếng pháp' || lower === 'tieng phap' || lower === 'pháp' || lower === 'phap' || lower === 'pháp văn' || lower === 'phap van' || lower === 'french' || lower === 'tp' || lower === 'pv' || lower === 'fr') {
    return 'Tiếng Pháp';
  }
  if (lower === 'tiếng đức' || lower === 'tieng duc' || lower === 'đức' || lower === 'duc' || lower === 'đức văn' || lower === 'duc van' || lower === 'german' || lower === 'tđ' || lower === 'de') {
    return 'Tiếng Đức';
  }
  if (lower === 'tiếng nga' || lower === 'tieng nga' || lower === 'nga' || lower === 'nga văn' || lower === 'nga van' || lower === 'russian' || lower === 'tn' || lower === 'ru') {
    return 'Tiếng Nga';
  }
  if (lower === 'tiếng nhật' || lower === 'tieng nhat' || lower === 'nhật' || lower === 'nhat' || lower === 'nhật ngữ' || lower === 'nhat ngu' || lower === 'japanese' || lower === 'jp' || lower === 'ja') {
    return 'Tiếng Nhật';
  }
  if (lower === 'tiếng trung quốc' || lower === 'tieng trung quoc' || lower === 'tiếng trung' || lower === 'tieng trung' || lower === 'trung văn' || lower === 'trung van' || lower === 'hoa văn' || lower === 'hoa van' || lower === 'tiếng hoa' || lower === 'tieng hoa' || lower === 'chinese' || lower === 'tt' || lower === 'tq' || lower === 'hv' || lower === 'cn' || lower === 'zh') {
    return 'Tiếng Trung Quốc';
  }
  if (lower === 'tiếng hàn quốc' || lower === 'tieng han quoc' || lower === 'tiếng hàn' || lower === 'tieng han' || lower === 'hàn ngữ' || lower === 'han ngu' || lower === 'korean' || lower === 'hq' || lower === 'kr' || lower === 'ko') {
    return 'Tiếng Hàn Quốc';
  }
  if (lower === 'ngoại ngữ 1' || lower === 'ngoai ngu 1' || lower === 'ngoại ngữ i' || lower === 'ngoai ngu i' || lower === 'nn' || lower === 'nn1') {
    return 'Ngoại ngữ 1';
  }
  if (lower === 'ngoại ngữ 2' || lower === 'ngoai ngu 2' || lower === 'ngoại ngữ ii' || lower === 'ngoai ngu ii' || lower === 'nn2' || lower === 'second foreign language') {
    return 'Ngoại ngữ 2';
  }
  if (lower === 'khoa học tự nhiên' || lower === 'khoa hoc tu nhien' || lower === 'khtn' || lower === 'khoa học tn' || lower === 'khoa hoc tn' || lower === 'natural science' || lower === 'science') {
    return 'Khoa học tự nhiên';
  }
  if (
    lower === 'lịch sử và địa lí' || 
    lower === 'lich su va dia li' || 
    lower === 'lịch sử địa lí' || 
    lower === 'lich su dia li' || 
    lower === 'lịch sử & địa lí' || 
    lower === 'lịch sử - địa lí' || 
    lower === 'sử và địa' || 
    lower === 'su va dia' || 
    lower === 'sử - địa' || 
    lower === 'ls&đl' || 
    lower === 'ls-đl' || 
    lower === 'lịch sử và địa lý' || 
    lower === 'lich su va dia ly' || 
    lower === 'lịch sử địa lý' || 
    lower === 'lich su dia ly'
  ) {
    return 'Lịch sử và Địa lí';
  }
  if (lower === 'giáo dục công dân' || lower === 'giao duc cong dan' || lower === 'công dân' || lower === 'cong dan' || lower === 'gd công dân' || lower === 'gd cong dan' || lower === 'gdcd' || lower === 'cd' || lower === 'civic education') {
    return 'Giáo dục công dân';
  }
  if (
    lower === 'giáo dục kinh tế và pháp luật' || 
    lower === 'giao duc kinh te va phap luat' || 
    lower === 'giáo dục kinh tế & pháp luật' || 
    lower === 'kinh tế và pháp luật' || 
    lower === 'kinh tế pháp luật' || 
    lower === 'gdktpl' || 
    lower === 'gdkt&pl' || 
    lower === 'ktpl'
  ) {
    return 'Giáo dục kinh tế và pháp luật';
  }
  if (lower === 'nghệ thuật' || lower === 'nghe thuat' || lower === 'arts' || lower === 'nt') {
    return 'Nghệ thuật';
  }
  if (lower === 'âm nhạc' || lower === 'am nhac' || lower === 'nhạc' || lower === 'nhac' || lower === 'music' || lower === 'an' || lower === 'ân') {
    return 'Âm nhạc';
  }
  if (lower === 'giáo dục thể chất' || lower === 'giao duc the chat' || lower === 'thể dục' || lower === 'the duc' || lower === 'thể chất' || lower === 'the chat' || lower === 'physical education' || lower === 'pe' || lower === 'gdtc' || lower === 'td') {
    return 'Giáo dục thể chất';
  }
  if (lower === 'giáo dục quốc phòng và an ninh' || lower === 'giao duc quoc phong va an ninh' || lower === 'quốc phòng' || lower === 'quoc phong' || lower === 'quốc phòng và an ninh' || lower === 'gdqp' || lower === 'gdqpan' || lower === 'gdqp-an' || lower === 'qpan' || lower === 'qp') {
    return 'Giáo dục quốc phòng và an ninh';
  }
  if (
    lower === 'hoạt động trải nghiệm hướng nghiệp' || 
    lower === 'hoat dong trai nghiem huong nghiep' || 
    lower === 'hoạt động trải nghiệm, hướng nghiệp' || 
    lower === 'trải nghiệm hướng nghiệp' || 
    lower === 'hoạt động trải nghiệm' || 
    lower === 'hướng nghiệp' || 
    lower === 'hđtnhn' || 
    lower === 'hđtn-hn' || 
    lower === 'tnhn' || 
    lower === 'hđtn'
  ) {
    return 'Hoạt động trải nghiệm, hướng nghiệp';
  }
  if (lower === 'nội dung giáo dục của địa phương' || lower === 'noi dung giao duc cua dia phuong' || lower === 'giáo dục địa phương' || lower === 'giao duc dia phuong' || lower === 'nội dung địa phương' || lower === 'chương trình địa phương' || lower === 'gdđp' || lower === 'gddp' || lower === 'ndgdđp') {
    return 'Nội dung giáo dục của địa phương';
  }
  if (lower === 'tiếng dân tộc thiểu số' || lower === 'tieng dan toc thieu so' || lower === 'tiếng dân tộc' || lower === 'tieng dan toc' || lower === 'ngôn ngữ dân tộc' || lower === 'tdt' || lower === 'tdtts') {
    return 'Tiếng dân tộc thiểu số';
  }
  if (lower === 'chuyên đề học tập' || lower === 'chuyen de hoc tap' || lower === 'chuyên đề' || lower === 'chuyen de' || lower === 'chuyên đề lựa chọn' || lower === 'cđht' || lower === 'cdht') {
    return 'Chuyên đề học tập';
  }

  // School-specific subjects to remain unchanged
  const isSchoolSpecific = ['wellbeing', 'pdp', 'project', 'stem', 'robotics', 'kĩ năng sống', 'ki nang song', 'well-being'].some(
    s => lower.includes(s)
  );
  if (isSchoolSpecific) {
    if (lower.includes('well-being') || lower.includes('wellbeing')) {
      return 'Wellbeing';
    }
    return clean;
  }

  // Otherwise, return capitalized first letter name
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Normalizes an array of subject scores by merging scores of the same subject name.
 * If there are multiple entries for the same normalized subject, they are merged.
 * Merge strategy: average the scores (or take the latest/highest, averaging is standard or we take the average/latest).
 * Let's average the scores and maximize/average target scores.
 */
import { SubjectScore } from '../types';

export function normalizeAndMergeSubjectScores(scores: SubjectScore[]): SubjectScore[] {
  const mergedMap: { [normalizedName: string]: SubjectScore[] } = {};

  scores.forEach(score => {
    const normName = normalizeSubjectName(score.subjectName);
    if (!mergedMap[normName]) {
      mergedMap[normName] = [];
    }
    mergedMap[normName].push(score);
  });

  return Object.entries(mergedMap).map(([normName, items]) => {
    if (items.length === 1) {
      return {
        ...items[0],
        subjectName: normName
      };
    }

    // Merge duplicates by averaging their current/target scores
    const currentSum = items.reduce((sum, item) => sum + item.currentScore, 0);
    const targetSum = items.reduce((sum, item) => sum + item.targetScore, 0);
    const favLevelMax = items.reduce((max, item) => Math.max(max, item.favoriteLevel), 0);
    const trend = items[items.length - 1].trend; // Take trend of the last one

    return {
      subjectName: normName,
      currentScore: Math.round((currentSum / items.length) * 10) / 10,
      targetScore: Math.round((targetSum / items.length) * 10) / 10,
      trend,
      favoriteLevel: favLevelMax
    };
  });
}
