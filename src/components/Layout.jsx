import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopNav from './TopNav';
import Rightbar from './Rightbar';
import Topbar from './Topbar';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setIsCreateModalOpen(false);
    }, [location.pathname]);

    // Hide navs on auth pages
    if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
        return <>{children}</>;
    }

    if (!user) return <>{children}</>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', color: 'var(--text-main)' }}>
            {/* Desktop Left Sidebar (Fixed) - 244px */}
            <div className="hide-on-mobile" style={{ width: '244px', flexShrink: 0 }}>
                <Sidebar />
            </div>

            {/* Main Wrapper (Center + Right) */}
            <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>

                {/* Center Content Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

                    {/* Desktop Topbar - Hidden on Mobile, Visible on Desktop */}
                    <div className="hide-on-mobile">
                        <Topbar />
                    </div>

                    {/* Mobile TopNav */}
                    <div className="hide-on-desktop">
                        <TopNav />
                    </div>

                    {/* Main Content Scrollable Area */}
                    <main className="main-content-layout" style={{
                        flex: 1,
                        maxWidth: '100%',
                        width: '100%',
                        position: 'relative'
                    }}>
                        {children}
                    </main>

                    {/* Mobile Bottom Nav */}
                    <div className="hide-on-desktop">
                        <BottomNav onCreateClick={() => setIsCreateModalOpen(true)} />
                    </div>
                </div>

                {/* Desktop Rightbar (Fixed width) - 320px */}
                <div className="hide-on-mobile hide-on-tablet" style={{ width: '320px', flexShrink: 0 }}>
                    <Rightbar />
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
};

export default Layout;
