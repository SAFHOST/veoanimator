
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { VideoPlayer } from './VideoPlayer';
import { generateVeoVideo } from '../services/geminiService';
import { store } from '../services/store';
import { AspectRatio, Resolution } from '../types';

export const VeoGenerator: React.FC = () => {
  // State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store integration
  const currentUser = store.getCurrentUser();
  const [credits, setCredits] = useState(currentUser?.credits || 0);

  // Refresh credits when component mounts or updates
  useEffect(() => {
    const user = store.getCurrentUser();
    if (user) setCredits(user.credits);
  }, [isGenerating]); // Update after generation

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      setImageFile(file);
      setError(null);
      setGeneratedVideoUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError(null);
      setGeneratedVideoUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (file) {
      setError('Please drop a valid image file.');
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) return setError('Please upload an image first.');
    
    // Check Limits
    if (credits <= 0) {
      return setError('Insufficient credits. Please contact admin or upgrade plan.');
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setStatusMessage('Preparing to generate...');

    try {
      const videoUrl = await generateVeoVideo(
        imageFile,
        aspectRatio,
        resolution,
        prompt.trim() || undefined,
        (msg) => setStatusMessage(msg)
      );
      
      // Success: Deduct Credit
      if (currentUser) {
        store.deductCredit(currentUser.id);
        const updatedUser = store.getUser(currentUser.id);
        if (updatedUser) setCredits(updatedUser.credits);
      }
      
      setGeneratedVideoUrl(videoUrl);
      setStatusMessage('Generation complete!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    setGeneratedVideoUrl(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Veo Studio
            </h1>
            <p className="text-slate-400 mt-2">
              Generate AI videos from your images.
            </p>
          </div>
          <div className="text-right">
             <div className="text-sm text-slate-400">Credits Remaining</div>
             <div className={`text-2xl font-bold ${credits > 0 ? 'text-green-400' : 'text-red-400'}`}>{credits}</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div 
              className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 ${
                imagePreview ? 'border-purple-500/50 bg-purple-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-700/50'
              } h-64 flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white font-medium">Click to change</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                   <p className="text-slate-300 font-medium">Upload Image</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the motion..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                    {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                        <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                            aspectRatio === ratio
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                        >
                        {ratio}
                        </button>
                    ))}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Quality</label>
                    <div className="flex gap-2">
                    {(['720p', '1080p'] as Resolution[]).map((res) => (
                        <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                            resolution === res
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                        >
                        {res}
                        </button>
                    ))}
                    </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!imageFile || isGenerating} className="flex-1">
                  Generate (1 Credit)
                </Button>
                {imageFile && !isGenerating && <Button variant="secondary" onClick={clearSelection}>Clear</Button>}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="flex flex-col h-full min-h-[400px]">
            <div className="bg-black/40 rounded-2xl border border-slate-700 flex-1 flex flex-col items-center justify-center overflow-hidden relative">
              {isGenerating ? (
                <div className="text-center p-8 space-y-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-900/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white animate-pulse">Generating...</h3>
                  <p className="text-purple-300 mt-2 text-sm">{statusMessage}</p>
                </div>
              ) : generatedVideoUrl ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 p-2 flex items-center justify-center bg-slate-900/50">
                     <VideoPlayer src={generatedVideoUrl} className="w-full max-h-[500px] shadow-lg" />
                  </div>
                  <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center gap-4">
                    <span className="text-sm text-slate-400 hidden sm:block">Ready to share</span>
                    <div className="flex gap-3">
                         <a 
                            href={generatedVideoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            Open in New Tab
                        </a>
                        <a 
                            href={generatedVideoUrl} 
                            download={`veo-gen-${resolution}.mp4`} 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download {resolution}
                        </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p>Generated video will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
