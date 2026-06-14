import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AITutorProps {
  onClose: () => void;
  initialTopic?: string;
}

const PRESET_ANSWERS: Record<string, string> = {
  'tại sao oxy ký hiệu là o?': 'Ký hiệu hóa học O bắt nguồn từ tên tiếng Anh/La-tinh là "Oxygen" (nguồn gốc tiếng Hy Lạp nghĩa là tạo axit). Sử dụng ký hiệu viết tắt giúp các nhà khoa học trên toàn cầu dễ dàng viết phản ứng hóa học chính xác mà không gặp bất rào cản ngôn ngữ nào!',
  'đạo hàm dùng để làm gì?': 'Đạo hàm dùng để tính toán tốc độ thay đổi tức thời của mọi sự vật! Trong Vật Lý, đạo hàm của quãng đường là vận tốc, đạo hàm của vận tốc là gia tốc. Trong kinh tế học, nó giúp tối ưu hóa doanh thu và cực tiểu chi phí đó em!',
  'nguyên tử gồm các hạt nào?': 'Nguyên tử bao gồm 3 loại hạt cơ bản:\n1. Proton (ký hiệu là p) nằm trong hạt nhân, mang điện cực dương (+)\n2. Nơtron (ký hiệu là n) nằm trong hạt nhân, không mang điện\n3. Electron (ký hiệu là e) chuyển động xung quanh hạt nhân tạo vỏ nguyên tử, mang điện âm (-).',
  'lớp vỏ nguyên tử mang điện gì?': 'Lớp vỏ nguyên tử được cấu tạo từ các hạt electron, mà mỗi hạt electron luôn mang điện tích âm quy ước là -1. Do đó, lớp vỏ nguyên tử mang điện tích âm toàn phần (-) và cân bằng với điện tích dương (+) của hạt nhân.',
  'làm thế nào để được streak cao?': 'Để duy trì chuỗi Streak (ngày học liên tục) cao vượt trội, em chỉ cần truy cập ứng dụng Kinetic Learning đều đặn mỗi ngày, học ít nhất 1 bài học hoặc hoàn thành 1 nhiệm vụ hàng ngày. Chúc em có tinh thần kỷ luật xuất sắc!',
};

const SUGGESTIONS = [
  'Tại sao Oxy ký hiệu là O?',
  'Nguyên tử gồm các hạt nào?',
  'Lớp vỏ nguyên tử mang điện gì?',
  'Đạo hàm dùng để làm gì?'
];

export default function AITutor({ onClose, initialTopic }: AITutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Chào em! Thầy là AI hỗ trợ học tập của Kinetic Learning. ${
        initialTopic ? `Thầy thấy em đang học bài "${initialTopic}".` : ''
      } Hãy đặt bất kỳ câu hỏi nào về bài học này, thầy sẽ giải đáp thật chi tiết và dễ hiểu nhé! ✨`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMsg('');
    setIsTyping(true);

    const matchKey = textToSend.toLowerCase().trim().replace(/[?.,!]/g, '');
    let responseText = `Câu hỏi thật là lý thú! Về nội dung "${textToSend}", theo kiến thức trung học tổng hợp:\n\n- Nguyên tử luôn chứa các proton (+) và electron (-) tự tương tác.\n- Nếu em muốn học sâu hơn, hãy thử xem phần Tóm Tắt Kiến Thức hoặc thi đấu Quiz để tích lũy điểm kinh nghiệm nhé!`;

    // Try finding close preset answer keys
    for (const key of Object.keys(PRESET_ANSWERS)) {
      if (key.includes(matchKey) || matchKey.includes(key)) {
        responseText = PRESET_ANSWERS[key];
        break;
      }
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.reply) {
        responseText = data.reply;
      }
    } catch (err) {
      console.warn('Không thể kết nối với AI Tutor backend, đang sử dụng câu trả lời mẫu:', err);
    } finally {
      setIsTyping(false);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] border-4 border-cyan-400 p-6 w-full max-w-md shadow-[0_16px_0_0_#00bcd4] flex flex-col h-[520px]">
        {/* Chat header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-500 text-3xl">psychology</span>
            <div>
              <h3 className="font-display font-bold text-lg text-cyan-600">Trợ lý AI Gia Sư</h3>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">Giải bài tập hóa học và khoa học 24/7</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Message panel */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 no-scrollbar">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                  m.sender === 'user' 
                    ? 'bg-cyan-500 text-white rounded-br-none shadow-sm' 
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/60 shadow-sm whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono px-1">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%] mr-auto">
              <div className="p-3 rounded-2xl bg-white text-cyan-500 font-sans border border-slate-200 flex items-center gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-75">●</span>
                <span className="animate-bounce delay-150">●</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scroll-hide flex-shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-[10px] font-bold font-display hover:bg-cyan-100/80 active:scale-95 transition-all whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputMsg);
          }}
          className="flex gap-2 mt-2 flex-shrink-0"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Hỏi AI oát... (ví dụ: nguyên tử gồm các hạt nào?)"
            className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 font-sans"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-cyan-500 text-white rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#00bcd4] hover:bg-cyan-600 active:translate-y-[2px] active:shadow-none transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
