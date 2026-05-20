# 🎨 Star-Art

> 어린이들의 미술 작품을 업로드하고, 3D 갤러리 형태로 전시·감상할 수 있는 웹 애플리케이션

KT Cloud Tech Up 기본 프로젝트 멸종위기프론트 팀 프론트엔드 깃허브입니다.

![Star-Art 배너](https://github.com/user-attachments/assets/76f6c90f-c562-451b-b6f2-75b7f0c38126)

<br />

## 🔗 배포 링크

[star-art.cloud](https://www.star-art.cloud/)

<br />

## 📖 프로젝트 소개

**Star Art for Children**은 어린이들이 직접 그린 미술 작품을 디지털 공간에 전시하고,
누구나 3D 갤러리를 거닐며 작품을 감상할 수 있는 어린이 미술 작품 갤러리 플랫폼입니다.

- 아이들의 작품을 단순 이미지가 아닌 **하나의 전시회**로 기획해 공유할 수 있습니다.
- 관람객은 **Three.js 기반 3D 전시 공간**을 직접 둘러보며 작품을 감상합니다.
- 마음에 드는 전시·작품에 **좋아요**을 남기고, **후기**로 소통할 수 있습니다.
- 선생님이 아이의 아이디를 등록하면 **내 작품 모아보기**로 한번에 볼 수 있습니다.

<br />

## 🛠️ 기술 스택

| 구분                 | 사용 기술                                       |
| -------------------- | ----------------------------------------------- |
| **Framework**        | Next.js 16 (App Router)                         |
| **Language**         | TypeScript                                      |
| **UI / Styling**     | Tailwind CSS, shadcn/ui                         |
| **3D Graphics**      | React Three Fiber, drei                         |
| **폼 / 유효성 검사** | React Hook Form, Zod                            |
| **Backend / Auth**   | Supabase (Auth, DB, Storage)                    |
| **Infra / 기타**     | Upstash Redis (Rate Limit), Resend (이메일 OTP) |

<br />

## ✨ 주요 기능

| 기능                   | 설명                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| **회원가입 / 로그인**  | 이메일 OTP 인증 기반 회원가입 및 로그인 (Supabase Auth + Resend) |
| **전시회 생성 / 관리** | 전시회 개설, 작품 업로드, 전시 정보 수정 및 관리                 |
| **3D 갤러리 감상**     | Three.js 기반 3D 전시 공간에서 작품을 직접 둘러보며 관람         |
| **작품 둘러보기**      | 전시회 및 작품 목록 탐색                                         |
| **좋아요 & 찜**        | 전시·작품 좋아요, 위시리스트 저장                                |
| **후기**               | 전시 관람 후기 작성                                              |
| **마이페이지**         | 프로필 관리, 내 작품 모아보기, 위시리스트                        |

<br />

## 📂 프로젝트 구조

```text
src/
├── app/                # App Router 페이지 & API 라우트
│   ├── (exhibitions)/  # 전시회 생성·관리·3D 갤러리
│   ├── api/            # Route Handlers (전시/작품/인증 등)
│   ├── login/          # 로그인
│   ├── signup/         # 회원가입
│   ├── myPage/         # 마이페이지
│   └── ...
├── components/         # 도메인별 UI 컴포넌트
│   ├── exhibition/     # 전시회
│   ├── galleryCreate/  # 갤러리(전시) 생성
│   ├── galleryExhibition/  # 3D 갤러리 전시 (Three.js)
│   ├── home/           # 메인 페이지
│   ├── layout/         # 전역 레이아웃 (Header, Footer)
│   ├── ui/             # 재사용 기본 UI (shadcn/ui)
│   └── ...
├── service/            # 데이터 페칭 로직
├── lib/                # 유틸 & 서드파티 설정 (Supabase, Upstash 등)
├── hooks/              # 커스텀 훅
└── types/              # 전역 타입 정의
```

<br />

## 🚀 시작하기

### 1. 레포지토리 클론

```bash
git clone https://github.com/star-art-for-children/Frontend.git
cd Frontend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 채워주세요.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 이메일 OTP 인증
OTP_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Upstash Redis (Rate Limit)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 기타 명령어

```bash
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
npm run lint    # ESLint 검사
```

<br />

## 📌 컨벤션

### 브랜치 컨벤션

> '접두사#이슈번호' 형식으로 브랜치 작성
>
> 예: feat#1, fix#6

- `feat`: 신규 기능 개발 및 업데이트
- `fix`: 일반적인 버그 수정
- `hotfix`: 운영 환경에서 발생한 긴급 장애 대응
- `refactor`: 기능 변화 없는 코드 구조 및 로직 개선
- `chore`: 빌드 설정, 의존성 관리, 패키지 설치 등
- `docs`: 프로젝트 문서(README, API 명세 등) 작성 및 수정

### 커밋 컨벤션

> '접두사: 커밋 메세지' 형식으로 커밋 메세지 작성
>
> 예: feat: 구글 로그인 연동, fix: 로그인 이후 빈 화면이 나오는 오류 수정

- `feat` : 새로운 기능 추가
- `fix` : 버그 해결
- `design` : UI/UX 디자인 요소 수정 및 CSS 마크업 변경
- `refactor` : 성능 개선 혹은 코드 구조 리팩토링 (결과는 동일)
- `style` : 코드 의미에 영향을 주지 않는 수정 (세미콜론 누락, 들여쓰기 등)
- `docs` : 문서 생성 및 수정 (README.md, 주석 등)
- `test` : 테스트 코드 추가 및 수정
- `chore` : 패키지 설치(npm/yarn), 빌드 설정 등 기타 잡무
