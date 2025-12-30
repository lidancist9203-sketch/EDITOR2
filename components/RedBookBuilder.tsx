import React, { useState } from 'react';
import { generateRedBookPostContent, generateImage } from '../services/geminiService';
import { RedBookPost, LoadingState } from '../types';

export const RedBookBuilder: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [post, setPost] = useState<RedBookPost | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoadingState('generating_text');
    setPost(null);
    setGeneratedImages([]);

    try {
      // 1. Generate Content
      const content = await generateRedBookPostContent(topic);
      setPost(content);
      setLoadingState('generating_images');

      // 2. Generate Images (Parallel)
      const imagePromises = content.imagePrompts.map(prompt => generateImage(prompt));
      const images = await Promise.all(imagePromises);
      setGeneratedImages(images);
      
      setLoadingState('complete');
    } catch (error) {
      console.error(error);
      setLoadingState('error');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fafafa]">
      {/* Input Section */}
      <div className="bg-white p-6 border-b border-rose-100 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Post Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Summer OOTD Inspiration"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loadingState === 'generating_text' || loadingState === 'generating_images' || !topic}
            className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             {loadingState === 'generating_text' ? 'Thinking...' : 
             loadingState === 'generating_images' ? 'Creating Visuals...' : 'Create Post'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 preview-scroll">
         {loadingState === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <p>Enter a topic to generate a Xiaohongshu post.</p>
            </div>
        )}

        {post && (
            <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-start justify-center">
                {/* Mobile Preview Mockup */}
                <div className="w-full max-w-[375px] bg-white rounded-[32px] border-8 border-slate-900 overflow-hidden shadow-2xl flex-shrink-0">
                    {/* Status Bar */}
                    <div className="h-8 bg-white flex justify-between items-center px-6 text-xs font-bold text-slate-900">
                        <span>9:41</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-2.5 bg-slate-900 rounded-sm"></div>
                            <div className="w-4 h-2.5 bg-slate-900 rounded-sm"></div>
                        </div>
                    </div>
                    
                    {/* Image Carousel */}
                    <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                        {loadingState === 'generating_images' ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                <span className="animate-pulse text-rose-400 font-medium">Generating Images...</span>
                            </div>
                        ) : generatedImages.length > 0 ? (
                            <img src={generatedImages[0]} alt="Main" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200" />
                        )}
                        {/* Pagination dots simulation */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {generatedImages.map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===0 ? 'bg-white' : 'bg-white/50'}`}></div>
                            ))}
                            {generatedImages.length === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 pb-8">
                        <h1 className="font-bold text-lg mb-2 leading-tight text-slate-900">{post.title}</h1>
                        <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed mb-4">
                            {post.content}
                        </div>
                        <div className="flex flex-wrap gap-2 text-blue-900 font-medium text-sm">
                            {post.tags.map(tag => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-slate-500">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                <span className="text-xs font-medium text-slate-900">Creator</span>
                             </div>
                             <div className="flex gap-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Additional Images Grid (Desktop View) */}
                <div className="flex-1 min-w-[300px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Generated Assets</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((img, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200">
                                <img src={img} alt={`Asset ${idx}`} className="w-full h-40 object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button 
                                        className="bg-white text-xs font-bold py-1 px-3 rounded-full shadow-md"
                                        onClick={() => window.open(img, '_blank')}
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                        {loadingState === 'generating_images' && Array.from({length: 4}).map((_, i) => (
                            <div key={i} className="h-40 bg-slate-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};