import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import OpenAI from 'openai';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

function Board() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [summaries, setSummaries] = useState({});
    const [isEditing, setIsEditing] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState('all');
    const postsPerPage = 5;

    const categories = [
        'all',
        'general',
        'question',
        'discussion',
        'share'
    ];

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const summarizeContent = async (content, postId) => {
        try {
            const completion = await openai.chat.completions.create({
                messages: [{ 
                    role: "user", 
                    content: `다음 내용을 한 줄로 요약해주세요: ${content}` 
                }],
                model: "gpt-3.5-turbo",
            });
            
            setSummaries(prev => ({
                ...prev,
                [postId]: completion.choices[0].message.content
            }));
        } catch (error) {
            console.error('GPT API Error:', error);
            alert('요약을 생성하는 중 오류가 발생했습니다.');
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || post.category === category;
        return matchesSearch && matchesCategory;
    });

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const pageNumbers = Math.ceil(filteredPosts.length / postsPerPage);

    const getPosts = async () => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPosts(postList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || category === 'all') {
            alert('제목, 내용, 카테고리를 모두 입력해주세요.');
            return;
        }
        let imageUrl = '';

        try {
            if (image) {
                const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            const docRef = await addDoc(collection(db, 'posts'), {
                title,
                content,
                imageUrl,
                createdAt: new Date(),
                author: auth.currentUser.email,
                category: category,
                likes: 0
            });

            summarizeContent(content, docRef.id);
            setTitle('');
            setContent('');
            setImage(null);
            setCategory('all');
            getPosts();
        } catch (error) {
            console.error('Error:', error);
            alert('게시글 작성 중 오류가 발생했습니다.');
        }
    };

    const handleDeletePost = async (postId, imageUrl) => {
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            if (imageUrl) {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            }
            await deleteDoc(doc(db, 'posts', postId));
            getPosts();
        } catch (error) {
            console.error('Error:', error);
            alert('게시글 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleUpdatePost = async (postId) => {
        if (!editTitle.trim() || !editContent.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        try {
            await updateDoc(doc(db, 'posts', postId), {
                title: editTitle,
                content: editContent,
                updatedAt: new Date()
            });
            setIsEditing(null);
            getPosts();
        } catch (error) {
            alert('게시글 수정 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        getPosts();
    }, []);

    return (
        <div className="board-container">
            <h2>게시글 작성</h2>
            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? '카테고리 선택' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                    
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="form-input"
                        required
                    />
                    
                    <ReactQuill 
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        className="quill-editor"
                        placeholder="내용을 입력하세요"
                    />
                    
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        accept="image/*"
                        className="file-input"
                    />
                </div>
                
                <button type="submit" className="button button-primary">
                    작성하기
                </button>
            </form>

            <div className="search-bar">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="category-select"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? '전체' : cat}
                        </option>
                    ))}
                </select>
                
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <h2>게시글 목록</h2>
            {currentPosts.map(post => (
                <div key={post.id} className="post-card">
                    <span className="post-category">{post.category}</span>
                    <Link to={`/post/${post.id}`} className="post-link">
                        <h3 className="post-title">{post.title}</h3>
                    </Link>
                    <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content.length > 100 ? 
                        post.content.substring(0, 100) + '...' : post.content }} />
                    
                    {summaries[post.id] ? (
                        <div className="ai-summary">
                            <strong>AI 요약:</strong> {summaries[post.id]}
                        </div>
                    ) : (
                        <button
                            onClick={() => summarizeContent(post.content, post.id)}
                            className="button button-secondary"
                        >
                            AI 요약 생성
                        </button>
                    )}

                    {post.imageUrl && (
                        <img 
                            src={post.imageUrl} 
                            alt="게시글 이미지" 
                            className="post-image"
                        />
                    )}

                    <div className="post-footer">
                        <span className="post-author">작성자: {post.author}</span>
                        <span className="post-date">
                            작성일: {post.createdAt.toDate().toLocaleDateString()}
                        </span>
                        <span className="post-likes">좋아요: {post.likes || 0}</span>

                        {auth.currentUser?.email === post.author && (
                            <div className="post-actions">
                                <button
                                    onClick={() => handleDeletePost(post.id, post.imageUrl)}
                                    className="button button-danger"
                                >
                                    삭제
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(post.id);
                                        setEditTitle(post.title);
                                        setEditContent(post.content);
                                    }}
                                    className="button button-primary"
                                >
                                    수정
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing === post.id && (
                        <div className="edit-form">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="form-input"
                                placeholder="제목"
                            />
                            <ReactQuill 
                                value={editContent}
                                onChange={setEditContent}
                                modules={modules}
                                className="quill-editor"
                            />
                            <div className="button-group">
                                <button 
                                    onClick={() => handleUpdatePost(post.id)}
                                    className="button button-primary"
                                >
                                    저장
                                </button>
                                <button 
                                    onClick={() => setIsEditing(null)}
                                    className="button button-secondary"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <div className="pagination">
                {Array.from({ length: pageNumbers }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Board;