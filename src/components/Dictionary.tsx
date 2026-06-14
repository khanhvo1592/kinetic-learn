import React, { useState } from 'react';

interface DictionaryProps {
  onClose: () => void;
}

interface Term {
  word: string;
  type: string;
  definition: string;
  example?: string;
  symbols?: string;
}

const DICTIONARY_DATA: Term[] = [
  { word: 'Proton', type: 'Vật Lý & Hóa Học', definition: 'Hạt cấu tạo nên hạt nhân nguyên tử, mang điện tích dương (+1). Số proton đặc trưng cho mỗi nguyên tố hóa học.', example: 'Hạt nhân nguyên tử Heli chứa 2 proton.', symbols: 'p' },
  { word: 'Electron', type: 'Vật Lý & Hóa Học', definition: 'Hạt mang điện tích âm (-1) chuyển động cực nhanh xung quanh hạt nhân nguyên tử tạo nên lớp vỏ nguyên tử.', example: 'Nguyên tử Carbon có 6 electron.', symbols: 'e' },
  { word: 'Nơtron (Neutron)', type: 'Vật Lý & Hóa Học', definition: 'Hạt không mang điện, cùng với proton cấu tạo nên hạt nhân nguyên tử.', symbols: 'n' },
  { word: 'Đạo hàm (Derivative)', type: 'Toán Học', definition: 'Tỉ số giữa số gia của hàm số và số gia của đối số khi số gia của đối số tiến dần về 0. Biển thị tốc độ thay đổi tức thời.', symbols: 'f\'(x)' },
  { word: 'Khúc xạ (Refraction)', type: 'Vật Lý', definition: 'Hiện tượng tia sáng bị đổi hướng đột ngột khi đi lệch góc truyền qua mặt phân cách giữa hai môi trường trong suốt không cùng mật độ.' },
  { word: 'Present Perfect', type: 'Tiếng Anh', definition: 'Thì Hiện tại hoàn thành, dùng diễn tả hành động bắt đầu trong quá khứ kéo dài đến hiện tại hoặc vừa mới chấm dứt để lại kết quả.', symbols: 'Have/Has + V3' },
  { word: 'Nguyên tử (Atom)', type: 'Hóa Học', definition: 'Hạt vô cùng nhỏ và trung hòa về điện, cấu tạo nên tất cả các chất trong vũ trụ.' },
  { word: 'Ký hiệu hóa học', type: 'Hóa Học', definition: 'Chữ viết tắt tên gọi một nguyên tố hóa học, gồm một hoặc hai chữ cái (trong đó chữ cái đầu tiên luôn viết hoa).', example: 'O đại diện cho Oxygen, Fe đại diện cho Sắt.' },
  { word: 'Hợp chất (Compound)', type: 'Hóa Học', definition: 'Những chất được tạo nên từ hai hoặc nhiều nguyên tố hóa học trở lên gắn kết có quy luật.' },
];

export default function Dictionary({ onClose }: DictionaryProps) {
  const [search, setSearch] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(DICTIONARY_DATA[0]);

  const filtered = DICTIONARY_DATA.filter(t => 
    t.word.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    (t.definition && t.definition.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] border-4 border-orange-400 p-6 w-full max-w-lg shadow-[0_16px_0_0_#b75b00]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-2xl">translate</span>
            <h3 className="font-display font-bold text-lg text-orange-600">Từ điển học thuật</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm Proton, Đạo hàm, Present Perfect..."
            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-400 focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-64">
          {/* List panel */}
          <div className="md:col-span-5 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 p-1 bg-slate-50">
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <button
                  key={t.word}
                  onClick={() => setSelectedTerm(t)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold font-display transition-colors ${
                    selectedTerm?.word === t.word 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'hover:bg-white text-slate-700'
                  }`}
                >
                  {t.word}
                  <span className="block text-[10px] text-slate-400 font-sans font-normal">{t.type}</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">Không tìm thấy từ khóa</p>
            )}
          </div>

          {/* Details panel */}
          <div className="md:col-span-7 bg-orange-50/40 rounded-xl p-4 border border-orange-100 flex flex-col justify-between overflow-y-auto">
            {selectedTerm ? (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-bold text-base text-orange-900">{selectedTerm.word}</h4>
                  {selectedTerm.symbols && (
                    <span className="bg-white border border-orange-200 text-orange-700 font-mono text-xs px-2 py-0.5 rounded-md font-bold">
                      {selectedTerm.symbols}
                    </span>
                  )}
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedTerm.type}
                </span>
                <p className="text-sm text-slate-700 font-sans mt-3 leading-relaxed">
                  {selectedTerm.definition}
                </p>
                {selectedTerm.example && (
                  <div className="mt-2 text-xs text-slate-500 font-sans italic bg-white/55 p-2 rounded-lg border border-dashed border-orange-200">
                    <strong>Ví dụ:</strong> {selectedTerm.example}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center m-auto">Hãy chọn một từ khóa ở danh sách bên cạnh</p>
            )}
            
            <p className="text-[10px] text-orange-400 italic text-right mt-2">Dữ liệu được biên soạn chuẩn SGK mới</p>
          </div>
        </div>
      </div>
    </div>
  );
}
