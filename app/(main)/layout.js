'use client';

import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import DesktopNav from '@/components/layout/DesktopNav';

export default function MainLayout({ children }) {
    return (
        <div className="app-shell">
            <DesktopNav />
            <TopHeader />
            <main className="main-content">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
