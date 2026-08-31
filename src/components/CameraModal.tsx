import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        'Não foi possível acessar a câmera. Verifique as permissões do seu navegador ou envie uma foto da galeria.'
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to square crop or video proportions
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    // Center crop for a chic square product photo
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    context.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    // Convert to compressed jpeg
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);

    // Stop camera stream while previewing
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCapturedPhoto(null);
    setError(null);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2B1F]/80 backdrop-blur-xs p-4"
    >
      <div
        id="camera-modal-content"
        className="bg-[#FAF8F5] rounded-sm max-w-md w-full overflow-hidden shadow-2xl border border-[#D9C5B2] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D9C5B2] bg-white">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#3D2B1F]" />
            <h3 className="font-serif text-base font-normal text-[#3D2B1F]">
              Tirar Foto da Peça
            </h3>
          </div>
          <button
            id="camera-modal-close-btn"
            onClick={handleClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-square bg-[#1A120B] flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full object-cover"
            />
          ) : error ? (
            <div className="p-6 text-center text-white/90">
              <AlertCircle className="w-8 h-8 text-[#D9C5B2] mx-auto mb-3" />
              <p className="text-xs mb-4 leading-relaxed font-light">{error}</p>
              <button
                id="camera-retry-btn"
                onClick={startCamera}
                className="px-4 py-2 bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest rounded-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A120B] text-white z-10">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#D9C5B2] mb-2" />
                  <span className="text-[10px] uppercase tracking-widest">Iniciando câmera...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Chic focus framing overlay */}
              <div className="absolute inset-8 border border-white/30 rounded-sm pointer-events-none flex items-center justify-center">
                <div className="w-4 h-4 border-t border-l border-[#D9C5B2] absolute top-2 left-2" />
                <div className="w-4 h-4 border-t border-r border-[#D9C5B2] absolute top-2 right-2" />
                <div className="w-4 h-4 border-b border-l border-[#D9C5B2] absolute bottom-2 left-2" />
                <div className="w-4 h-4 border-b border-r border-[#D9C5B2] absolute bottom-2 right-2" />
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-[#D9C5B2] flex items-center justify-between">
          {capturedPhoto ? (
            <div className="flex w-full gap-2.5">
              <button
                id="camera-retake-btn"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-sm border border-[#D9C5B2] text-[#3D2B1F] hover:bg-[#F0EBE6] text-[10px] uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tirar Outra
              </button>
              <button
                id="camera-confirm-btn"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-3.5 h-3.5 text-[#D9C5B2]" />
                Usar Esta Foto
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                id="camera-flip-btn"
                onClick={toggleCamera}
                disabled={Boolean(error) || isLoading}
                className="p-2.5 text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors disabled:opacity-40"
                title="Trocar câmera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                id="camera-snap-btn"
                onClick={handleCapture}
                disabled={Boolean(error) || isLoading}
                className="w-14 h-14 rounded-full bg-[#3D2B1F] hover:bg-[#2C1F16] text-white p-1 shadow-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:scale-100 border-2 border-[#D9C5B2]"
                title="Capturar foto"
              >
                <div className="w-10 h-10 rounded-full border border-white bg-white/20" />
              </button>

              <label
                id="camera-gallery-fallback"
                className="p-2.5 text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors cursor-pointer"
                title="Escolher da galeria"
              >
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          onCapture(event.target.result as string);
                          handleClose();
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
