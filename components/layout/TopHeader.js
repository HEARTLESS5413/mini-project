'use client';

import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';

export default function TopHeader() {
    return (
        <header className="top-header">
            <Link href="/feed" style={{ textDecoration: 'none' }}>
                <h1 className="top-header-logo">Instagram</h1>
            </Link>
            <div className="top-header-actions">
                <button aria-label="Notifications" className="btn-icon">
                    <Heart size={24} strokeWidth={1.5} />
                </button>
                <Link href="/messages" aria-label="Messages">
                    <button className="btn-icon" style={{ position: 'relative' }}>
                        <MessageCircle size={24} strokeWidth={1.5} />
                        <span
                            className="badge"
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                minWidth: '16px',
                                height: '16px',
                                fontSize: '10px',
                            }}
                        >
                            3
                        </span>
                    </button>
                </Link>
            </div>
        </header>
    );
}
