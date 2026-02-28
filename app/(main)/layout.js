'use client';

import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import DesktopNav from '@/components/layout/DesktopNav';
import { AuthProvider } from '@/contexts/AuthContext';

export default function MainLayout({ children }) {
    return (
        <AuthProvider>
            <div className="app-shell">
                <DesktopNav />
                <TopHeader />
                <main className="main-content">
                    {children}
                </main>
                <BottomNav />
            </div>
        </AuthProvider>
    );
}
