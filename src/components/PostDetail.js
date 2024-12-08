// PostDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, addDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import OpenAI from 'openai';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const openai = new OpenAI({
   apiKey: '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',
   dangerouslyAllowBrowser: true
});

function PostDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [post, setPost] = useState(null);
   const [comments, setComments] = useState([]);
   const [newComment, setNewComment] = useState('');
   const [editingComment, setEditingComment] = useState(null);
   const [editCommentText, setEditCommentText] = useState('');
   const [summary, setSummary] = useState('');
   const [likes, setLikes] = useState(0);
   const [hasLiked, setHasLiked] = useState(false);
   const [prevPost, setPrevPost] = useState(null);
   const [nextPost, setNextPost] = useState(null);

   const modules = {
       toolbar: [
           [{ 'header': [1, 2, 3, false] }],
           ['bold', 'italic', 'underline', 'strike'],
           [{ 'color': [] }, { 'background': [] }],
           [{ 'align': [] }],
           ['clean']
       ],
   };

   useEffect(() => {
       const getPost = async () => {
           const docRef = doc(db, 'posts', id);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
               const postData = docSnap.data();
               setPost({ id: docSnap.id, ...postData });
               setLikes(postData.likes || 0);
               
               const likeDoc = await getDoc(doc(db, `posts/${id}/likes`, auth.currentUser.uid));
               setHasLiked(likeDoc.exists());

               const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
               const querySnapshot = await getDocs(postsQuery);
               const posts = querySnapshot.docs;
               const currentIndex = posts.findIndex(doc => doc.id === id);

               setPrevPost(currentIndex > 0 ? {
                   id: posts[currentIndex - 1].id,
                   title: posts[currentIndex - 1].data().title
               } : null);

               setNextPost(currentIndex < posts.length - 1 ? {
                   id: posts[currentIndex + 1].id,
                   title: posts[currentIndex + 1].data().title
               } : null);
           } else {
               navigate('/');
           }
       };
       getPost();

       const q = query(collection(db, `posts/${id}/comments`), orderBy('createdAt', 'desc'));
       const unsubscribe = onSnapshot(q, (snapshot) => {
           setComments(snapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
           })));
       });

       return () => unsubscribe();
   }, [id, navigate]);

   const summarizeContent = async () => {
       try {
           const completion = await openai.chat.completions.create({
               messages: [{ 
                   role: "user", 
                   content: `다음 내용을 한 줄로 요약해주세요: ${post.content}` 
               }],
               model: "gpt-3.5-turbo",
           });
           setSummary(completion.choices[0].message.content);
       } catch (error) {
           console.error('GPT API Error:', error);
           alert('요약을 생성하는 중 오류가 발생했습니다.');
       }
   };

   const handleAddComment = async (e) => {
       e.preventDefault();
       if (!newComment.trim()) return;

       try {
           await addDoc(collection(db, `posts/${id}/comments`), {
               text: newComment,
               createdAt: new Date(),
               author: auth.currentUser.email
           });
           setNewComment('');
       } catch (error) {
           alert('댓글 작성 중 오류가 발생했습니다.');
       }
   };

   const handleUpdateComment = async (commentId) => {
       if (!editCommentText.trim()) return;
       try {
           await updateDoc(doc(db, `posts/${id}/comments`, commentId), {
               text: editCommentText,
               updatedAt: new Date()
           });
           setEditingComment(null);
       } catch (error) {
           alert('댓글 수정 중 오류가 발생했습니다.');
       }
   };

   const handleDeleteComment = async (commentId) => {
       if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
       try {
           await deleteDoc(doc(db, `posts/${id}/comments`, commentId));
       } catch (error) {
           alert('댓글 삭제 중 오류가 발생했습니다.');
       }
   };

   const handleLike = async () => {
       const likeRef = doc(db, `posts/${id}/likes`, auth.currentUser.uid);
       const postRef = doc(db, 'posts', id);
       
       try {
           if (hasLiked) {
               await deleteDoc(likeRef);
               await updateDoc(postRef, { likes: likes - 1 });
               setLikes(prev => prev - 1);
               setHasLiked(false);
           } else {
               await setDoc(likeRef, { userId: auth.currentUser.uid });
               await updateDoc(postRef, { likes: likes + 1 });
               setLikes(prev => prev + 1);
               setHasLiked(true);
           }
       } catch (error) {
           alert('좋아요 처리 중 오류가 발생했습니다.');
       }
   };

   if (!post) return <div className="loading">로딩중...</div>;

   return (
       <div className="post-detail-container">
           <div className="post-header">
               <span className="post-category">{post.category}</span>
               <h1 className="post-title">{post.title}</h1>
               <div className="post-meta">
                   <span className="post-author">작성자: {post.author}</span>
                   <span className="post-date">
                       작성일: {post.createdAt.toDate().toLocaleDateString()}
                   </span>
                   <button 
                       onClick={handleLike}
                       className={`like-button ${hasLiked ? 'liked' : ''}`}
                   >
                       {hasLiked ? '좋아요 취소' : '좋아요'} ({likes})
                   </button>
               </div>
           </div>

           <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

           {post.imageUrl && (
               <img 
                   src={post.imageUrl} 
                   alt="게시글 이미지"
                   className="post-image"
               />
           )}

           {!summary ? (
               <button
                   onClick={summarizeContent}
                   className="button button-secondary"
               >
                   AI 요약 생성
               </button>
           ) : (
               <div className="ai-summary">
                   <strong>AI 요약:</strong> {summary}
               </div>
           )}

           <div className="post-navigation">
               {prevPost && (
                   <Link to={`/post/${prevPost.id}`} className="nav-link prev">
                       ← 이전글: {prevPost.title}
                   </Link>
               )}
               {nextPost && (
                   <Link to={`/post/${nextPost.id}`} className="nav-link next">
                       다음글: {nextPost.title} →
                   </Link>
               )}
           </div>

           <div className="comments-section">
               <h3>댓글</h3>
               <form onSubmit={handleAddComment} className="comment-form">
                   <textarea
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       placeholder="댓글을 입력하세요"
                       className="comment-input"
                   />
                   <button type="submit" className="button button-primary">
                       댓글 작성
                   </button>
               </form>

               <div className="comments-list">
                   {comments.map(comment => (
                       <div key={comment.id} className="comment-card">
                           {editingComment === comment.id ? (
                               <div className="comment-edit">
                                   <textarea
                                       value={editCommentText}
                                       onChange={(e) => setEditCommentText(e.target.value)}
                                       className="comment-input"
                                   />
                                   <div className="button-group">
                                       <button 
                                           onClick={() => handleUpdateComment(comment.id)}
                                           className="button button-primary"
                                       >
                                           저장
                                       </button>
                                       <button 
                                           onClick={() => setEditingComment(null)}
                                           className="button button-secondary"
                                       >
                                           취소
                                       </button>
                                   </div>
                               </div>
                           ) : (
                               <>
                                   <div className="comment-header">
                                       <span className="comment-author">{comment.author}</span>
                                       <span className="comment-date">
                                           {comment.createdAt.toDate().toLocaleDateString()}
                                       </span>
                                   </div>
                                   <p className="comment-text">{comment.text}</p>
                                   {auth.currentUser?.email === comment.author && (
                                       <div className="comment-actions">
                                           <button
                                               onClick={() => {
                                                   setEditingComment(comment.id);
                                                   setEditCommentText(comment.text);
                                               }}
                                               className="button button-primary"
                                           >
                                               수정
                                           </button>
                                           <button
                                               onClick={() => handleDeleteComment(comment.id)}
                                               className="button button-danger"
                                           >
                                               삭제
                                           </button>
                                       </div>
                                   )}
                               </>
                           )}
                       </div>
                   ))}
               </div>
           </div>
       </div>
   );
}

export default PostDetail;