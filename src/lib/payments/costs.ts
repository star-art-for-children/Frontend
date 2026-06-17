// 차감 단가(크레딧=원). 클라이언트·서버 공유 — 서버 전용 import 없음.
// 조정 시 이 상수만 변경.
export const CREDIT_COSTS = {
  animate: 1000, // i2v = 1000 크레딧
  theme: 500, // AI테마 생성 = 500 크레딧
} as const;
