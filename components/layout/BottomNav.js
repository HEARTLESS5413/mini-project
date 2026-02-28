'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Film, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/feed', icon: Home, label: 'Home' },
        { href: '/explore', icon: Search, label: 'Search' },
        { href: '/create', icon: PlusSquare, label: 'Create' },
        { href: '/reels', icon: Film, label: 'Reels' },
        { href: '/profile/me', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        aria-label={item.label}
                    >
                        <Icon
                            size={24}
                            strokeWidth={isActive ? 2.5 : 1.5}
                            fill={isActive ? 'currentColor' : 'none'}
                        />
                    </Link>
                );
            })}
        </nav>
    );
}
