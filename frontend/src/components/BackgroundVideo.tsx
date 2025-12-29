import React, { useRef, useEffect } from 'react';

interface BackgroundVideoProps {
  className?: string;
  poster?: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  className = '',
  poster = "https://res.cloudinary.com/di9eeahdy/video/upload/so_0,f_jpg,q_auto/v1766722699/output_yacgth.jpg"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => console.warn('Video autoplay failed:', err));
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      className={`w-full h-full object-cover ${className}`}
    >
      <source src="https://res.cloudinary.com/di9eeahdy/video/upload/f_auto,q_auto/v1766722699/output_yacgth.webm" type="video/webm" />
      <source src="https://res.cloudinary.com/di9eeahdy/video/upload/f_auto,q_auto/v1766722699/output_yacgth.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default BackgroundVideo;