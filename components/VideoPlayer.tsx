import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className = '', poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black shadow-2xl ${className}`}>
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        autoPlay
        loop
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};