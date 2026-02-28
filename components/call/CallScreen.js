'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, X } from 'lucide-react';

export default function CallScreen({ user, callType, onEnd }) {
    const [callState, setCallState] = useState('connecting'); // connecting | ringing | connected | ended
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        // Simulate connection
        const timer1 = setTimeout(() => setCallState('ringing'), 1000);
        const timer2 = setTimeout(() => setCallState('connected'), 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    useEffect(() => {
        if (callState !== 'connected') return;
        const interval = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [callState]);

    const formatDuration = (s) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const getStatusText = () => {
        switch (callState) {
            case 'connecting': return 'Connecting...';
            case 'ringing': return 'Ringing...';
            case 'connected': return formatDuration(duration);
            case 'ended': return 'Call ended';
            default: return '';
        }
    };

    const handleEnd = () => {
        setCallState('ended');
        setTimeout(onEnd, 500);
    };

    // Video call UI
    if (callType === 'video') {
        return (
            <div className="video-call-screen">
                {/* Remote video (simulated with user avatar) */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={user.avatar_url}
                            alt={user.username}
                            style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '16px' }}
                        />
                        <p style={{ color: 'white', fontSize: '22px', fontWeight: 600 }}>{user.full_name || user.username}</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{getStatusText()}</p>
                    </div>
                </div>

                {/* Local video preview */}
                <div className="video-local">
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #2d2d44, #1a1a2e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {isVideoOn ? (
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Camera</span>
                        ) : (
                            <VideoOff size={24} color="rgba(255,255,255,0.5)" />
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="video-call-controls">
                    <button
                        className={`call-btn ${isMuted ? '' : 'call-btn-mute'}`}
                        onClick={() => setIsMuted(!isMuted)}
                        style={{ background: isMuted ? 'white' : 'var(--bg-elevated)' }}
                    >
                        {isMuted ? <MicOff size={22} color="#000" /> : <Mic size={22} />}
                    </button>
                    <button
                        className={`call-btn ${!isVideoOn ? '' : 'call-btn-video'}`}
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        style={{ background: !isVideoOn ? 'white' : 'var(--bg-elevated)' }}
                    >
                        {isVideoOn ? <Video size={22} /> : <VideoOff size={22} color="#000" />}
                    </button>
                    <button className="call-btn call-btn-end" onClick={handleEnd}>
                        <PhoneOff size={28} />
                    </button>
                </div>
            </div>
        );
    }

    // Audio call UI
    return (
        <div className="call-screen" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            {/* Decorative circles */}
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,149,246,0.1) 0%, transparent 70%)',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'pulse 3s ease-in-out infinite',
            }} />

            <img
                src={user.avatar_url}
                alt={user.username}
                className="call-avatar"
                style={{
                    border: callState === 'connected' ? '3px solid var(--accent-green)' : '3px solid var(--border-light)',
                    boxShadow: callState === 'connected' ? '0 0 30px rgba(88, 195, 34, 0.3)' : 'none',
                    transition: 'all 0.5s ease',
                }}
            />

            <h2 className="call-name" style={{ color: 'white' }}>{user.full_name || user.username}</h2>
            <p className="call-status">{getStatusText()}</p>

            <div className="call-controls">
                <button
                    className={`call-btn ${isMuted ? '' : 'call-btn-mute'}`}
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ background: isMuted ? 'white' : 'rgba(255,255,255,0.15)' }}
                >
                    {isMuted ? <MicOff size={24} color="#000" /> : <Mic size={24} />}
                </button>

                <button className="call-btn call-btn-end" onClick={handleEnd}>
                    <PhoneOff size={28} />
                </button>

                <button
                    className={`call-btn ${isSpeaker ? '' : 'call-btn-speaker'}`}
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    style={{ background: isSpeaker ? 'white' : 'rgba(255,255,255,0.15)' }}
                >
                    <Volume2 size={24} color={isSpeaker ? '#000' : 'white'} />
                </button>
            </div>
        </div>
    );
}
