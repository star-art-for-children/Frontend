# 스타아트 (Star Art) 유저 플로우

> 아이들의 미술 작품을 3D 가상 갤러리에서 전시하는 플랫폼  
> 역할: **선생님(teacher)** / **일반 관람객(general)** 두 가지

---

## 1. 전체 구조 개요

```
앱 진입
├── 비로그인 사용자
│   ├── 홈(전시회 목록) 열람 → 검색·필터
│   ├── 전시회 상세 열람 (작품 목록, 소개)
│   └── 로그인 유도 (좋아요·리뷰·갤러리 입장 시)
│
└── 로그인 사용자
    ├── [일반] 관람 / 좋아요 / 리뷰 / 3D 갤러리 / 스탬프 / 업적
    └── [선생님] 위 + 전시회 생성·관리 / AI 기능(크레딧 소모)
```

---

## 2. 인증 플로우

### 2-1. 회원가입

```
/signup
├── 역할 선택: 일반 | 선생님
├── 가입 방식 선택
│   ├── OAuth (Google 등)
│   │   └── 소셜 로그인 → /api/auth/callback → 온보딩 분기
│   └── 이메일 가입
│       ├── 이름 입력
│       ├── 이메일 입력 → OTP 발송(/api/auth/send-otp)
│       ├── OTP 인증
│       ├── 비밀번호 설정
│       └── [선생님] 학원명·가입 목적 추가 입력
│           └── /api/auth/signup → 계정 생성
└── 온보딩으로 이동
```

### 2-2. 온보딩

```
/onboarding  (신규 계정 첫 로그인 시 필수)
├── 역할 확인 / 이름 확인
│   └── (소셜 로그인 시 provider 메타에서 이름 자동 추출)
├── /api/auth/onboarding → profiles 테이블에 onboarded=true 기록
└── / (홈) 으로 리다이렉트
```

> 온보딩 미완료 상태 = 비로그인 취급  
> 이미 온보딩 완료 사용자가 /login·/signup 접근 → 홈으로 리다이렉트

### 2-3. 로그인

```
/login
├── 이메일 + 비밀번호 입력
├── OAuth 버튼 → 소셜 로그인
└── 성공 → 홈 / 온보딩 미완료 시 /onboarding
```

---

## 3. 홈 / 전시회 탐색 플로우

```
/ (홈)
├── 히어로 섹션 (검색 폼)
├── 전시회 목록 (기본: 최신순)
│   ├── 정렬 필터
│   │   ├── latest  : 최신순
│   │   ├── popular : 인기순
│   │   ├── oldest  : 오래된순
│   │   ├── upcoming: 예정
│   │   ├── ended   : 종료
│   │   └── mine    : 내 전시 (선생님 전용)
│   ├── 키워드 검색
│   └── 페이지네이션
│
├── 전시회 카드
│   ├── 썸네일 / 제목 / 주최자(학원명)
│   ├── 좋아요 버튼 (로그인 필요)
│   └── 클릭 → /exhibitions/[id]
│
└── 헤더 네비게이션
    ├── 비로그인: 로그인 / 회원가입 링크
    └── 로그인: 마이페이지 / 로그아웃 / (선생님: 전시 만들기)
```

---

## 4. 전시회 상세 플로우

```
/exhibitions/[id]
│
├── [상태: 예정(upcoming)]
│   ├── 시작일 안내 배너
│   └── [선생님·주최자] "관리하기" 버튼 → /exhibitions/[id]/manage
│
├── [상태: 종료(ended)]
│   └── 종료 안내 메시지만 표시
│
└── [상태: 진행중(ongoing)]
    ├── 배너 이미지 + 제목 + 주최자
    ├── ExhibitionActionBar
    │   ├── 날짜 정보
    │   ├── 좋아요 버튼 (비로그인 → 로그인 유도)
    │   ├── 공유 다이얼로그
    │   └── [주최자] "전시 관리" 버튼
    ├── 전시회 소개 텍스트
    ├── 작품 그리드 (WorkDialog)
    │   ├── 작품 썸네일 클릭 → 상세 다이얼로그
    │   │   ├── 이미지 / 제목 / 작가 / 설명
    │   │   ├── 좋아요 버튼 (낙관적 업데이트)
    │   │   ├── 이모지 리액션 (👍❤️😮😂😢)
    │   │   ├── [영상 있음] 영상 재생
    │   │   └── [주최자] AI 영상화 버튼 (1,000 크레딧 소모)
    │   └── 이미지 다운로드
    ├── 3D 갤러리 입장 배너 → /gallery/[id]
    └── 관람 후기(ReviewSection)
        ├── 후기 목록 + 페이지네이션
        ├── [로그인] 후기 작성
        ├── [본인 후기] 수정 / 삭제
        └── [비로그인] 로그인 유도 표시
```

---

## 5. 3D 가상 갤러리 플로우

```
/gallery/[id]
│
├── GalleryEntryModal (입장 전)
│   ├── 전시회 제목 / 주최자 표시
│   ├── 캐릭터 선택 (human | bunny | cartoon)
│   ├── 씬 로딩 대기 (isInitReady + isSceneReady)
│   └── [입장] / [뒤로가기]
│
├── 갤러리 내부 (Three.js Scene)
│   ├── 3D 공간 조작 (키보드 이동, 마우스 시점)
│   ├── 1인칭 ↔ 3인칭 시점 전환
│   ├── 벽에 걸린 Painting 클릭 → 작품 상세 모달
│   │   ├── 좋아요 / 리액션 가능 (로그인 시)
│   │   └── 스탬프 획득 (로그인 시) → 도장 쾅 애니메이션
│   ├── 멀티플레이 (WebSocket)
│   │   ├── 다른 유저 캐릭터 실시간 표시
│   │   └── 채팅 (메시지 전송/수신)
│   └── 갤러리 테마
│       ├── 벽 텍스처 / 바닥 패턴
│       ├── 장식 오브젝트 (나무, 꽃, 동물 등)
│       └── 파티클 효과 (눈, 낙엽, 꽃잎, 비, 버블)
│
├── GalleryHUD (항상 오버레이)
│   ├── 전시회 제목 / 뒤로가기
│   ├── 참여자 목록
│   ├── 채팅 UI
│   ├── 스탬프 진행도 표시 (n/전체)
│   ├── 스탬프북 열기 버튼 (또는 Tab 키)
│   └── 음악 볼륨 조절
│
├── StampBook (Tab 키 또는 버튼)
│   ├── 수집한 작품 도장 목록
│   └── 업적 현황 + 칭호 선택
│
└── 스탬프 완주 모달
    ├── 모든 작품 스탬프 수집 시 자동 표시
    └── "계속 둘러보기" → 모달 닫기
```

---

## 6. 선생님 전용 플로우

### 6-1. 전시회 생성

```
/exhibitions/create  (선생님만 접근)
│
├── CreateGalleryPage
│   ├── 전시회 기본 정보 입력
│   │   ├── 제목
│   │   ├── 설명
│   │   ├── 시작일 / 종료일
│   │   └── 썸네일 이미지 업로드
│   ├── 갤러리 테마 선택 (ThemeSelector)
│   │   ├── 프리셋 테마 목록
│   │   └── AI 테마 생성 (500 크레딧 소모) → /api/generate-preset
│   └── 생성 완료 → /exhibitions/[id]
│
└── 크레딧 부족 시 → /charge 안내
```

### 6-2. 전시회 관리

```
/exhibitions/[id]/manage  (주최 선생님만 접근)
│
├── 전시회 정보 헤더 (제목, 학원명, 작품 수)
├── 전시 종료 버튼 (EndExhibitionDialog)
├── 작품 관리
│   ├── 작품 추가 (AddWorkDialog)
│   │   ├── 제목 / 작가명 / 설명
│   │   └── 이미지 업로드 (Supabase Storage)
│   ├── 일괄 업로드 (BulkWorkDialog)
│   │   └── 복수 작품 한 번에 등록
│   ├── 작품 수정 (EditWorkDialog)
│   └── 작품 삭제 (DeleteArtworkDialog)
│
└── 작품 그리드 표시 (이미지, 제목, 작가명, 학생 이메일)
```

---

## 7. 마이페이지 플로우

```
/my-page  (로그인 필수)
│
├── ProfileCard
│   ├── 이름 / 이메일 / 역할
│   ├── 현재 칭호 표시
│   └── 프로필 수정 다이얼로그
│
├── CreditCard
│   ├── 현재 크레딧 잔액
│   └── "충전하기" → /charge
│
├── AchievementSection
│   ├── 업적 뱃지 목록
│   │   ├── 첫 발자국 (스탬프 1개)
│   │   ├── 그림 탐험가 (전시회 1곳 완주)
│   │   ├── 갤러리 모험가 (전시회 3곳 완주)
│   │   └── 전시관 마스터 (전시회 5곳 완주)
│   └── 달성 업적 → 칭호로 선택 가능
│
├── QuickLinks
│   ├── 내 작품 → /artworks
│   └── 찜 목록 → /wish-list
│
├── [선생님] ExhibitionList (내 전시회 목록)
│   ├── 전시회 상태 (진행중 / 예정 / 종료)
│   └── 클릭 → /exhibitions/[id]
│
├── [선생님] NewExhibitionBanner → /exhibitions/create
│
└── LogoutButton
```

---

## 8. 내 작품 / 찜 목록 플로우

```
/artworks  (로그인 필수)
├── 필터 탭 (전체 / 좋아요한 작품 등)
├── 내가 등록된 작품 카드 목록
│   └── 클릭 → ArtworkModal
│       ├── 이미지 / 제목 / 작가 / 전시회명 / 학원명
│       ├── 좋아요 / 이모지 리액션
│       └── 이미지 다운로드

/wish-list  (로그인 필수)
├── 내가 좋아요한 작품 카드 목록
└── 클릭 → ArtworkModal (동일)
```

---

## 9. 크레딧 결제 플로우

```
/charge  (로그인 필수)
├── 현재 잔액 표시
├── 충전 금액 선택 (AmountSelector)
├── TossPayments 위젯 (ChargeWidget)
│   └── 결제 진행 → /api/payments/checkout → /api/payments/confirm
├── 결제 성공 → /charge/success
│   └── 크레딧 적립 완료 메시지
└── 결제 실패 → /charge/fail
    └── 오류 메시지 + 재시도 유도
```

**크레딧 소모 기능:**
| 기능 | 비용 |
|------|------|
| AI 영상화 (작품 이미지 → 영상) | 1,000 크레딧 |
| AI 테마 생성 (갤러리 테마 자동 생성) | 500 크레딧 |

---

## 10. 접근 제어 요약

| 경로                       | 비로그인              | 일반(general)  | 선생님(teacher)  |
| -------------------------- | --------------------- | -------------- | ---------------- |
| `/`                        | ✅ 열람               | ✅             | ✅               |
| `/exhibitions/[id]`        | ✅ 열람만             | ✅ 좋아요·리뷰 | ✅ + 관리        |
| `/gallery/[id]`            | ✅ 입장 (스탬프 불가) | ✅ 스탬프 가능 | ✅               |
| `/exhibitions/create`      | ❌ → login            | ❌ → 404       | ✅               |
| `/exhibitions/[id]/manage` | ❌ → login            | ❌ → 404       | ✅ (본인 전시만) |
| `/my-page`                 | ❌ → login            | ✅             | ✅               |
| `/artworks`                | ❌ → login            | ✅             | ✅               |
| `/wish-list`               | ❌ → login            | ✅             | ✅               |
| `/charge`                  | ❌ → login            | ✅             | ✅               |

---

## 11. 주요 API 엔드포인트

```
인증
  POST /api/auth/send-otp          이메일 OTP 발송
  POST /api/auth/signup            이메일 회원가입
  POST /api/auth/onboarding        온보딩 완료 처리
  GET  /api/auth/callback          OAuth 콜백

전시회
  GET  /api/exhibitions            전시회 목록
  GET  /api/exhibitions/[id]       전시회 상세
  POST /api/exhibitions/[id]/likes 전시회 좋아요

작품
  GET  /api/exhibitions/[id]/artworks                   작품 목록
  POST /api/exhibitions/[id]/artworks/[id]/likes        작품 좋아요
  POST /api/exhibitions/[id]/artworks/[id]/reactions    이모지 리액션
  POST /api/exhibitions/[id]/artworks/[id]/stamp        스탬프 수집
  POST /api/exhibitions/[id]/artworks/[id]/animate      AI 영상화 (크레딧 소모)

리뷰
  GET  /api/exhibitions/[id]/reviews                    후기 목록
  POST /api/exhibitions/[id]/reviews                    후기 작성
  PUT  /api/exhibitions/[id]/reviews/[id]               후기 수정
  DELETE /api/exhibitions/[id]/reviews/[id]             후기 삭제

AI
  POST /api/generate-preset        AI 갤러리 테마 생성 (크레딧 소모)

결제
  POST /api/payments/checkout      결제 요청
  POST /api/payments/confirm       결제 확인 및 크레딧 적립

프로필
  GET/PATCH /api/profile           프로필 조회·수정
  PATCH /api/profile/title         칭호 변경

업적
  GET /api/achievements            업적 현황 조회

아카이브
  GET /api/archive                 작품 아카이브
```

---

## 12. 전시관 관람 핵심 상태 흐름

```
GalleryEntryModal 진입
    ↓ 캐릭터 선택 + 씬 로딩 완료 (isAllReady)
    ↓ [입장 클릭] started = true
3D Scene 활성화
    ↓ 작품(Painting) 클릭
    ↓ 상세 모달 열림
        ↓ [스탬프 버튼] → POST /api/.../stamp
        ↓ onStampProgress 콜백 → stampArtworks 업데이트
        ↓ 도장 쾅 애니메이션 + 효과음
        ↓ [모든 스탬프 수집] → 1초 후 완주 모달 표시
완주 모달
    ↓ [계속 둘러보기] 클릭
    ↓ StampBook(Tab)에서 업적·칭호 확인
```
