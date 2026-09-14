import { forwardRef } from 'react';

interface VideoStreamProps {
  label: string;
}

const VideoStream = forwardRef<HTMLVideoElement, VideoStreamProps>((props, ref) => (
  <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800">
    <video ref={ref} autoPlay playsInline muted className="w-full h-auto" />
    <span className="absolute bottom-2 left-2 bg-black/50 text-xs px-2 py-1 rounded">
      {props.label}
    </span>
  </div>
));

export default VideoStream;
