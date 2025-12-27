import { useState, useEffect } from 'react';

interface Settings {
    [key: string]: string;
}

export default function SettingsForm() {
    const [settings, setSettings] = useState<Settings>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings berhasil disimpan!' });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan settings.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    const settingsConfig = [
        { key: 'business_name', label: 'Nama Bisnis', type: 'text' },
        { key: 'business_tagline', label: 'Tagline', type: 'text' },
        { key: 'business_address', label: 'Alamat', type: 'text' },
        { key: 'business_city', label: 'Kota', type: 'text' },
        { key: 'whatsapp_number', label: 'Nomor WhatsApp', type: 'text', placeholder: '628xxx' },
        { key: 'promo_active', label: 'Promo Aktif', type: 'toggle' },
        { key: 'promo_emoji', label: 'Emoji Promo', type: 'text' },
        { key: 'promo_text', label: 'Teks Promo', type: 'text' },
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Pengaturan Website</h3>
            </div>
            <div className="card-body">
                {message && (
                    <div className={`error-message ${message.type === 'success' ? 'badge-success' : ''}`} style={{
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : undefined,
                        color: message.type === 'success' ? 'var(--success-color)' : undefined,
                        marginBottom: '1rem',
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        {settingsConfig.filter(s => s.key !== 'promo_active').map(config => (
                            <div className="form-group" key={config.key}>
                                <label className="form-label">{config.label}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={settings[config.key] || ''}
                                    onChange={e => handleChange(config.key, e.target.value)}
                                    placeholder={config.placeholder}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            Promo Aktif
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.promo_active?.toUpperCase() === 'TRUE'}
                                    onChange={e => handleChange('promo_active', e.target.checked ? 'TRUE' : 'FALSE')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    {settings.promo_active?.toUpperCase() === 'TRUE' && (
                        <div className="card" style={{ marginTop: '1rem', background: 'var(--bg-tertiary)' }}>
                            <div className="card-body">
                                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Preview Banner:</p>
                                <p style={{ fontSize: '1.125rem' }}>
                                    {settings.promo_emoji} {settings.promo_text}
                                </p>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
