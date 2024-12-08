// App.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Auth/Login';
import Board from './components/Board/Board';
import PostDetail from './components/PostDetail';
import Profile from './components/Profile/Profile';
import Chat from './components/Chat/Chat';
import './styles/App.css';

function App() {
   const [user, setUser] = useState(null);

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
       <Router>
           <div>
               {user && (
                   <nav className="navbar">
                       <div className="nav-content">
                           <div className="nav-links">
                               <Link to="/">게시판</Link>
                               <Link to="/chat">채팅</Link>
                               <Link to="/profile">프로필</Link>
                           </div>
                           <div className="user-info">
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
                       <Route path="/" element={user ? <Board /> : <Login />} />
                       <Route path="/chat" element={user ? <Chat /> : <Login />} />
                       <Route path="/post/:id" element={user ? <PostDetail /> : <Login />} />
                       <Route path="/profile" element={user ? <Profile /> : <Login />} />
                   </Routes>
               </div>
           </div>
       </Router>
   );
}

export default App;