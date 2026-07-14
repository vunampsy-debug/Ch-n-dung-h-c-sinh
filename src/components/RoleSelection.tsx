import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, GraduationCap, ArrowRight, UserPlus, ShieldAlert, BookOpen } from 'lucide-react';
import { StudentReport } from '../types';

interface RoleSelectionProps {
  students: StudentReport[];
  onSelectRole: (role: 'student' | 'teacher', studentId?: string) => void;
  onCreateNewStudent: (name: string, mshs: string) => void;
}

export default function RoleSelection({ students, onSelectRole, onCreateNewStudent }: RoleSelectionProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password-protection state for Teacher dashboard
  const [password, setPassword] = useState('');
  const [isTeacherPasswordVisible, setIsTeacherPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Keep selectedStudentId in sync with the students list
  useEffect(() => {
    if (students.length > 0) {
      if (!selectedStudentId || !students.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(students[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [students, selectedStudentId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const name = newStudentName.trim();
    const id = newStudentId.trim().toUpperCase();

    if (!name || !id) {
      setErrorMsg('Vui lòng nhập đầy đủ họ tên và mã số học sinh.');
      return;
    }

    if (students.some(s => s.id === id)) {
      setErrorMsg('Mã số học sinh (MSHS) này đã tồn tại trong hệ thống.');
      return;
    }

    onCreateNewStudent(name, id);
    setIsCreatingNew(false);
    setNewStudentName('');
    setNewStudentId('');
  };

  const handleVerifyTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (password === 'giaovien2026') {
      onSelectRole('teacher');
      setIsTeacherPasswordVisible(false);
      setPassword('');
    } else {
      setPasswordError('Mật khẩu giáo viên không chính xác!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: App Intro */}
        <div className="md:col-span-5 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-black rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ Thống Trực Quan Chân Dung & Định Hướng Học Sinh
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight text-balance">
            Khám Phá <span className="text-orange-600">Năng Lực</span>,<br />
            Định Hình <span className="text-slate-800">Tương Lai</span>
          </h1>
          
          <p className="text-sm text-slate-600 leading-relaxed font-medium text-balance">
            Học sinh tự phản tư học tập, nhập điểm số thông minh bằng AI, và nhận biểu đồ radar 6 nhóm năng lực cá nhân hóa cùng tư vấn định hướng từ chuyên gia ảo.
          </p>

          <div className="hidden md:flex flex-col gap-3.5 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              <span>Biểu đồ radar 6 nhóm năng lực cập nhật trực tiếp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              <span>Nhập học bạ thông minh bằng AI & Excel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              <span>Hồ sơ A4 PDF chuẩn hóa sẵn in</span>
            </div>
          </div>
        </div>

        {/* Right Side: Role Selector Panel */}
        <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <h2 className="text-lg font-black text-slate-800 text-center pb-2 border-b border-slate-100">
            CHỌN VAI TRÒ ĐỂ BẮT ĐẦU
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Student Card */}
            <div className="border border-slate-200 hover:border-orange-500/50 bg-slate-50/50 hover:bg-orange-50/10 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">HỌC SINH TỰ PHẢN TƯ</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Khám phá năng lực bản thân, lập hồ sơ học tập và định hướng học tập.</p>
                </div>
              </div>

              {!isCreatingNew ? (
                <div className="space-y-3">
                  {students.length > 0 ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Chọn tài khoản của em:</label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.profile.name} ({s.profile.class})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => onSelectRole('student', selectedStudentId)}
                        className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Vào Không Gian Học Sinh</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setIsCreatingNew(true)}
                        className="w-full py-1.5 text-center text-[11px] font-extrabold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Tạo tài khoản học sinh mới
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 border border-orange-100/50 rounded-xl text-center">
                        <p className="text-xs text-orange-800 font-semibold leading-relaxed">
                          Chưa có tài khoản học sinh nào trong hệ thống.
                        </p>
                        <p className="text-[10px] text-orange-600 mt-1">
                          Vui lòng tạo một tài khoản học sinh mới để bắt đầu khám phá năng lực.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setIsCreatingNew(true)}
                        className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Tạo tài khoản mới</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Họ và tên:</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Mã học sinh (MSHS):</label>
                    <input
                      type="text"
                      placeholder="HS004"
                      required
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-100">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsCreatingNew(false); setErrorMsg(''); }}
                      className="py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Xác Nhận Tạo
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Teacher Card */}
            <div className="border border-slate-200 hover:border-slate-800/40 bg-slate-50/50 hover:bg-slate-800/5 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">GIÁO VIÊN ĐỒNG HÀNH</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Theo dõi thống kê lớp học, phê duyệt bản chân dung và xuất bảng điểm Excel học sinh.</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="p-3 bg-slate-100/80 rounded-xl text-[10px] text-slate-500 font-semibold space-y-1">
                  <span className="text-slate-700 block font-bold">Quyền hạn Dashboard:</span>
                  <p>✓ Tìm kiếm, lọc học sinh theo khối lớp</p>
                  <p>✓ Xem biểu đồ phân tích 6 nhóm năng lực lớp</p>
                  <p>✓ Tải báo cáo tổng hợp</p>
                </div>

                {!isTeacherPasswordVisible ? (
                  <button
                    onClick={() => {
                      setIsTeacherPasswordVisible(true);
                      setPasswordError('');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Vào Bảng Điều Khiển Giáo Viên</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <form onSubmit={handleVerifyTeacher} className="space-y-2.5 border-t border-slate-200 pt-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Nhập mật khẩu giáo viên:</label>
                      <input
                        type="password"
                        placeholder="Nhập mật khẩu (giaovien2026)..."
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-800"
                        autoFocus
                      />
                    </div>

                    {passwordError && (
                      <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-100">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTeacherPasswordVisible(false);
                          setPassword('');
                          setPasswordError('');
                        }}
                        className="py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer text-center"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer text-center"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>

          <div className="pt-2 text-center text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>© 2026 Hệ thống Chân Dung & Hướng nghiệp Học sinh Thực Nghiệm</span>
          </div>
        </div>

      </div>
    </div>
  );
}
