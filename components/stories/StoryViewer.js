'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StoryViewer({ stories, user, onClose, onNext }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const nextStory = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
            setProgress(0);
        } else {
            onNext?.();
        }
    }, [currentIndex, stories.length, onNext]);

    const prevStory = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setProgress(0);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    nextStory();
                    return 0;
                }
                return p + 2;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [currentIndex, nextStory]);

    const story = stories[currentIndex];
    if (!story) return null;

    return (
        <div className="overlay" style={{ zIndex: 200, background: 'black' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '100vh' }}>
                {/* Progress bars */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 10 }}>
                    {stories.map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '1px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                background: 'white',
                                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                                transition: i === currentIndex ? 'width 0.1s linear' : 'none',
                            }} />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ position: 'absolute', top: '16px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                    <img src={user?.avatar_url || '/default-avatar.svg'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{user?.username}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={onClose} style={{ color: 'white' }}><X size={24} /></button>
                </div>

                {/* Media */}
                <img src={story.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {/* Touch zones */}
                <div onClick={prevStory} style={{ position: 'absolute', left: 0, top: 0, width: '30%', height: '100%', cursor: 'pointer' }} />
                <div onClick={nextStory} style={{ position: 'absolute', right: 0, top: 0, width: '70%', height: '100%', cursor: 'pointer' }} />
            </div>
        </div>
    );
}
