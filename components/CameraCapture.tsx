import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './Button';
import { Camera, Upload, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally for mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        onCapture(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-glass border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative group">
      {error ? (
         <div className="h-96 flex flex-col items-center justify-center text-center p-6 bg-gray-900">
           <p className="text-red-400 mb-4">{error}</p>
           <label className="cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              <Button variant="outline" icon={<Upload size={20} />}>Upload Image Instead</Button>
           </label>
         </div>
      ) : (
        <div className="relative h-[500px] bg-black flex items-center justify-center overflow-hidden">
            {!isStreamActive && <div className="text-gray-500 animate-pulse">Initializing Chrono-Visor...</div>}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${isStreamActive ? 'opacity-100' : 'opacity-0'}`} 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay UI */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6 backdrop-blur-sm">
              <label className="cursor-pointer p-4 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <Upload size={24} />
              </label>
              
              <button 
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white/30 bg-neon-purple/90 hover:bg-neon-purple hover:scale-105 transition-all shadow-[0_0_30px_rgba(176,38,255,0.5)] flex items-center justify-center group-hover:animate-pulse"
              >
                <Camera size={32} className="text-white" />
              </button>

              <button 
                onClick={startCamera}
                className="p-4 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition-colors"
              >
                <RefreshCw size={24} />
              </button>
            </div>
        </div>
      )}
    </div>
  );
};
