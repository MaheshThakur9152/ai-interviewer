
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useInterviewStore } from '../../store/useInterviewStore';
import { Terminal, Code2 } from 'lucide-react';

const CodeEditor: React.FC = () => {
    const { code, setCode, isEditorFrozen, terminalOutput } = useInterviewStore();

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solution.js</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
            </div>

            {/* Code Mirror Instance */}
            <div className="flex-1 overflow-auto relative">
                <CodeMirror
                    value={code}
                    height="100%"
                    theme={oneDark}
                    extensions={[javascript({ jsx: true })]}
                    onChange={(val) => setCode(val)}
                    readOnly={isEditorFrozen}
                    className="text-sm font-mono h-full"
                />
                {isEditorFrozen && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="bg-black/80 px-4 py-2 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-bold animate-pulse">
                            ANALYZING...
                        </div>
                    </div>
                )}
            </div>

            {/* Terminal / Output Panel */}
            <div className="h-32 bg-[#0e0e0e] border-t border-white/10 p-4 font-mono text-xs overflow-y-auto">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Terminal size={12} />
                    <span className="uppercase tracking-widest text-[9px]">Console Output</span>
                </div>
                {terminalOutput ? (
                    <div className={`p-2 rounded border ${terminalOutput.type === 'error' ? 'bg-red-900/10 border-red-500/20 text-red-400' :
                            terminalOutput.type === 'success' ? 'bg-green-900/10 border-green-500/20 text-green-400' :
                                'text-gray-300'
                        }`}>
                        {terminalOutput.message}
                    </div>
                ) : (
                    <span className="text-gray-600 italic">Ready for execution...</span>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
