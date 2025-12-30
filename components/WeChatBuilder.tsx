import React, { useState, useRef } from 'react';
import { generateWeChatArticleStructure, generateImage } from '../services/geminiService';
import { WeChatArticle, LoadingState, GeneratedImage } from '../types';

export const WeChatBuilder: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [imageCount, setImageCount] = useState(2);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [article, setArticle] = useState<WeChatArticle | null>(null);
  const [images, setImages] = useState<Record<number, GeneratedImage>>({}); // Map section index to image
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoadingState('generating_text');
    setArticle(null);
    setImages({});

    try {
      // 1. Generate Text Structure
      const generatedArticle = await generateWeChatArticleStructure(topic, imageCount);
      setArticle(generatedArticle);
      setLoadingState('generating_images');

      // 2. Identify Image Prompts and Generate Images concurrently
      const imagePromises = generatedArticle.sections.map(async (section, index) => {
        if (section.type === 'image_prompt') {
            // Set initial loading state for this image
            setImages(prev => ({
                ...prev,
                [index]: { prompt: section.content, url: null, loading: true }
            }));

            try {
                const url = await generateImage(section.content);
                setImages(prev => ({
                    ...prev,
                    [index]: { prompt: section.content, url, loading: false }
                }));
            } catch (e) {
                setImages(prev => ({
                    ...prev,
                    [index]: { prompt: section.content, url: null, loading: false, error: 'Failed' }
                }));
            }
        }
      });

      await Promise.all(imagePromises);
      setLoadingState('complete');

    } catch (error) {
      console.error(error);
      setLoadingState('error');
    }
  };

  const copyToClipboard = async () => {
    if (!contentRef.current) return;

    try {
        // We use the Clipboard API with text/html for rich text pasting support
        const content = contentRef.current.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob })];
        await navigator.clipboard.write(data);
        alert('Copied to clipboard! Ready to paste into WeChat Editor.');
    } catch (err) {
        console.error('Clipboard API failed', err);
        alert('Copy failed. Please manually select and copy.');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Input Section */}
      <div className="bg-white p-6 border-b border-green-100 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Article Title / Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 5 Tips for Healthy Living in Summer"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-medium text-slate-700 mb-1">Images</label>
            <select 
                value={imageCount} 
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
                <option value={1}>1 Image</option>
                <option value={2}>2 Images</option>
                <option value={3}>3 Images</option>
                <option value={4}>4 Images</option>
                <option value={5}>5 Images</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loadingState === 'generating_text' || loadingState === 'generating_images' || !topic}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingState === 'generating_text' ? 'Writing...' : 
             loadingState === 'generating_images' ? 'Painting...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 preview-scroll">
        {loadingState === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <p>Enter a topic to generate a WeChat article.</p>
            </div>
        )}
        
        {article && (
            <div className="max-w-[640px] mx-auto bg-white shadow-lg min-h-[800px] flex flex-col">
                {/* Simulated Phone Header */}
                <div className="bg-slate-100 p-4 border-b text-center text-xs text-slate-500 font-mono">
                    WeChat Preview
                </div>

                {/* Content Area - Identifying for Copy */}
                <div 
                    ref={contentRef}
                    className="flex-1 p-6 md:p-8 font-sans text-[#333]" 
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                    <h1 className="text-2xl font-bold mb-6 leading-tight">{article.title}</h1>
                    
                    {article.sections.map((section, idx) => {
                        if (section.type === 'heading') {
                            return (
                                <h2 key={idx} style={section.style ? 
                                    // Parse inline style string to object is hard in React without library, 
                                    // so we use dangerouslySetInnerHTML for the entire tag or apply style attribute directly if possible.
                                    // Given the requirement, we will render a div with dangerouslySetInnerHTML to allow the exact styles from API.
                                    undefined : {}}
                                    className="text-lg font-bold mt-6 mb-4"
                                    dangerouslySetInnerHTML={{ __html: section.content }} // Content might be just text, but let's be safe if API adds span
                                />
                            );
                        } else if (section.type === 'paragraph') {
                            return (
                                <div key={idx} 
                                    className="mb-4 text-base leading-relaxed text-justify opacity-90"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                />
                            );
                        } else if (section.type === 'image_prompt') {
                            const imgData = images[idx];
                            return (
                                <div key={idx} className="my-6">
                                    {imgData?.url ? (
                                        <img src={imgData.url} alt="Generated illustration" className="w-full h-auto rounded-lg shadow-sm block" />
                                    ) : (
                                        <div className="w-full h-64 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center text-slate-400 text-sm">
                                            {imgData?.loading ? 'Generating Image...' : 'Image Placeholder'}
                                        </div>
                                    )}
                                    <p className="text-xs text-center text-slate-400 mt-2 italic">AI Generated Illustration</p>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Floating Action Button for Copy */}
      {article && (
        <div className="fixed bottom-8 right-8">
            <button 
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                title="Copy for WeChat Editor"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                <span className="font-medium">Copy Article</span>
            </button>
        </div>
      )}
    </div>
  );
};