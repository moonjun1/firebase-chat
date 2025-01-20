![image](https://github.com/user-attachments/assets/e99b7c02-c754-4b4c-8e83-77900db90e1e)
# 프로젝트명: Personal Blog & Community Platform

## 📝 프로젝트 소개
이 프로젝트는 React와 Firebase를 활용한 개인 블로그 겸 커뮤니티 플랫폼입니다. 사용자들은 게시글을 작성하고, 실시간으로 소통하며, AI 기반의 콘텐츠 요약 기능을 활용할 수 있습니다.

## ✨ 주요 기능
- **사용자 인증**
  - 이메일/비밀번호 기반 회원가입 및 로그인
  - 사용자 프로필 관리

- **게시판 시스템**
  - 게시글 CRUD 기능
  - 카테고리 기반 필터링
  - 이미지 업로드
  - 게시글 좋아요/댓글
  - OpenAI를 활용한 게시글 요약
  - 리치 텍스트 에디터 지원

- **실시간 채팅**
  - Firebase 실시간 데이터베이스 기반 채팅
  - 자동 스크롤 기능
  - 사용자별 메시지 스타일링

- **테마 시스템**
  - 다크모드/라이트모드 지원
  - 사용자 설정 저장

## 🛠 기술 스택
### Frontend
- React
- React Router
- React Quill (리치 텍스트 에디터)
- Context API (테마 관리)

### Backend/Infrastructure
- Firebase
  - Authentication (인증)
  - Firestore (데이터베이스)
  - Storage (파일 저장소)

### External APIs
- OpenAI API (콘텐츠 요약)


## 📋 요구사항
- Node.js 14.0.0 이상
- npm 6.0.0 이상
- Firebase 프로젝트
- OpenAI API 키

## 📁 프로젝트 구조
```
src/
├── components/
│   ├── Auth/
│   │   └── Login.js
│   ├── Board/
│   │   └── Board.js
│   ├── Chat/
│   │   └── Chat.js
│   ├── Profile/
│   │   └── Profile.js
│   └── About/
│       └── About.js
├── firebase.js
├── App.js
└── index.js
```

## 🔒 보안
- 환경변수를 통한 API 키 관리
- Firebase 인증을 통한 보안 강화
- 사용자 권한 기반 접근 제어


![image](https://github.com/user-attachments/assets/a2db5048-31ec-4625-87a7-4aa73242a4b1)


![image](https://github.com/user-attachments/assets/75bad584-bff3-4399-b3d6-33a8e5dd797b)

![image](https://github.com/user-attachments/assets/210eb495-a5d9-46c5-aefb-aa76e106af3a)
