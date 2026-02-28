'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, ArrowRight, X } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();

    const [step, setStep] = useState('main');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message || 'Google sign-in failed. Please check your Supabase configuration.');
        }
        setLoading(false);
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!phone) return;
        setLoading(true);
        setError('');
        try {
            await signInWithPhone(`${countryCode}${phone}`);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please check your phone configuration.');
        }
        setLoading(false);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const token = otp.join('');
        if (token.length !== 6) return;
        setLoading(true);
        setError('');
        try {
            await verifyOtp(`${countryCode}${phone}`, token);
            router.push('/feed');
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Instagram</h1>
                    <p>Sign up to see photos and videos from your friends.</p>
                </div>

                {step === 'main' && (
                    <>
                        <button className="social-btn" onClick={handleGoogleLogin} disabled={loading} id="google-login-btn">
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {loading ? 'Connecting...' : 'Log in with Google'}
                        </button>

                        <div className="auth-divider"><div className="divider">OR</div></div>

                        <button className="social-btn" onClick={() => setStep('phone')} id="phone-login-btn">
                            <Phone size={20} />
                            Log in with Phone Number
                        </button>
                    </>
                )}

                {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit} className="auth-form">
                        <button type="button" onClick={() => { setStep('main'); setError(''); }} className="btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <X size={18} /> Back
                        </button>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Enter your phone number to receive a verification code.
                        </p>
                        <div className="phone-input-group">
                            <select className="input country-code" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+61">🇦🇺 +61</option>
                                <option value="+81">🇯🇵 +81</option>
                            </select>
                            <input type="tel" className="input phone-number" placeholder="Phone number" value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} id="phone-input" />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!phone || loading}>
                            {loading ? 'Sending...' : 'Send OTP'} {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="auth-form">
                        <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <X size={18} /> Back
                        </button>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
                            Enter the 6-digit code sent to<br />
                            <strong style={{ color: 'var(--text-primary)' }}>{countryCode} {phone}</strong>
                        </p>
                        <div className="otp-inputs">
                            {otp.map((digit, i) => (
                                <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" className="otp-input"
                                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)} maxLength={1} autoFocus={i === 0} />
                            ))}
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={otp.join('').length !== 6 || loading} style={{ marginTop: '16px' }}>
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '16px' }}>
                            Didn&apos;t receive the code?{' '}
                            <button type="button" style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>Resend</button>
                        </p>
                    </form>
                )}

                {error && (
                    <p style={{ color: 'var(--accent-red)', textAlign: 'center', marginTop: '16px', fontSize: 'var(--font-size-sm)', padding: '12px', background: 'rgba(237,73,86,0.1)', borderRadius: '8px' }}>{error}</p>
                )}

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                        By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
