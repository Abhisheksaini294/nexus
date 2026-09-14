'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPeer } from '@/lib/peer';
import VideoStream from '@/components/VideoStream';
import MeetingControls from '@/components/MeetingControls';

type ScreenSize = 'small' | 'medium' | 'large' | 'fullscreen';

const SCREEN_SIZE_CONFIG: Record<ScreenSize, { label: string; icon: string; width: string; height: string }> = {
  small:      { label: 'Small',      icon: '⊡', width: '480px',  height: '270px' },
  medium:     { label: 'Medium',     icon: '⊞', width: '720px',  height: '405px' },
  large:      { label: 'Large',      icon: '⧈', width: '100%',   height: '560px' },
  fullscreen: { label: 'Fullscreen', icon: '⛶', width: '100%',   height: '100%' },
};

export default function MeetingPage() {
  const [peer, setPeer] = useState<any>(null);
  const [roomId, setRoomId] = useState('');
  const [connected, setConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>('large');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Initialize Peer when component mounts
  useEffect(() => {
    const p = createPeer();
    p.on('open', (id: string) => {
      console.log('My peer ID:', id);
    });
    p.on('call', (call: any) => {
      // Answer incoming call with local stream
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        call.answer(stream);
        call.on('stream', (remote: MediaStream) => {
          setRemoteStream(remote);
        });
      }
    });
    setPeer(p);
    return () => {
      p.destroy();
    };
  }, []);

  // Attach streams to video elements
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Attach screen stream
  useEffect(() => {
    if (screenShareRef.current && screenStream) {
      screenShareRef.current.srcObject = screenStream;
      screenShareRef.current.play().catch(() => {});
    }
  }, [screenStream]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();
    }
  };

  const joinRoom = async () => {
    if (!peer || !roomId) return;
    const stream = (localVideoRef.current?.srcObject as MediaStream) ||
      (await navigator.mediaDevices.getUserMedia({ video: true, audio: true }));
    const call = peer.call(roomId, stream);
    call.on('stream', (remote: MediaStream) => {
      setRemoteStream(remote);
    });
    setConnected(true);
  };

  const shareScreen = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true });
      setScreenStream(stream);
      setIsScreenSharing(true);

      // Listen for the user stopping the share via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setIsScreenSharing(false);
        setScreenStream(null);
      });
    } catch (err) {
      console.log('Screen share cancelled');
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  };

  const endCall = () => {
    peer?.destroy();
    setConnected(false);
    setRemoteStream(null);
    stopScreenShare();
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
    }
    setPeer(createPeer());
  };

  const toggleFullscreen = useCallback(() => {
    if (screenSize === 'fullscreen') {
      setScreenSize('large');
    } else {
      setScreenSize('fullscreen');
    }
  }, [screenSize]);

  const isFullscreen = screenSize === 'fullscreen';

  return (
    <section
      className="meeting-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 40%, #16213e 100%)',
        color: '#fff',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(15, 12, 41, 0.7)',
          zIndex: 50,
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ● 
          </span>{' '}
          Live Meeting
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              width: '220px',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            onClick={joinRoom}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)'; }}
          >
            Join Room
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* LEFT SIDE — Controls + Camera Feeds */}
        <aside
          style={{
            width: isFullscreen ? '0px' : '320px',
            minWidth: isFullscreen ? '0px' : '320px',
            transition: 'width 0.3s ease, min-width 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
            opacity: isFullscreen ? 0 : 1,
            overflow: isFullscreen ? 'hidden' : 'auto',
            padding: isFullscreen ? '0' : '24px 20px',
            borderRight: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={startCamera}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.15s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(56,239,125,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              📹 Start Camera
            </button>

            {/* Large Share Screen Button */}
            <button
              onClick={isScreenSharing ? stopScreenShare : shareScreen}
              style={{
                padding: '20px 16px',
                borderRadius: '16px',
                border: isScreenSharing ? '2px solid #ef4444' : '2px solid rgba(99,102,241,0.4)',
                background: isScreenSharing
                  ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: isScreenSharing
                  ? '0 6px 25px rgba(239,68,68,0.4)'
                  : '0 6px 25px rgba(79,70,229,0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = isScreenSharing ? '0 8px 30px rgba(239,68,68,0.6)' : '0 8px 30px rgba(79,70,229,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = isScreenSharing ? '0 6px 25px rgba(239,68,68,0.4)' : '0 6px 25px rgba(79,70,229,0.4)'; }}
            >
              <span style={{ fontSize: '1.8rem' }}>{isScreenSharing ? '🛑' : '🖥️'}</span>
              <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
              {isScreenSharing && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    animation: 'pulse-dot 1.5s infinite',
                  }}
                />
              )}
            </button>

            {connected && (
              <button
                onClick={endCall}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(220,38,38,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                📴 End Call
              </button>
            )}
          </div>

          {/* Peer ID display */}
          {peer && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                wordBreak: 'break-all',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Your ID:</span>{' '}
              <span style={{ color: '#a5b4fc' }}>{peer.id || 'Connecting...'}</span>
            </div>
          )}

          {/* Camera Feeds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
              <span
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                You
              </span>
            </div>

            {remoteStream && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  Partner
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT SIDE — Screen Share Display */}
        <main
          ref={screenContainerRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isScreenSharing ? 'flex-start' : 'center',
            padding: isFullscreen ? '0' : '24px',
            overflow: 'auto',
            transition: 'padding 0.3s ease',
            position: 'relative',
          }}
        >
          {isScreenSharing ? (
            <>
              {/* Size Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: isFullscreen ? '0' : '16px',
                  padding: '6px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  position: isFullscreen ? 'fixed' : 'relative',
                  top: isFullscreen ? '12px' : 'auto',
                  right: isFullscreen ? '12px' : 'auto',
                  zIndex: 100,
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', padding: '0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  View
                </span>
                {(Object.keys(SCREEN_SIZE_CONFIG) as ScreenSize[]).map((size) => {
                  const cfg = SCREEN_SIZE_CONFIG[size];
                  const isActive = screenSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setScreenSize(size)}
                      title={cfg.label}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : 'transparent',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isActive ? '0 2px 10px rgba(102,126,234,0.4)' : 'none',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {/* Screen Share Video */}
              <div
                style={{
                  width: SCREEN_SIZE_CONFIG[screenSize].width,
                  height: SCREEN_SIZE_CONFIG[screenSize].height,
                  maxWidth: '100%',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: isFullscreen ? '0' : '16px',
                  overflow: 'hidden',
                  position: isFullscreen ? 'fixed' : 'relative',
                  top: isFullscreen ? '0' : 'auto',
                  left: isFullscreen ? '0' : 'auto',
                  zIndex: isFullscreen ? 99 : 1,
                  background: '#000',
                  boxShadow: isFullscreen ? 'none' : '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    background: '#000',
                  }}
                />
                {/* Screen share label */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    zIndex: 5,
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse-dot 1.5s infinite',
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                    Screen Sharing
                  </span>
                </div>

                {/* Stop sharing overlay button */}
                <button
                  onClick={stopScreenShare}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(220, 38, 38, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    zIndex: 5,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}
                >
                  🛑 Stop Sharing
                </button>
              </div>
            </>
          ) : (
            /* Placeholder when not sharing */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '48px',
                borderRadius: '24px',
                border: '2px dashed rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                maxWidth: '500px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(168,85,247,0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                🖥️
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                  No Screen Shared
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  Click <strong style={{ color: '#a5b4fc' }}>"Share Screen"</strong> on the left panel to start sharing your screen. You can choose from multiple viewing sizes.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </section>
  );
}
