# 전시관 테마 작업 진행사항

## 완료된 작업 (2026-06-04)

### 인프라

- `bubbles` 파티클 타입 추가 (`gallery-theme.ts`)
- `Bubbles.tsx` 컴포넌트 생성 (위로 떠오르는 반투명 구체)
- `DynamicDecorations.tsx` bubbles 핸들러 추가
- `ALL_PRESETS`, `PRESET_LABELS` export (`presets.ts`)

### 테마 선택 UI

- `ThemeSelector.tsx` 컴포넌트 — 10개 테마 카드 그리드
- AI 자동 생성 카드 추가 (썸네일 없으면 비활성화)
- `CreateGalleryPage.tsx` 연동
- `route.ts` — 수동 선택 시 Claude API 스킵, 미선택 시 기본 테마

### 바닷속 테마 개선 (`underwater-adventure`)

- 분위기: 어두운 남색 → 밝은 하늘색 gradient
- FishA, FishB 크기 축소 (scaleMax 0.4~0.5)
- CoralC (노랑) 추가
- sparkles → bubbles 파티클 교체

### 봄 벚꽃 테마 개선 (`spring-blossom`)

- `CherryBlossomTree.tsx` GLB 에셋 추가 (Sketchfab CC-BY-4.0)
- `FlowerPetal.tsx` GLB 교체 → 실제 벚꽃잎 형태 (Sketchfab CC-BY-4.0)
- FlowerTreeA/B → CherryBlossomTree로 교체
- sunPosition 수정 (낮게 → 높게)
- FlowerA (흰 꽃) 추가, countPerCell 방식으로 변경

---

## 앞으로 해야할 작업

### 바닷속 테마 GLB 추가 후보

| 모델     | 배치      | elevation   |
| -------- | --------- | ----------- |
| 거북이   | scattered | 1.5~4.0     |
| 돌고래   | scattered | 2.0~5.0     |
| 해마     | scattered | 1.0~3.5     |
| 불가사리 | scattered | 없음 (바닥) |
| 꽃게     | scattered | 없음 (바닥) |

### server.ts AI 프롬프트 업데이트

- `bubbles` 파티클 타입 프롬프트에 미반영 상태 → 추가 필요
- 현재 프롬프트의 파티클 타입: `"sparkles" | "snow" | "petals" | "rain"` → `"bubbles"` 추가

### 성능 개선 (모델 많아지면)

- 현재: 모든 GLB를 앱 시작 시 `useGLTF.preload()`로 전부 로드
- 개선 방향: 테마 선택 시에만 해당 테마의 GLB 로드 (lazy loading)
- GLB 20~30개 초과 시 초기 로딩 성능 저하 우려

### 기타

- 각 테마 실제 작품 수(방 크기)별 테스트 필요 (1x1, 2x2, 3x3 grid)
