import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

function Chat() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // 메시지 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 실시간 메시지 업데이트
    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messageList);
        });

        return () => unsubscribe();
    }, []);

    // 메시지 전송
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await addDoc(collection(db, 'messages'), {
                text: message,
                createdAt: new Date(),
                userId: auth.currentUser.uid,
                userName: auth.currentUser.email
            });

            setMessage('');
        } catch (error) {
            console.error('Error:', error);
            alert('메시지 전송 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2>실시간 채팅</h2>
            
            {/* 채팅 메시지 영역 */}
            <div style={{ 
                height: '500px', 
                overflowY: 'auto', 
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '20px',
                backgroundColor: '#f8f9fa'
            }}>
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        style={{
                            marginBottom: '10px',
                            textAlign: msg.userId === auth.currentUser.uid ? 'right' : 'left'
                        }}
                    >
                        <small style={{ 
                            color: '#666',
                            fontSize: '0.8em',
                            display: 'block',
                            marginBottom: '2px'
                        }}>
                            {msg.userName}
                        </small>
                        <div style={{
                            background: msg.userId === auth.currentUser.uid ? '#007bff' : '#e9ecef',
                            color: msg.userId === auth.currentUser.uid ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '15px',
                            display: 'inline-block',
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 폼 */}
            <form 
                onSubmit={handleSubmit} 
                style={{ 
                    display: 'flex', 
                    gap: '10px'
                }}
            >
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    style={{ 
                        flex: 1, 
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ddd'
                    }}
                />
                <button 
                    type="submit"
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    전송
                </button>
            </form>
        </div>
    );
}

export default Chat;