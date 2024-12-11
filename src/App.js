import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Auth/Login';
import Board from './components/Board/Board';
import PostDetail from './components/PostDetail';
import Profile from './components/Profile/Profile';
import Chat from './components/Chat/Chat';
import About from './components/About/About';
import './styles/App.css';

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark-mode', isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

function AppContent() {
    const [user, setUser] = useState(null);
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
            {user && (
                <nav className="navbar">
                    <div className="nav-content">
                        <div className="nav-links">
                            <Link to="/">소개</Link>
                            <Link to="/board">게시판</Link>
                            <Link to="/chat">채팅</Link>
                            <Link to="/profile">프로필</Link>
                        </div>
                        <div className="user-info">
                            <button onClick={toggleTheme} className="theme-toggle">
                                {isDarkMode ? '🌞' : '🌙'}
                            </button>
                            <span>{user.email}</span>
                            <button className="logout-btn" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </div>
                    </div>
                </nav>
            )}
            <div className="container">
                <Routes>
                    <Route path="/" element={user ? <About /> : <Login />} />
                    <Route path="/board" element={user ? <Board /> : <Login />} />
                    <Route path="/chat" element={user ? <Chat /> : <Login />} />
                    <Route path="/post/:id" element={user ? <PostDetail /> : <Login />} />
                    <Route path="/profile" element={user ? <Profile /> : <Login />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;