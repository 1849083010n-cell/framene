import { useState, useEffect } from 'react';
import { Image, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { photosApi } from '@/services/frameNe/photos';
import type { PhotoAsset } from '@/services/frameNe/photos';

export function PhotoFrameModule() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await photosApi.list();
        const items: PhotoAsset[] = res.items || [];
        setPhotos(items);
      } catch {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (!isPlaying || photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, photos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image className="w-8 h-8 text-primary" />
            <h2 className="text-2xl">Family Photos</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          加载中...
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image className="w-8 h-8 text-primary" />
            <h2 className="text-2xl">Family Photos</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          暂无照片，请通过 App 上传
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image className="w-8 h-8 text-primary" />
          <h2 className="text-2xl">Family Photos</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-muted rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.file_name || '相册照片'}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full text-sm">
          {currentPhoto.file_name || '相册照片'}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {photos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`
              w-2 h-2 rounded-full transition-all
              ${idx === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'}
            `}
          />
        ))}
      </div>
    </div>
  );
}
