import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Check, ArrowRight, ArrowLeft, Heart, Target, Star, Trophy, Users, User, Compass 
} from 'lucide-react';
import { SurveyResponse } from '../types';

interface SurveyWizardProps {
  initialValue: SurveyResponse;
  onChange: (survey: SurveyResponse) => void;
}

const PRESETS = {
  extracurriculars: [
    'Nghiên cứu khoa học kỹ thuật', 'Lắp ráp Robot / STEM', 'Tổ chức sự kiện văn nghệ', 
    'Câu lạc bộ thể thao (Bóng rổ, bóng đá)', 'Công tác tình nguyện hỗ trợ xã hội', 
    'Truyền thông & Phát thanh học đường', 'Lập trình website / phần mềm', 'Hội họa & Thủ công nghệ thuật'
  ],
  strengths: [
    'Tư duy logic & phân tích số liệu', 'Giải quyết vấn đề phức tạp', 'Giao tiếp & truyền cảm hứng', 
    'Sáng tạo nghệ thuật thị giác / viết lách', 'Tổ chức & Điều phối đội nhóm', 'Đồng cảm & Lắng nghe thấu hiểu', 
    'Tự học & Nghiên cứu độc lập', 'Thích ứng nhanh trước sự thay đổi'
  ],
  futureValues: [
    'Sự đổi mới, sáng tạo hàng ngày', 'Cống hiến thiết thực cho cộng đồng', 'Đạt được chuyên môn học thuật sâu', 
    'Sự tự do, tự chủ thời gian', 'Tạo ảnh hưởng tích cực đến xã hội', 'Thu nhập cao & sự an toàn tài chính', 
    'Sự hòa hợp, kết nối giữa con người', 'Sự cân bằng cuộc sống và bình yên nội tâm'
  ],
  jobCharacteristics: [
    'Môi trường công nghệ cao và tự động hóa', 'Làm việc trực tiếp và tương tác với con người', 
    'Làm việc độc lập, tự do sáng tác nghệ thuật', 'Nghiên cứu chuyên sâu trong phòng thí nghiệm', 
    'Môi trường kinh doanh, đàm phán tài chính', 'Di chuyển nhiều, tổ chức sự kiện thực địa', 
    'Không gian yên tĩnh, lập kế hoạch chi tiết'
  ],
  improvements: [
    'Kỹ năng trình bày, thuyết trình trước đám đông', 'Tư duy tính toán chặt chẽ và số liệu tài chính', 
    'Kỹ năng quản lý thời gian và chống trì hoãn', 'Sự kiên nhẫn khi thực hiện công việc chi tiết', 
    'Quyết đoán đưa ra quyết định dưới áp lực', 'Khả năng quản lý cảm xúc cá nhân', 
    'Khả năng ngoại ngữ / Tiếng Anh giao tiếp'
  ],
  fieldsOfStudy: [
    'Khoa học máy tính, AI & Công nghệ phần mềm', 'Kỹ thuật cơ khí, Điện tử & Robot', 
    'Truyền thông đa phương tiện & Quan hệ công chúng (PR)', 'Quản trị kinh doanh, Tài chính & Marketing', 
    'Tâm lý học hành vi & Tư vấn tâm lý học đường', 'Thiết kế đồ họa, Mỹ thuật & Kiến trúc', 
    'Y học, Công nghệ sinh học & Khoa học sức khỏe', 'Sư phạm, Ngôn ngữ học & Ngoại ngữ'
  ]
};

const STEPS = [
  { id: 1, title: "Học Tập & Hoạt Động", desc: "Sở thích và các hoạt động trải nghiệm của em" },
  { id: 2, title: "Vai Trò & Thế Mạnh", desc: "Thế mạnh cá nhân và phong cách làm việc nhóm" },
  { id: 3, title: "Giá Trị & Khát Vọng", desc: "Giá trị tương lai và môi trường mơ ước" },
  { id: 4, title: "Định Hướng & Phản Tư", desc: "Khía cạnh hoàn thiện và tầm nhìn tương lai" }
];

export default function SurveyWizard({ initialValue, onChange }: SurveyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [customInput, setCustomInput] = useState<Record<string, string>>({});

  const updateField = <K extends keyof SurveyResponse>(key: K, val: SurveyResponse[K]) => {
    onChange({
      ...initialValue,
      [key]: val
    });
  };

  const toggleArrayItem = (key: 'q1_activities' | 'q2_favoriteSubjects' | 'q4_strengths' | 'q5_futureValues' | 'q6_jobCharacteristics' | 'q7_improvements' | 'q9_fieldsOfStudy', item: string, limit?: number) => {
    const list = [...initialValue[key]];
    const idx = list.indexOf(item);
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      if (limit && list.length >= limit) {
        // Remove first item if limit reached
        list.shift();
      }
      list.push(item);
    }
    updateField(key, list);
  };

  const handleAddCustom = (key: 'q1_activities' | 'q4_strengths' | 'q5_futureValues' | 'q6_jobCharacteristics' | 'q7_improvements' | 'q9_fieldsOfStudy') => {
    const text = customInput[key]?.trim();
    if (text) {
      if (!initialValue[key].includes(text)) {
        updateField(key, [...initialValue[key], text]);
      }
      setCustomInput({ ...customInput, [key]: '' });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      
      {/* Wizard Header Progress */}
      <div className="bg-slate-50 border-b border-slate-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-600 animate-spin-slow" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Khảo sát Phản tư & Định hướng Bản thân (10 Câu hỏi)
            </span>
          </div>
          <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
            Bước {currentStep + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="bg-orange-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Indicator Badges */}
        <div className="hidden sm:grid grid-cols-4 gap-4 mt-4">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`text-left border-t-2 pt-2 transition-all ${
                idx === currentStep 
                  ? 'border-orange-500 text-orange-700' 
                  : idx < currentStep 
                  ? 'border-emerald-500 text-emerald-700' 
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-[9px] font-black uppercase tracking-wider">Bước {step.id}</div>
              <div className="text-[10px] font-bold truncate">{step.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Survey Questions Container */}
      <div className="p-6 md:p-8 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">
                  {currentStep + 1}
                </span>
                {STEPS[currentStep].title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{STEPS[currentStep].desc}</p>
            </div>

            {/* STEP 1: HỌC TẬP & HOẠT ĐỘNG */}
            {currentStep === 0 && (
              <div className="space-y-6">
                
                {/* Q1: Extracurricular Activities */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black text-slate-700 block">
                    Câu 1: Các hoạt động ngoại khóa, câu lạc bộ hoặc dự án em đã tham gia:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESETS.extracurriculars.map(act => {
                      const isSelected = initialValue.q1_activities.includes(act);
                      return (
                        <button
                          type="button"
                          key={act}
                          onClick={() => toggleArrayItem('q1_activities', act)}
                          className={`p-3 text-left rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/25 text-orange-800' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30 hover:bg-slate-50/50'
                          }`}
                        >
                          <span>{act}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom activity adding */}
                  <div className="flex gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      placeholder="Thêm hoạt động khác của em..."
                      value={customInput['q1_activities'] || ''}
                      onChange={(e) => setCustomInput({ ...customInput, q1_activities: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom('q1_activities'))}
                      className="flex-1 p-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustom('q1_activities')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Q2: Favorite subjects & reasoning */}
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-700 block">
                      Câu 2: Các môn học em cảm thấy yêu thích nhất:
                    </label>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bấm chọn các môn (Nên chọn 1 - 3 môn):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'Tin học', 'Mỹ thuật', 'Âm nhạc', 'Thể dục', 'Công nghệ'].map(sub => {
                        const isSelected = initialValue.q2_favoriteSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => toggleArrayItem('q2_favoriteSubjects', sub)}
                            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-orange-500 bg-orange-600 text-white shadow-md shadow-orange-500/10' 
                                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/40'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-700 block">
                      Lý do em yêu thích nhóm môn học trên:
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Chia sẻ lý do em thích môn học đó..."
                      value={initialValue.q2_reason}
                      onChange={(e) => updateField('q2_reason', e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2: VAI TRÒ & THẾ MẠNH */}
            {currentStep === 1 && (
              <div className="space-y-6">
                
                {/* Q3: Teamwork Role */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 block">
                    Câu 3: Trong làm việc nhóm hoặc hoạt động tập thể, em đóng vai trò nào thường xuyên nhất?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {[
                      { key: 'leader', label: 'Trưởng Nhóm', desc: 'Dẫn dắt, tổ chức, điều phối công việc và truyền cảm hứng.' },
                      { key: 'thinker', label: 'Người Ý Tưởng', desc: 'Đề xuất giải pháp, tư duy sáng tạo, phản biện lý thuyết.' },
                      { key: 'executor', label: 'Người Thực Thi', desc: 'Bắt tay vào làm trực tiếp, hoàn thành nhiệm vụ tỉ mỉ.' },
                      { key: 'mediator', label: 'Người Kết Nối', desc: 'Hòa giải tranh chấp, giữ hòa khí và lắng nghe các ý kiến.' },
                      { key: 'supporter', label: 'Người Đồng Hành', desc: 'Hỗ trợ đồng đội, sẵn sàng gánh vác các công việc phát sinh.' }
                    ].map(role => {
                      const isSelected = initialValue.q3_teamRole === role.key;
                      return (
                        <button
                          type="button"
                          key={role.key}
                          onClick={() => updateField('q3_teamRole', role.key)}
                          className={`p-4 text-left rounded-2xl border flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/20 text-orange-900 ring-2 ring-orange-500/10' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-black text-xs">
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-slate-300'}`} />
                            {role.label}
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{role.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q4: 3 Strengths */}
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-black text-slate-700 block">
                    Câu 4: Ba (3) thế mạnh cá nhân em tự tin nhất ở bản thân:
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hãy chọn chính xác 3 thế mạnh (Đang chọn: {initialValue.q4_strengths.length}/3):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {PRESETS.strengths.map(str => {
                      const isSelected = initialValue.q4_strengths.includes(str);
                      return (
                        <button
                          type="button"
                          key={str}
                          onClick={() => toggleArrayItem('q4_strengths', str, 3)}
                          className={`p-3 text-left rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/25 text-orange-800' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30 hover:bg-slate-50/50'
                          }`}
                        >
                          <span>{str}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* STEP 3: GIÁ TRỊ & KHÁT VỌNG */}
            {currentStep === 2 && (
              <div className="space-y-6">
                
                {/* Q5: Future Values */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black text-slate-700 block">
                    Câu 5: Ba (3) giá trị cốt lõi quan trọng nhất với em trong định hướng tương lai:
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hãy chọn chính xác 3 giá trị (Đang chọn: {initialValue.q5_futureValues.length}/3):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {PRESETS.futureValues.map(val => {
                      const isSelected = initialValue.q5_futureValues.includes(val);
                      return (
                        <button
                          type="button"
                          key={val}
                          onClick={() => toggleArrayItem('q5_futureValues', val, 3)}
                          className={`p-3 text-left rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/25 text-orange-800' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30 hover:bg-slate-50/50'
                          }`}
                        >
                          <span>{val}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q6: Job Characteristics */}
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-black text-slate-700 block">
                    Câu 6: Ba (3) đặc điểm công việc/môi trường làm việc mơ ước sau này:
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hãy chọn chính xác 3 đặc điểm (Đang chọn: {initialValue.q6_jobCharacteristics.length}/3):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {PRESETS.jobCharacteristics.map(char => {
                      const isSelected = initialValue.q6_jobCharacteristics.includes(char);
                      return (
                        <button
                          type="button"
                          key={char}
                          onClick={() => toggleArrayItem('q6_jobCharacteristics', char, 3)}
                          className={`p-3 text-left rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/25 text-orange-800' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30'
                          }`}
                        >
                          <span>{char}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* STEP 4: ĐỊNH HƯỚNG & PHẢN TƯ */}
            {currentStep === 3 && (
              <div className="space-y-6">
                
                {/* Q7: Improvements & Q8: Proudest Achievement */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-700 block">
                      Câu 7: Những khía cạnh/kỹ năng em muốn tập trung cải thiện nhất trong 12 tháng tới:
                    </label>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Nên chọn 1 - 3 khía cạnh:</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {PRESETS.improvements.map(imp => {
                        const isSelected = initialValue.q7_improvements.includes(imp);
                        return (
                          <button
                            type="button"
                            key={imp}
                            onClick={() => toggleArrayItem('q7_improvements', imp)}
                            className={`p-2.5 text-left rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-orange-500 bg-orange-50/25 text-orange-800' 
                                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30'
                            }`}
                          >
                            <span>{imp}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-700 block">
                      Câu 8: Một hoạt động, sự kiện hoặc thành tích em cảm thấy tự hào nhất đã làm được:
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Chia sẻ một trải nghiệm, sự kiện hoặc thành tích em cảm thấy tự hào nhất đã làm được..."
                      value={initialValue.q8_proudAchievement}
                      onChange={(e) => updateField('q8_proudAchievement', e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Q9: Fields of Study & Q10: Future Self */}
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-700 block">
                      Câu 9: Ngành học / Lĩnh vực nghề nghiệp em muốn tìm hiểu sâu nhất:
                    </label>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Nên chọn 1 - 2 ngành:</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {PRESETS.fieldsOfStudy.map(f => {
                        const isSelected = initialValue.q9_fieldsOfStudy.includes(f);
                        return (
                          <button
                            type="button"
                            key={f}
                            onClick={() => toggleArrayItem('q9_fieldsOfStudy', f)}
                            className={`p-2.5 text-left rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-orange-500 bg-orange-50/25 text-orange-800' 
                                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-500/30'
                            }`}
                          >
                            <span>{f}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-700 block">
                      Câu 10: Hãy tưởng tượng và mô tả phiên bản bản thân em muốn trở thành sau 3 năm nữa:
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Mô tả ước mơ, mục tiêu học tập, phát triển tính cách và kỹ năng của em..."
                      value={initialValue.q10_futureSelfThreeYears}
                      onChange={(e) => updateField('q10_futureSelfThreeYears', e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stepper Buttons Footer */}
      <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
        <button
          type="button"
          disabled={currentStep === 0}
          onClick={handlePrev}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
            currentStep === 0 
              ? 'text-slate-300 cursor-not-allowed' 
              : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full tracking-wider animate-pulse">
              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              <span>Khảo sát đã hoàn thiện! Sẵn sàng đồng bộ chân dung</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
