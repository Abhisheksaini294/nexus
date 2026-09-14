import React from 'react';

interface MeetingControlsProps {
  startCamera: () => Promise<void>;
  shareScreen: () => Promise<void>;
  endCall: () => void;
  connected: boolean;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({ startCamera, shareScreen, endCall, connected }) => (
  <div className="flex gap-4 mb-4">
    <button
      onClick={startCamera}
      className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition"
    >
      Start Camera
    </button>
    <button
      onClick={shareScreen}
      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition"
    >
      Share Screen
    </button>
    {connected && (
      <button
        onClick={endCall}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition"
      >
        End Call
      </button>
    )}
  </div>
);

export default MeetingControls;
