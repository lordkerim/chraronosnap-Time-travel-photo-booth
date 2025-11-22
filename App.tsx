import React, { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { Button } from './components/Button';
import { analyzeImageContent, editImageContent } from './services/geminiService';
import { TimeEra, AppMode, AnalysisResult } from './types';
import { 
  History, 
  Sparkles, 
  Wand2, 
  Scan, 
  ChevronLeft, 
  Download, 
  Clock, 
  Zap, 
  Share2 
} from 'lucide-react';

// Predefined Time Eras / Scenarios
const ERAS: TimeEra[] = [
  { 
    id: 'ancient-egypt', 
    label: 'Ancient Egypt', 
    icon: '🏺', 
    description: 'Pharaohs and Pyramids',
    prompt: 'Keep the face exactly the same. Transform this person into an Ancient Egyptian royalty. Background is a golden palace with hieroglyphs. Photorealistic, cinematic lighting, 8k.'
  },
  { 
    id: 'vikings', 
    label: 'Viking Age', 
    icon: '⚔️', 
    description: 'Warriors of the North',
    prompt: 'Keep the face exactly the same. Transform this person into a fierce Viking warrior with fur armor. Background is a misty fjord with longships. Dramatic, cold tones, cinematic.'
  },
  { 
    id: 'victorian', 
    label: 'Victorian London', 
    icon: '🎩', 
    description: 'Steam and Mystery',
    prompt: 'Keep the face exactly the same. Transform this person into a 19th-century Victorian aristocrat. Sepia tone, vintage photography style. Background is a foggy London street with gas lamps.'
  },
  { 
    id: 'cyberpunk', 
    label: 'Cyberpunk 2077', 
    icon: '🌃', 
    description: 'Neon Future',
    prompt: 'Keep the face exactly the same. Transform this person into a cyberpunk street samurai with glowing tech implants. Background is a rainy neon city night. Vibrant colors, high contrast, futuristic.'
  },
  { 
    id: 'mars', 
    label: 'Mars 3000', 
    icon: '🚀', 
    description: 'Red Planet Colony',
    prompt: 'Keep the face exactly the same. Transform this person into a futuristic astronaut on a Mars colony. Background is red martian landscape with glass domes. Sci-fi realism.'
  },
  {
    id: 'western',
    label: 'Wild West',
    icon: '🤠',
    description: 'Gunslingers & Saloons',
    prompt: 'Keep the face exactly the same. Transform this person into a rugged cowboy/cowgirl in 1880. Sepia, grain, worn texture. Background is a wooden saloon.'
  }
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CAPTURE);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('Initializing...');

  const handleCapture = (img: string) => {
    setSourceImage(img);
    setResultImage(null); // Reset previous result
    setAnalysis(null);
    setMode(AppMode.PREVIEW);
  };

  const handleReset = () => {
    setSourceImage(null);
    setResultImage(null);
    setAnalysis(null);
    setCustomPrompt('');
    setMode(AppMode.CAPTURE);
  };

  const handleTimeTravel = async (era: TimeEra) => {
    if (!sourceImage) return;
    
    setIsLoading(true);
    setLoadingMsg(`Traveling to ${era.label}...`);
    try {
      const generated = await editImageContent(sourceImage, era.prompt);
      setResultImage(generated);
    } catch (error) {
      alert("Time travel malfunction! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicEdit = async () => {
    if (!sourceImage || !customPrompt.trim()) return;

    setIsLoading(true);
    setLoadingMsg('Casting magic spell...');
    try {
      // Use the currently displayed image as source for the edit if we have one, 
      // allowing chained edits. Otherwise use original.
      const inputImg = resultImage || sourceImage;
      const generated = await editImageContent(inputImg, customPrompt);
      setResultImage(generated);
    } catch (error) {
      alert("Spell fizzled. Try a different command.");
    } finally {
      setIsLoading(false);
      setCustomPrompt('');
    }
  };

  const handleAnalyze = async () => {
    if (!sourceImage) return;

    setIsLoading(true);
    setLoadingMsg('Scanning timeline data...');
    try {
      const text = await analyzeImageContent(sourceImage);
      setAnalysis({ text, timestamp: Date.now() });
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-starlight selection:bg-neon-purple selection:text-white pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-void/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-neon-blue animate-pulse-fast" />
            <h1 className="text-xl font-bold tracking-wider font-mono bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              CHRONOSNAP
            </h1>
          </div>
          {mode !== AppMode.CAPTURE && (
            <Button variant="ghost" onClick={handleReset} className="text-sm">
              <ChevronLeft size={16} className="mr-1" /> New Photo
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* LOADING OVERLAY */}
        {isLoading && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-neon-blue/30 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-0 border-t-4 border-neon-purple rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-white animate-pulse" />
            </div>
            <p className="mt-8 text-xl font-mono text-neon-blue animate-pulse">{loadingMsg}</p>
          </div>
        )}

        {/* CAPTURE MODE */}
        {mode === AppMode.CAPTURE && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8 max-w-md">
              <h2 className="text-4xl font-bold mb-4">Step into the Timeline</h2>
              <p className="text-gray-400">Take a selfie or upload a photo to begin your journey through history with Gemini AI.</p>
            </div>
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {/* PREVIEW / DASHBOARD MODE */}
        {mode === AppMode.PREVIEW && sourceImage && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom duration-500">
            
            {/* LEFT: Images Display */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Main Result View */}
              <div className="relative group rounded-2xl overflow-hidden border border-gray-800 bg-black shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[600px]">
                <img 
                  src={resultImage || sourceImage} 
                  alt="Current View" 
                  className="w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
                />
                
                {/* Overlay Controls for Result */}
                {resultImage && (
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href={resultImage} download="chronosnap_time_travel.png" className="p-3 bg-black/70 text-white rounded-full hover:bg-neon-purple transition">
                      <Download size={20} />
                    </a>
                    <button onClick={() => navigator.share({ files: [], title: 'My ChronoSnap', url: '' })} className="p-3 bg-black/70 text-white rounded-full hover:bg-neon-blue transition">
                      <Share2 size={20} />
                    </button>
                  </div>
                )}
                
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur text-xs font-mono text-gray-300 rounded-full border border-gray-700">
                  {resultImage ? 'TIMELINE: ALTERED' : 'TIMELINE: ORIGINAL'}
                </div>
              </div>

              {/* Analysis Result Box */}
              {analysis && (
                <div className="bg-gray-900/80 border border-neon-blue/30 rounded-xl p-6 shadow-[0_0_15px_rgba(0,243,255,0.1)] animate-in fade-in">
                  <div className="flex items-center gap-2 mb-3 text-neon-blue">
                    <Scan size={20} />
                    <h3 className="font-bold tracking-wider">SCENE ANALYSIS</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{analysis.text}</p>
                </div>
              )}
            </div>

            {/* RIGHT: Control Panel */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Section 1: Time Periods */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                  <History size={14} />
                  <span>Select Destination</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ERAS.map((era) => (
                    <button
                      key={era.id}
                      onClick={() => handleTimeTravel(era)}
                      className="group relative p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-neon-purple/50 rounded-xl transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 to-neon-purple/0 group-hover:from-neon-purple/5 group-hover:to-neon-blue/5 transition-all" />
                      <div className="text-2xl mb-2 filter grayscale group-hover:grayscale-0 transition-all">{era.icon}</div>
                      <div className="font-bold text-gray-200 group-hover:text-white">{era.label}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400">{era.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-800" />

              {/* Section 2: Magic Edit */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                  <Wand2 size={14} />
                  <span>Reality Distortion (Magic Edit)</span>
                </div>
                <div className="bg-gray-900/50 p-1 rounded-xl border border-gray-800 focus-within:border-neon-blue transition-colors flex flex-col gap-2">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., 'Add a cyberpunk visor', 'Make it a pencil sketch'..."
                    className="w-full bg-transparent border-none text-white placeholder-gray-600 text-sm p-3 focus:ring-0 resize-none h-20"
                  />
                  <div className="flex justify-end p-2">
                    <Button 
                      variant="neon" 
                      onClick={handleMagicEdit} 
                      disabled={!customPrompt.trim()} 
                      className="py-2 px-4 text-xs"
                      icon={<Sparkles size={14}/>}
                    >
                      Distort
                    </Button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-800" />

              {/* Section 3: Analysis */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                  <Scan size={14} />
                  <span>Timeline Scan</span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleAnalyze} 
                  className="w-full flex justify-between group"
                >
                  <span>Analyze Current Image</span>
                  <Zap size={16} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                </Button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
