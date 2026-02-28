'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Search,
    PlusSquare,
    Film,
    User,
    Heart,
    MessageCircle,
    Settings,
    Menu,
} from 'lucide-react';

export default function DesktopNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/feed', icon: Home, label: 'Home' },
        { href: '/explore', icon: Search, label: 'Search' },
        { href: '/reels', icon: Film, label: 'Reels' },
        { href: '/messages', icon: MessageCircle, label: 'Messages' },
        { href: '/create', icon: PlusSquare, label: 'Create' },
        { href: '/profile/me', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="desktop-nav">
            <Link href="/feed" className="desktop-nav-logo">
                Instagram
            </Link>

            <div className="desktop-nav-items">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`desktop-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 1.5}
                                fill={isActive ? 'currentColor' : 'none'}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <Link href="/settings" className="desktop-nav-item">
                    <Settings size={24} strokeWidth={1.5} />
                    <span>Settings</span>
                </Link>
                <button className="desktop-nav-item">
                    <Menu size={24} strokeWidth={1.5} />
                    <span>More</span>
                </button>
            </div>
        </nav>
    );
}
