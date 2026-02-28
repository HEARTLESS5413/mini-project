'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPost, createReel, createStory, uploadFile } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Upload, Image, Film, Clock, X, Loader } from 'lucide-react';

export default function CreatePage() {
    const { user } = useAuth();
    const router = useRouter();
    const fileRef = useRef(null);

    const [type, setType] = useState('post');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(f);
    };

    const handleSubmit = async () => {
        if (!file || !user) return;
        setUploading(true);
        setError('');

        try {
            const bucket = type === 'post' ? 'posts' : type === 'reel' ? 'reels' : 'stories';
            const ext = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${ext}`;

            const { url, error: uploadErr } = await uploadFile(bucket, filePath, file);
            if (uploadErr) throw uploadErr;

            if (type === 'post') {
                await createPost(user.id, url, caption, file.type.startsWith('video') ? 'video' : 'image');
            } else if (type === 'reel') {
                await createReel(user.id, url, caption);
            } else {
                await createStory(user.id, url, file.type.startsWith('video') ? 'video' : 'image');
            }

            router.push('/feed');
        } catch (err) {
            setError(err.message || 'Upload failed');
        }
        setUploading(false);
    };

    const types = [
        { id: 'post', icon: Image, label: 'Post' },
        { id: 'reel', icon: Film, label: 'Reel' },
        { id: 'story', icon: Clock, label: 'Story' },
    ];

    return (
        <div className="create-page">
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>Create</h2>

            {/* Type selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                {types.map(t => (
                    <button key={t.id}
                        className={`btn ${type === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setType(t.id)}
                        style={{ gap: '6px' }}>
                        <t.icon size={16} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Upload area */}
            {!preview ? (
                <div className="upload-area" onClick={() => fileRef.current?.click()}>
                    <Upload size={48} />
                    <p style={{ marginTop: '16px', fontWeight: 600 }}>
                        {type === 'reel' ? 'Upload a video for your reel' : 'Drag photos and videos here'}
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '8px' }}>
                        Select from your device
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: '16px' }}>Select File</button>
                </div>
            ) : (
                <div className="upload-preview">
                    <button onClick={() => { setFile(null); setPreview(null); }}
                        style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <X size={18} />
                    </button>
                    {file?.type.startsWith('video') ? (
                        <video src={preview} controls style={{ width: '100%', borderRadius: 'var(--radius-xl)' }} />
                    ) : (
                        <img src={preview} alt="Preview" />
                    )}
                </div>
            )}

            <input ref={fileRef} type="file" accept={type === 'reel' ? 'video/*' : 'image/*,video/*'}
                onChange={handleFile} style={{ display: 'none' }} id="file-upload-input" />

            {/* Caption */}
            {preview && type !== 'story' && (
                <textarea className="caption-input" placeholder="Write a caption..." value={caption}
                    onChange={(e) => setCaption(e.target.value)} style={{ marginTop: '16px' }} />
            )}

            {/* Submit */}
            {preview && (
                <button className="btn btn-primary btn-block btn-lg" onClick={handleSubmit}
                    disabled={uploading} style={{ marginTop: '16px' }}>
                    {uploading ? <><Loader size={18} className="animate-spin" /> Uploading...</> : `Share ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </button>
            )}

            {error && (
                <p style={{ color: 'var(--accent-red)', textAlign: 'center', marginTop: '12px', fontSize: 'var(--font-size-sm)' }}>{error}</p>
            )}
        </div>
    );
}
