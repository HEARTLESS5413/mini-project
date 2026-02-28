'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
    return (
        <div className="auth-page">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <h1 style={{
                    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                    fontSize: '42px',
                    fontWeight: 400,
                    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                }}>
                    Instagram
                </h1>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: { width: '100%', maxWidth: '400px' },
                            card: { background: '#000', border: '1px solid #262626', boxShadow: 'none' },
                            headerTitle: { display: 'none' },
                            headerSubtitle: { display: 'none' },
                            socialButtonsBlockButton: {
                                border: '1px solid #363636',
                                background: '#1a1a1a',
                            },
                            formFieldInput: {
                                background: '#1a1a1a',
                                border: '1px solid #363636',
                                color: '#f5f5f5',
                            },
                            footerActionLink: { color: '#0095f6' },
                            formButtonPrimary: {
                                background: '#0095f6',
                                fontWeight: 600,
                            },
                        },
                    }}
                    routing="hash"
                    forceRedirectUrl="/feed"
                />
            </div>
        </div>
    );
}
