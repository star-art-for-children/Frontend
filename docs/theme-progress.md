# 전시관 테마 다양화 작업 진행사항

## 목표
전시관 3D 씬에 테마(벚꽃/바다/숲/기본)를 적용. 전시 생성 시 테마 선택 → DB 저장 → 갤러리 입장 시 테마 적용.

---

## 완료된 작업

### 1. DB Migration
**파일:** `supabase/migration/0005_exhibitions_theme.sql`
```sql
ALTER TABLE exhibitions
ADD COLUMN theme text NOT NULL DEFAULT 'default'
CHECK (theme IN ('default', 'cherry', 'ocean', 'forest'));
```
- Supabase 대시보드 SQL Editor에서 실행 완료

---

### 2. themes.config.ts (신규)
**파일:** `src/lib/gallery/themes.config.ts`

- `GalleryTheme` 타입: `'default' | 'cherry' | 'ocean' | 'forest'`
- `ThemeConfig` 타입: fog, ambientLight, background, wallColor, innerWallColor, ceilingColor, lightColor, floorColor
- `THEMES` 객체: 4개 테마 색상값 정의
- `getThemeConfig(theme)` 헬퍼 함수

**현재 테마값:**
| 테마 | background | wallColor | 특이사항 |
|---|---|---|---|
| default | #ffffff | #E6E0D6 | fog 없음 |
| cherry | #ffecf0 | #fff0f3 | 분홍 fog |
| ocean | #87cefa | #7ec8e3 | 하늘색 fog |
| forest | #1a3a1a | #2d5a27 | 짙은 녹색 fog |

---

### 3. 타입/폼/검증 수정
- `src/types/gallery.ts` — `UIFormProps`, `FormValidation`에 `theme` 필드 추가
- `src/lib/gallery/parseForm.ts` — `theme` 파싱
- `src/lib/gallery/validateExhibitionForm.ts` — theme 유효성 검사 (잘못된 값 → 'default' fallback)

---

### 4. API 수정
- `src/app/api/exhibitions/route.ts` (POST) — `theme` insert
- `src/app/api/exhibitions/[exhibitionId]/route.ts` (GET) — `theme` select + 반환

---

### 5. Service / Hook 수정
- `src/lib/exhibition/service.ts` — `getExhibitionDetails` → `theme` 반환
- `src/lib/gallery/hooks.ts` — `ExhibitionDetails` 타입 + state에 `theme: GalleryTheme` 추가

---

### 6. 3D 씬 컴포넌트 수정 (theme prop 전달)

#### Scene.tsx
- `theme` prop 추가
- `<color attach="background">` — 테마 배경색
- `<fog>` — 테마별 안개 (default는 fog 없음)
- `<ambientLight>` — 테마별 색상/강도

#### Room.tsx
- `theme` prop 추가
- `getThemeConfig(theme)` 호출
- Floor, Walls, InnerWalls, Ceiling에 테마 색상 전달
- `theme === 'ocean'` → `<OceanDecor size={size} />` 렌더

#### Floor.tsx
- `color` prop 추가 (MeshReflectorMaterial color)

#### Ceiling.tsx
- `color`, `lightColor` prop 추가

#### Walls.tsx
- `color?: string` prop 추가 (override wall.color)

#### InnerWall.tsx
- `wallColor?: string` prop 추가

#### gallery/[id]/page.tsx
- `exhibitionDetails.theme` → `Scene2`로 전달

---

### 7. 전시 생성 폼 테마 선택 UI
**파일:** `src/components/exhibition-create/CreateGalleryPage.tsx`

- `THEME_OPTIONS` 배열: default/cherry/ocean/forest
- Controller로 테마 선택 카드 UI (4개 카드, 이모지+이름)
- 선택된 테마는 border + glow 강조
- form submit 시 `theme` → FormData에 포함

---

### 8. Ocean 테마 장식 (신규)
**파일:** `src/components/exhibition-gallery/threejs/ocean/OceanDecor.tsx`

- **Fish** (10마리): 각자 다른 색상/크기/속도/높이로 원형 공전 + 위아래 흔들림
  - sphere body + snout + tail(box) + dorsal fin + eye
  - 색상: 주황, 분홍, 노랑, 하늘, 빨강, 보라, 초록 등
- **SeaweedCluster**: 벽면 따라 배치, sway 애니메이션 (rotation.z sin 파동)
- **Coral**: 바닥 가장자리, 분홍/주황/빨강, 가지 달린 산호 형태
- **Bubble** (20개): 반투명 구, 천장 방향 상승 + drift 애니메이션

---

## 남은 작업

### 즉시 할 것
- [ ] **Cherry (벚꽃) 테마 장식** — 꽃잎 파티클, 나뭇가지, 분홍 분위기
- [ ] **Forest (숲) 테마 장식** — 나무, 반딧불, 이끼

### 추후 개선
- [ ] Three.js Points로 파티클 시스템 전환 (성능 개선)
- [ ] GLTF 물고기 모델로 교체
- [ ] 전시 상세 페이지에 테마 뱃지 표시

---

## 파일 구조
```
src/
├── lib/gallery/
│   ├── themes.config.ts        ← NEW: 테마 설정값
│   ├── parseForm.ts            ← theme 파싱 추가
│   └── validateExhibitionForm.ts ← theme 검증 추가
├── types/gallery.ts            ← UIFormProps, FormValidation에 theme 추가
├── components/
│   ├── exhibition-create/
│   │   └── CreateGalleryPage.tsx ← 테마 선택 UI 추가
│   └── exhibition-gallery/threejs/
│       ├── Scene.tsx           ← fog, background, ambientLight 테마 적용
│       ├── Room.tsx            ← theme prop 전달, OceanDecor 렌더
│       ├── Floor.tsx           ← color prop
│       ├── Ceiling.tsx         ← color, lightColor prop
│       ├── Walls.tsx           ← color prop
│       ├── InnerWall.tsx       ← wallColor prop
│       └── ocean/
│           └── OceanDecor.tsx  ← NEW: 물고기, 해초, 산호, 거품
├── app/api/exhibitions/
│   ├── route.ts                ← POST theme insert
│   └── [exhibitionId]/route.ts ← GET theme select
└── lib/exhibition/service.ts   ← getExhibitionDetails theme 반환
supabase/migration/
└── 0005_exhibitions_theme.sql  ← NEW: theme 컬럼
```
