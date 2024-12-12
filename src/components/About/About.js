import React, { useState, useEffect } from 'react';
import { storage } from '../../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import '../../styles/About.css';

function About() {
    const [imageUrl, setImageUrl] = useState('');

    const techStack = [
        {
            name: "JavaScript",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        },
        {
            name: "React",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
        },
        {
            name: "Spring Boot",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
        },
        {
            name: "PHP",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
        },
        {
            name: "MySQL",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
        },
        {
            name: "Firebase",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
        },
        {
            name: "Git",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
        }
    ];

    const socialLinks = {
        github: "https://github.com/moonjun1",
    };

    useEffect(() => {
        const getProfileImage = async () => {
            try {
                const imageRef = ref(storage, '/profiles/GXt3acODOKVtiRRnlKQbZESL4X82');
                const url = await getDownloadURL(imageRef);
                setImageUrl(url);
            } catch (error) {
                console.log('Error loading profile image:', error);
            }
        };
        
        getProfileImage();
    }, []);

    return (
        <div className="container">
            <div className="about-container">
                <div className="profile-header">
                    <div className="profile-image-container">
                        {imageUrl ? (
                            <img 
                                src={imageUrl} 
                                alt="프로필 이미지" 
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-image-placeholder">
                                <span className="placeholder-text">이미지 로딩중...</span>
                            </div>
                        )}
                    </div>
                    
                    <h2 className="about-title animate-title">About Me</h2>
                    <div className="social-links">
                        <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-github"></i> GitHub
                        </a>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="profile-text">
                        <h3 className="coding-name">안녕하세요! 문준원입니다 이 사이트는 공부 목적입니다👋</h3>
                        <p className="typing-text">
                            협업과 기술적 성장을 통해 더 나은 개발자가 되고자 노력하는 주니어 개발자입니다.
                        </p>
                        
                        <div className="experience-section">
                            <h4 className="section-title">주요 프로젝트 경험</h4>
                            <div className="experience-grid">
                                <div className="experience-item">
                                    <h5 className="experience-title">웹 프로그래밍 기말 프로젝트</h5>
                                    <p className="experience-description">
                                        PHP와 데이터베이스를 활용한 웹 애플리케이션 개발을 통해 기초적인 웹 개발 경험을 쌓았습니다.
                                        GitHub를 활용한 협업 방식을 배우며 효율적인 코드 관리와 팀워크의 중요성을 깨달았습니다.
                                    </p>
                                </div>
                                <div className="experience-item">
                                    <h5 className="experience-title">교내 해커톤 참여</h5>
                                    <p className="experience-description">
                                        Spring Boot를 활용한 웹 애플리케이션 개발에 참여하여 새로운 기술 스택에 도전했습니다.
                                        제한된 시간 내에서의 팀 프로젝트 경험을 통해 효율적인 협업과 문제 해결 능력을 키웠습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="skills-section">
                            <h4 className="section-title">기술 스택</h4>
                            <div className="tech-grid">
                                {techStack.map((tech, index) => (
                                    <div key={index} className="tech-item">
                                        <img src={tech.icon} alt={tech.name} className="tech-icon" />
                                        <h5 className="tech-name">{tech.name}</h5>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="philosophy-section">
                            <h4 className="section-title">개발 철학</h4>
                            <ul className="philosophy-list">
                                <li>지속적인 학습과 성장을 추구합니다</li>
                                <li>효율적인 협업과 소통을 중요시합니다</li>
                                <li>문제 해결 과정에서의 배움을 가치있게 생각합니다</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;