import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Profile() {
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setNickname(data.nickname || '');
                setBio(data.bio || '');
                setImageUrl(data.imageUrl || '');
            }
        };
        getProfile();
    }, []);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let newImageUrl = imageUrl;
            
            if (profileImage) {
                const imageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
                await uploadBytes(imageRef, profileImage);
                newImageUrl = await getDownloadURL(imageRef);
            }

            const userRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                await updateDoc(userRef, {
                    nickname,
                    bio,
                    imageUrl: newImageUrl
                });
            } else {
                await setDoc(userRef, {
                    nickname,
                    bio,
                    imageUrl: newImageUrl,
                    email: auth.currentUser.email
                });
            }

            setImageUrl(newImageUrl);
            setIsEditing(false);
            alert('프로필이 업데이트되었습니다.');
        } catch (error) {
            console.error('Error:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>프로필</h2>
            {isEditing ? (
                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>프로필 이미지</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            style={{ display: 'block', marginTop: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginTop: '5px',
                                borderRadius: '5px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>자기소개</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginTop: '5px',
                                height: '100px',
                                borderRadius: '5px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                    >
                        저장
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                </form>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="프로필"
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '20px'
                            }}
                        />
                    )}
                    <h3>{nickname || auth.currentUser.email}</h3>
                    <p style={{ color: '#666', whiteSpace: 'pre-wrap' }}>{bio || '자기소개가 없습니다.'}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        프로필 수정
                    </button>
                </div>
            )}
        </div>
    );
}

export default Profile;