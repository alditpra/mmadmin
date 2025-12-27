import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import CarTable from './CarTable';
import TestimonialsTable from './TestimonialsTable';
import SettingsForm from './SettingsForm';

interface User {
    email: string;
    name: string;
    picture?: string;
}

interface DashboardProps {
    user: User;
}

type Tab = 'cars' | 'testimonials' | 'settings';

export default function Dashboard({ user }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('cars');

    return (
        <div className="dashboard">
            <header className="header">
                <div className="header-content">
                    <div className="logo">Admin Dashboard</div>
                    <div className="user-info">
                        <ThemeToggle />
                        {user.picture && (
                            <img src={user.picture} alt={user.name} className="user-avatar" />
                        )}
                        <span className="user-name">{user.name}</span>
                        <a href="/api/auth/logout" className="btn btn-secondary btn-sm">
                            Logout
                        </a>
                    </div>
                </div>
            </header>

            <nav className="tabs">
                <button
                    className={`tab ${activeTab === 'cars' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cars')}
                >
                    🚗 Mobil
                </button>
                <button
                    className={`tab ${activeTab === 'testimonials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('testimonials')}
                >
                    ⭐ Testimonials
                </button>
                <button
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Settings
                </button>
            </nav>

            <main className="container" style={{ padding: '1.5rem', flex: 1 }}>
                {activeTab === 'cars' && <CarTable />}
                {activeTab === 'testimonials' && <TestimonialsTable />}
                {activeTab === 'settings' && <SettingsForm />}
            </main>

            <footer style={{
                textAlign: 'center',
                padding: '1rem',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                borderTop: '1px solid var(--border-color)'
            }}>
                Merdeka Mobil Admin Dashboard
            </footer>
        </div>
    );
}
