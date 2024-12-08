import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('이미 사용 중인 이메일입니다. 로그인을 시도해보세요.');
      } else if (error.code === 'auth/invalid-email') {
        alert('유효하지 않은 이메일 형식입니다.');
      } else if (error.code === 'auth/weak-password') {
        alert('비밀번호는 6자 이상이어야 합니다.');
      } else if (error.code === 'auth/user-not-found') {
        alert('등록되지 않은 이메일입니다. 회원가입을 해주세요.');
      } else if (error.code === 'auth/wrong-password') {
        alert('잘못된 비밀번호입니다.');
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{isSignUp ? '회원가입' : '로그인'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button 
          type="submit"
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isSignUp ? '가입하기' : '로그인'}
        </button>
      </form>
      <button 
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ 
          width: '100%', 
          marginTop: '10px',
          padding: '10px', 
          backgroundColor: 'transparent',
          border: '1px solid #4CAF50',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {isSignUp ? '로그인으로 전환' : '회원가입으로 전환'}
      </button>
    </div>
  );
}

export default Login;