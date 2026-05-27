# 📁 파일 구조 & 네이밍 컨벤션

> **스택:** Next.js 16.2 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Supabase · Three.js(R3F) · Zustand · React Hook Form · Zod

---

## 1. 디렉토리 구조

```text
src/
├── app/                              # 라우트 (App Router)
│   ├── (auth)/                       # 비로그인 전용: login, signup
│   ├── (mypage)/                     # 인증 필수: my-page, wish-list, artworks
│   ├── (exhibitions)/                # 전시 공개 페이지
│   │   ├── exhibitions/[id]/{page,manage}.tsx
│   │   ├── exhibitions/create/
│   │   └── gallery/[id]/             # 3D 뷰어
│   ├── api/                          # Route Handlers (외부 호출용)
│   ├── page.tsx                      # 홈
│   ├── layout.tsx                    # Root layout
│   └── not-found.tsx
│
├── components/                       # 재사용 UI
│   ├── ui/                           # shadcn/ui
│   ├── layout/                       # Header, Footer, NavItems, UserMenu, MobileMenu
│   ├── home/                         # 홈 화면
│   ├── auth/                         # LoginFormField, SignupFormField
│   ├── exhibition/                   # 전시 2D UI (+ manage/)
│   ├── exhibition-create/            # 전시 생성 폼
│   ├── exhibition-gallery/threejs/   # 3D 뷰어 컴포넌트
│   ├── my-page/                      # 마이페이지 화면
│   ├── my-artworks/                  # 내 작품 화면
│   └── my-wishlist/                  # 위시리스트 화면
│
├── hooks/                            # 공유 React Hook
│
├── lib/                              # 도메인 로직 + 외부 클라이언트 + 유틸
│   ├── supabase/                     # Supabase 클라이언트
│   ├── schemas/                      # zod 스키마
│   ├── exhibition/                   # 전시 도메인 (server, service, constants, dateStatus)
│   ├── review/                       # 리뷰 도메인 (server, service, constants)
│   ├── artwork/                      # 작품 도메인 (service)
│   ├── auth/                         # getAuthContext
│   ├── gallery/                      # 3D + 폼 헬퍼
│   ├── utils.ts
│   ├── rate-limit.ts
│   └── upstash.ts
│
└── types/                            # 전역 도메인 타입 (exhibition, artwork, gallery, profile)
```

---

## 2. 폴더별 역할

| 폴더                   | 역할                                                   |
| ---------------------- | ------------------------------------------------------ |
| `app/`                 | 라우트, 페이지, 레이아웃, Route Handler, Server Action |
| `app/api/`             | 외부에서 호출되는 REST 엔드포인트                      |
| `components/ui/`       | shadcn/ui 기본 컴포넌트                                |
| `components/<도메인>/` | 도메인별 재사용 UI                                     |
| `lib/supabase/`        | Supabase 클라이언트 setup                              |
| `lib/schemas/`         | 도메인 zod 스키마                                      |
| `lib/<도메인>/`        | **한 도메인의 모든 데이터/로직 응집**                  |
| `lib/` (루트)          | 순수 유틸 + 외부 클라이언트 설정                       |
| `hooks/`               | 여러 도메인에서 공유되는 React Hook                    |
| `types/`               | 여러 곳에서 공유되는 전역 타입                         |

---

## 3. `lib/<domain>/` 패턴

한 도메인의 모든 데이터 코드를 한 폴더에 응집.

```text
lib/<domain>/
├── server.ts          # 🔒 서버 DAL (Supabase 직접) — `import 'server-only'` 필수
├── service.ts          # 📡 클라이언트 fetch wrapper — /api/* 호출
├── constants.ts        # 도메인 상수
├── types.ts            # 도메인 내부 전용 타입
└── (헬퍼).ts           # 순수 함수
```

| 파일                             | 책임                              | 실행 위치  | `import 'server-only'` |
| -------------------------------- | --------------------------------- | ---------- | ---------------------- |
| `server.ts`                      | Supabase 직접 호출 (read + write) | 서버 전용  | ✅ 필수                |
| `service.ts`                     | `fetch('/api/...')` 래퍼          | 클라이언트 | ❌                     |
| `constants.ts`, `types.ts`, 헬퍼 | 데이터/상수/순수함수              | 양쪽       | ❌                     |

---

## 4. 네이밍 컨벤션

### 폴더

| 위치                                         | 규칙           | 예시                             |
| -------------------------------------------- | -------------- | -------------------------------- |
| `app/`, `components/`, `lib/`, `hooks/` 하위 | **kebab-case** | `my-page/`, `exhibition-create/` |
| Route Group                                  | `(kebab-case)` | `(auth)`, `(mypage)`             |
| Private Folder                               | `_kebab-case`  | `_components/`, `_lib/`          |
| Dynamic Segment                              | `[camelCase]`  | `[exhibitionId]`                 |

### 파일

| 종류               | 규칙                            | 예시                                             |
| ------------------ | ------------------------------- | ------------------------------------------------ |
| React Component    | `PascalCase.tsx`                | `ExhibitionCard.tsx`                             |
| Hook               | `useCamelCase.ts`               | `useLogout.ts`                                   |
| 유틸 / 로직        | `camelCase.ts`                  | `getAuthContext.ts`                              |
| Next.js 예약       | 소문자 그대로                   | `page.tsx`, `layout.tsx`, `route.ts`, `proxy.ts` |
| Server Actions     | `actions.ts` (route colocation) | `app/<route>/actions.ts`                         |
| 서버 DAL           | `server.ts`                     | `lib/exhibition/server.ts`                       |
| 클라이언트 fetch   | `service.ts`                    | `lib/exhibition/service.ts`                      |
| zod 스키마         | `camelCase.ts` (도메인명)       | `lib/schemas/auth.ts`                            |
| 도메인 타입 (전역) | `camelCase.ts` (단수형)         | `types/exhibition.ts`                            |
| 도메인 내부 타입   | `types.ts`                      | `lib/exhibition/types.ts`                        |

---

## 5. Route Group 인증 정책

| Route Group         | 접근 권한       | Layout                                     |
| ------------------- | --------------- | ------------------------------------------ |
| `(auth)`            | 비로그인 전용   | 이미 로그인 시 `/`로 redirect              |
| `(mypage)`          | **로그인 필수** | Auth Guard (비로그인 시 `/login` redirect) |
| `(exhibitions)`     | 누구나 공개     | 전시 전용 레이아웃                         |
| root `app/page.tsx` | 누구나 공개     | root layout                                |

---

## 6. 도메인 용어

| 개념                    | 통일 용어                      |
| ----------------------- | ------------------------------ |
| 전시 (도메인)           | **exhibition**                 |
| 전시 생성 폼            | **exhibition-create**          |
| 전시 3D 뷰어 (Three.js) | **exhibition-gallery**         |
| 3D 헬퍼 (벽 생성 등)    | **gallery** (도메인 중립 헬퍼) |
| 리뷰                    | **review** (별도 도메인)       |
| 작품                    | **artwork**                    |

---

## 7. types/ 위치 규칙

| 타입 종류                     | 위치                                        |
| ----------------------------- | ------------------------------------------- |
| 여러 도메인/컴포넌트에서 공유 | `src/types/<domain>.ts` (단수형, camelCase) |
| 한 도메인 내부에서만 사용     | `src/lib/<domain>/types.ts`                 |
| 한 컴포넌트 폴더에서만 사용   | 같은 폴더의 `types.ts`                      |
| 컴포넌트 Props                | 컴포넌트 파일 내부 인라인                   |
| Supabase 자동생성             | `src/types/database.ts`                     |

---

## 📚 참고 자료

- [Next.js Project Structure (공식)](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Data Security & DAL (공식)](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Route Groups (공식)](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [Next.js Server Actions (공식)](https://nextjs.org/docs/app/getting-started/updating-data)
- [Vercel Commerce (`lib/<domain>/` 패턴 레퍼런스)](https://github.com/vercel/commerce)
- [GitHub Discussion #184740 — Server Actions 위치](https://github.com/orgs/community/discussions/184740)
