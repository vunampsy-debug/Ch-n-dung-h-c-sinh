/**
 * Normalize Vietnamese school subject names according to the requested guidelines:
 * 1. Map variations like "Toán học" or "Toán" to "Toán", "Tin học" or "Tin" to "Tin".
 * 2. Unify "Ngữ văn", "Ngữ văn học", "Văn", and "Văn học" into "Ngữ văn" to ensure no duplicates.
 * 3. General rule: strip " học" from the end of the subject name if present (e.g. Sinh học -> Sinh).
 */
export function normalizeSubjectName(name: string): string {
  if (!name) return '';
  const clean = name.trim();
  const lower = clean.toLowerCase();

  // Explicit mappings for common school subjects
  if (lower === 'toán học' || lower === 'toán') {
    return 'Toán';
  }
  if (lower === 'tin học' || lower === 'tin') {
    return 'Tin';
  }
  if (lower === 'sinh học' || lower === 'sinh') {
    return 'Sinh';
  }
  if (lower === 'hóa học' || lower === 'hóa') {
    return 'Hóa';
  }
  if (lower === 'vật lý học' || lower === 'vật lý' || lower === 'vật lí' || lower === 'vật lí học') {
    return 'Vật lý';
  }
  if (lower === 'địa lý học' || lower === 'địa lý' || lower === 'địa lí' || lower === 'địa lí học') {
    return 'Địa lý';
  }
  if (lower === 'công nghệ học' || lower === 'công nghệ') {
    return 'Công nghệ';
  }
  if (
    lower === 'ngữ văn học' || 
    lower === 'ngữ văn' || 
    lower === 'văn học' || 
    lower === 'văn' ||
    lower === 'ng ngữ văn'
  ) {
    return 'Ngữ văn';
  }
  if (lower === 'lịch sử học' || lower === 'lịch sử') {
    return 'Lịch sử';
  }
  if (lower === 'triết học' || lower === 'triết') {
    return 'Triết';
  }
  if (lower === 'khoa học') {
    return 'Khoa học';
  }

  // Fallback pattern: if it ends with " học" (case-insensitive) and is long enough, strip " học"
  if (lower.endsWith(' học') && clean.length > 4) {
    return clean.slice(0, -4).trim();
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
