
import React, { useEffect, useRef } from 'react';
import { useInterviewStore } from '../../store/useInterviewStore';
import { Bot, User } from 'lucide-react';

const ChatInterface: React.FC = () => {
    const { messages } = useInterviewStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-4 scrollbar-thin">
            {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-purple-600/10 border-purple-500/30 text-purple-400'
                        }`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'glass border-white/10 text-gray-200 rounded-tl-sm'
                        }`}>
                        {msg.content}
                        <div className={`text-[9px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatInterface;
