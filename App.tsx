import React, { useState } from 'react';
import { WeChatBuilder } from './components/WeChatBuilder';
import { RedBookBuilder } from './components/RedBookBuilder';
import { ContentType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.WECHAT);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar / Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 z-20 shadow-xl">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-rose-400 bg-clip-text text-transparent">
                RedGreen Creator
            </h1>
            <p className="text-xs text-slate-400 mt-2">Gemini Powered Content</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button
                onClick={() => setActiveTab(ContentType.WECHAT)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === ContentType.WECHAT 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <div className={`p-1.5 rounded-lg ${activeTab === ContentType.WECHAT ? 'bg-white/20' : 'bg-slate-700'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div className="text-left">
                    <span className="block font-medium">WeChat Official</span>
                    <span className="block text-[10px] opacity-70">Long-form Articles</span>
                </div>
            </button>

            <button
                onClick={() => setActiveTab(ContentType.REDBOOK)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === ContentType.REDBOOK 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <div className={`p-1.5 rounded-lg ${activeTab === ContentType.REDBOOK ? 'bg-white/20' : 'bg-slate-700'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-left">
                    <span className="block font-medium">Xiaohongshu</span>
                    <span className="block text-[10px] opacity-70">Social Posts & Visuals</span>
                </div>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
            Internal Tool v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div className="absolute inset-0">
             {activeTab === ContentType.WECHAT ? <WeChatBuilder /> : <RedBookBuilder />}
        </div>
      </main>
    </div>
  );
};

export default App;