import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, Download, Award, TrendingUp, TrendingDown, Minus, 
  BookOpen, Calendar, Compass, User, Sparkles, Star, ChevronRight, FileText
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { StudentReport } from '../types';
import { normalizeSubjectName } from '../utils/subjectNormalization';

interface A4PortraitPreviewProps {
  report: StudentReport;
}

export default function A4PortraitPreview({ report }: A4PortraitPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const targetWidth = 794; // approx 210mm at 96dpi
        const padding = 32; // 2rem padding roughly
        const availableWidth = parentWidth - padding;

        if (availableWidth < targetWidth) {
          setScale(availableWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Convert competencies for Recharts Radar chart
  const radarData = report.competencies.map(c => ({
    subject: c.name,
    A: c.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      
      {/* Floating Controller Panel (Don't Print) */}
      <div className="no-print bg-slate-800 text-white p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
            <FileText className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Xem trước hồ sơ chuẩn A4</h4>
            <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
              Phần này được tối ưu kích thước chuẩn hóa để in ấn hoặc xuất tệp tin PDF làm học bạ.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/15 transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Bản Chân Dung (A4 PDF)</span>
          </button>
        </div>
      </div>

      <div className="no-print text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
        <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <span>Mẹo nhỏ: Khi hộp thoại in mở ra, hãy bật <strong>"In hình nền/Background graphics"</strong> và chọn khổ giấy <strong>A4</strong> để bản in sắc nét, đầy đủ màu sắc nhất.</span>
      </div>

      {/* A4 Container (Centered, shadow-on-screen, white-background) */}
      <div 
        ref={containerRef}
        className="flex flex-col items-center bg-slate-100/50 print:bg-transparent p-2 sm:p-4 md:p-6 print:p-0 rounded-3xl print:rounded-none border border-slate-200 print:border-none overflow-hidden print:overflow-visible w-full relative"
      >
        <div 
          className="flex flex-col items-center gap-8 origin-top transition-transform duration-200 print-scale-reset"
          style={{ 
            transform: `scale(${scale})`,
            marginBottom: scale < 1 ? `-${(1 - scale) * 2277}px` : '0px'
          }}
        >
        
        {/* Style block for perfect standard A4 printing and page splits */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .print-scale-reset {
              transform: none !important;
              margin-bottom: 0 !important;
            }
            .a4-page {
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              page-break-after: always;
              break-after: page;
              width: 210mm !important;
              height: 297mm !important;
              padding: 12mm 15mm !important;
              box-sizing: border-box !important;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
          }
        ` }} />

        {/* ================= PAGE 1 ================= */}
        <div 
          ref={printRef}
          className="a4-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] border border-slate-200 shadow-2xl relative text-slate-900 flex flex-col justify-between"
          id="a4-print-element-p1"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {/* Header Block */}
          <div className="space-y-4">
            
            {/* Top Logo / School Line */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Sở GD&ĐT Thành phố Hà Nội</p>
                <p className="text-[10px] font-black uppercase text-slate-800 tracking-wide">{report.profile.school || 'THPT FPT Tây Hà Nội'}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold text-slate-500 font-mono">Mã Hồ Sơ: {report.profile.id}</p>
                <p className="text-[9px] font-semibold text-slate-500">Năm học: 2025 - 2026</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-1">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest leading-tight text-balance">
                HỒ SƠ CHÂN DUNG & ĐỊNH HƯỚNG HỌC SINH
              </h1>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1 text-balance">
                Mô Hình Phát Triển Toàn Diện 6 Nhóm Năng Lực Cốt Lõi
              </p>
            </div>

            {/* I. PROFILE SECTION */}
            <div className="grid grid-cols-12 gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {/* Avatar Column */}
              <div className="col-span-3 flex flex-col items-center justify-center space-y-1.5 border-r border-slate-200 pr-3">
                <div className="w-16 h-16 rounded-full border-2 border-orange-500/50 overflow-hidden bg-slate-200 shadow-sm shrink-0">
                  {report.profile.avatar ? (
                    <img src={report.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-800">{report.profile.id}</span>
              </div>

              {/* Profile details column */}
              <div className="col-span-9 grid grid-cols-2 gap-y-1.5 gap-x-4 pl-1 text-[11px] leading-relaxed">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block leading-tight">Họ và tên học sinh</span>
                  <span className="font-extrabold text-slate-800">{report.profile.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block leading-tight">Lớp học</span>
                  <span className="font-extrabold text-slate-800">{report.profile.class}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block leading-tight">Ngày sinh</span>
                  <span className="font-bold text-slate-700">{formatDate(report.profile.dob || 'Chưa cập nhật')}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block leading-tight">Giáo viên chủ nhiệm</span>
                  <span className="font-bold text-slate-700">{report.profile.teacherInCharge || 'Chưa cập nhật'}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/50 pt-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 block leading-tight">Năng khiếu, sở thích học sinh</span>
                  <span className="font-semibold text-slate-600 block text-[10px] whitespace-normal leading-normal">{report.profile.hobbyDescription || 'Không có ghi nhận đặc biệt'}</span>
                </div>
              </div>
            </div>

            {/* II. COMPETENCY RADAR SECTION */}
            <div className="grid grid-cols-12 gap-4 items-center">
              
              {/* Radar Chart (Left) */}
              <div className="col-span-5 border border-slate-200 rounded-2xl p-2 bg-white flex flex-col items-center justify-center h-[180px]">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 block">Biểu đồ radar năng lực</span>
                <div className="w-full h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#cbd5e1" strokeWidth={0.5} />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#334155', fontSize: 6.5, fontWeight: 'bold' }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 5 }} />
                      <Radar 
                        name="Năng lực" 
                        dataKey="A" 
                        stroke="#ea580c" 
                        fill="#f97316" 
                        fillOpacity={0.25} 
                        id="radar-line-a"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Competencies Table list (Right) */}
              <div className="col-span-7 border border-slate-200 rounded-2xl p-3 bg-white min-h-[180px] flex flex-col justify-between">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block border-b pb-1">
                  Điểm đánh giá năng lực chi tiết
                </span>
                
                <div className="space-y-1.5 py-1.5 flex-1">
                  {report.competencies.map((c) => (
                    <div key={c.id} className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="font-extrabold text-slate-700">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded font-black uppercase tracking-wider">{c.level}</span>
                        <span className="font-mono font-black text-slate-800 text-right w-6">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[8px] text-slate-400 font-semibold italic leading-tight border-t pt-1">
                  *Điểm năng lực được tính toán từ các điểm học tập, hoạt động trải nghiệm phối hợp bản phản tư học sinh.
                </p>
              </div>

            </div>

            {/* III. ACADEMICS & EXPERIENCES SECTION */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Academic Panel */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2 flex flex-col justify-between min-h-[190px]">
                <div>
                  <div className="flex justify-between items-center border-b pb-1 mb-1.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Kết quả học tập</span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Thang điểm 10</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px]">
                    {report.academicScores.map((score, idx) => (
                      <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-50 gap-2">
                        <span className="font-bold text-slate-600 break-words flex-1 pr-1">{normalizeSubjectName(score.subjectName)}</span>
                        <div className="flex items-center gap-1 font-mono shrink-0">
                          <span className="font-extrabold text-slate-800">
                            {score.scoreType === 'numeric'
                              ? (score.score !== null && score.score !== undefined ? score.score.toFixed(1) : (score.currentScore !== undefined ? score.currentScore.toFixed(1) : ''))
                              : score.scoreType === 'pass_fail'
                              ? score.assessmentResult || 'Đạt'
                              : 'Chưa có dữ liệu'}
                          </span>
                          {score.scoreType === 'numeric' && (
                            score.trend === 'up' ? (
                              <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                            ) : score.trend === 'down' ? (
                              <TrendingDown className="w-2.5 h-2.5 text-rose-500" />
                            ) : (
                              <Minus className="w-2.5 h-2.5 text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider leading-none">Môn học yêu thích nhất:</span>
                  <span className="text-[9px] font-bold text-slate-700">{report.survey.q2_favoriteSubjects.join(', ') || 'Chưa thiết lập'}</span>
                </div>
              </div>

              {/* Experiential Activities Panel */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2 flex flex-col justify-between min-h-[190px]">
                <div>
                  <div className="flex justify-between items-center border-b pb-1 mb-1.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Đánh giá hoạt động trải nghiệm</span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Thang 100</span>
                  </div>

                  <div className="space-y-2 py-0.5 text-[9px]">
                    {report.experientialActivities.length > 0 ? (
                      report.experientialActivities.map((act, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-[9px] font-semibold text-slate-600 gap-2 items-start">
                            <span className="break-words flex-1 pr-1">{act.activityName}</span>
                            <span className="font-mono font-black text-slate-800 shrink-0">{act.val}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${act.val}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[9px] text-slate-400 font-semibold italic text-center py-4">Chưa cập nhật hoạt động trải nghiệm</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-2 mt-2">
                  <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider leading-none">Phân vai làm việc nhóm:</span>
                  <span className="text-[9px] font-extrabold text-orange-600 uppercase block mt-0.5">
                    {report.survey.q3_teamRole === 'leader' ? 'Trưởng Nhóm (Leader)' :
                     report.survey.q3_teamRole === 'thinker' ? 'Người Ý Tưởng (Thinker)' :
                     report.survey.q3_teamRole === 'executor' ? 'Người Thực Thi (Executor)' :
                     report.survey.q3_teamRole === 'mediator' ? 'Người Kết Nối (Mediator)' :
                     report.survey.q3_teamRole === 'supporter' ? 'Người Đồng Hành (Supporter)' : 'Chưa cập nhật'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Footer - Page 1 */}
          <div className="border-t border-slate-200 pt-3 mt-4">
            <div className="flex justify-between items-center text-[9px] leading-normal font-semibold text-slate-400">
              <div>
                Học sinh: <span className="font-extrabold text-slate-700">{report.profile.name}</span>
              </div>
              <div>
                Trường: <span className="font-extrabold text-slate-700">{report.profile.school || 'THPT FPT Tây Hà Nội'}</span>
              </div>
              <div className="text-right flex items-center gap-2">
                <span>Giáo viên đồng hành: <span className="font-extrabold text-slate-700">{report.profile.teacherInCharge || 'Chưa cập nhật'}</span></span>
                <span className="font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded ml-1 font-mono">Trang 1/2</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= PAGE 2 ================= */}
        <div 
          className="a4-page bg-white w-[210mm] min-h-[297mm] h-[297mm] p-[12mm] border border-slate-200 shadow-2xl relative text-slate-900 flex flex-col justify-between"
          id="a4-print-element-p2"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          <div className="space-y-4">
            
            {/* Page 2 Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Chân dung học sinh & Định hướng học bạ</p>
                <p className="text-[10px] font-black text-slate-800 tracking-wide">{report.profile.name} - Lớp {report.profile.class}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-mono">Trang 2/2</p>
              </div>
            </div>

            {/* IV. AI PORTRAIT CAREER RECOMMENDATION */}
            <div className="border border-slate-200 rounded-2xl p-3 bg-orange-50/5 space-y-3">
              
              {/* Section title */}
              <div className="flex justify-between items-center border-b border-orange-100 pb-1.5">
                <div className="flex items-center gap-1.5 text-orange-700">
                  <Sparkles className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Khuyến Nghị Chuyên Sâu & Định Hướng Phát Triển Từ Trí Tuệ Nhân Tạo (AI)</span>
                </div>
              </div>

              {/* Strengths, Weaknesses & Improvements */}
              <div className="grid grid-cols-3 gap-3 text-[9px] leading-relaxed">
                <div className="space-y-1.5 bg-emerald-50/25 p-2 rounded-xl border border-emerald-100 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[8px] font-black text-emerald-700 block uppercase tracking-wider mb-1 border-b border-emerald-100 pb-0.5">Thế mạnh nổi bật:</span>
                    <ul className="space-y-1 text-slate-700 list-disc pl-3 font-semibold whitespace-normal break-words">
                      {report.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-1.5 bg-rose-50/25 p-2 rounded-xl border border-rose-100 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[8px] font-black text-rose-700 block uppercase tracking-wider mb-1 border-b border-rose-100 pb-0.5">Điểm hạn chế cần nhận thức:</span>
                    <ul className="space-y-1 text-slate-700 list-disc pl-3 font-semibold whitespace-normal break-words">
                      {(report.weaknesses || [
                        'Dễ gặp áp lực quá tải khi gánh vác nhiều nhiệm vụ cùng lúc.',
                        'Còn rụt rè, chưa chủ động nêu ý kiến phản biện trước đám đông.'
                      ]).map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-1.5 bg-amber-50/25 p-2 rounded-xl border border-amber-100 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[8px] font-black text-amber-700 block uppercase tracking-wider mb-1 border-b border-amber-100 pb-0.5">Định hướng cần rèn luyện:</span>
                    <ul className="space-y-1 text-slate-700 list-disc pl-3 font-semibold whitespace-normal break-words">
                      {report.improvements.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5 Career sectors match */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[8px] font-black text-orange-600 block uppercase tracking-wider">TOP 5 ngành nghề gợi ý cho học sinh:</span>
                <div className="grid grid-cols-5 gap-2">
                  {(report.suitableCareers || [
                    report.futureVision || { title: 'Nhóm ngành Công nghệ', description: 'Nghiên cứu công nghệ thông tin', matchPercentage: 90 }
                  ]).slice(0, 5).map((career, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col justify-between min-h-[85px] h-auto pb-1.5 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8px] font-extrabold text-slate-700 leading-tight break-words block">
                            {idx + 1}. {career.title}
                          </span>
                          <span className="text-[8px] font-black text-orange-600 font-mono leading-none shrink-0">{career.matchPercentage}%</span>
                        </div>
                        <p className="text-[7px] text-slate-500 font-medium leading-normal mt-1 break-words">
                          {career.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action advice roadmap */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[9px] leading-relaxed space-y-1.5">
                <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider border-b pb-0.5">Lộ trình rèn luyện hành động cụ thể cho năm học mới:</span>
                <div className="space-y-2">
                  {report.advice.map((adv, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-slate-600 leading-relaxed break-words flex-1">{adv}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Footer - Page 2 */}
          <div className="border-t border-slate-200 pt-3 mt-4">
            <div className="flex justify-between items-center text-[9px] leading-normal font-semibold text-slate-400">
              <div>
                Học sinh: <span className="font-extrabold text-slate-700">{report.profile.name}</span>
              </div>
              <div>
                Trường: <span className="font-extrabold text-slate-700">{report.profile.school || 'THPT FPT Tây Hà Nội'}</span>
              </div>
              <div className="text-right flex items-center gap-2">
                <span>Giáo viên đồng hành: <span className="font-extrabold text-slate-700">{report.profile.teacherInCharge || 'Chưa cập nhật'}</span></span>
                <span className="font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded ml-1 font-mono">Trang 2/2</span>
              </div>
            </div>
          </div>

        </div>

        </div>

      </div>
    </div>
  );
}
