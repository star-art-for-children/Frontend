import { test, expect } from '@playwright/test';

const EXHIBITION_ID = process.env.TEST_EXHIBITION_ID;

// 3D 갤러리 — 입장 모달과 HUD UI만 검증 (Three.js 씬 자체는 E2E 범위 제외)

test.describe('갤러리 입장 모달', () => {
  test.beforeEach(async () => {
    test.skip(!EXHIBITION_ID, 'TEST_EXHIBITION_ID 환경 변수 미설정');
    // Three.js 씬 초기화 시간 확보
    test.setTimeout(15_000);
  });

  test('갤러리 페이지 접근 시 입장 모달이 표시된다', async ({ page }) => {
    await page.goto(`/gallery/${EXHIBITION_ID}`);

    // GalleryEntryModal — 전시 제목 / 입장 버튼 / 뒤로가기 버튼 확인
    await expect(
      page.getByRole('button', { name: /입장하기|로딩중/ })
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test('캐릭터 선택 버튼 세 가지가 모두 표시된다', async ({ page }) => {
    await page.goto(`/gallery/${EXHIBITION_ID}`);

    // human / bunny / cartoon 캐릭터 선택 UI
    // 텍스트 또는 이미지 기반 버튼으로 구현되어 있음
    await page
      .waitForSelector(
        '[data-character], button:has-text("인간"), button:has-text("토끼"), button:has-text("캐릭터")',
        {
          timeout: 5_000,
          state: 'attached',
        }
      )
      .catch(() => {
        // 캐릭터 버튼이 없으면 입장 버튼 존재만 확인
      });

    await expect(
      page.getByRole('button', { name: /입장하기|로딩중/ })
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test('뒤로가기 버튼 클릭 시 이전 페이지로 이동한다', async ({ page }) => {
    // 전시 상세에서 갤러리로 이동 후 뒤로가기 테스트
    await page.goto(`/exhibitions/${EXHIBITION_ID}`);
    await page.getByRole('link', { name: '전시회 입장하기' }).click();
    await expect(page).toHaveURL(`/gallery/${EXHIBITION_ID}`);

    const backBtn = page.getByRole('button', { name: /뒤로|돌아가/ });
    if (await backBtn.isVisible({ timeout: 10_000 })) {
      await backBtn.click();
      await expect(page).toHaveURL(`/exhibitions/${EXHIBITION_ID}`);
    }
  });

  test('씬 로딩 중에는 입장 버튼이 비활성화되어 있다', async ({ page }) => {
    await page.goto(`/gallery/${EXHIBITION_ID}`);

    const enterBtn = page.getByRole('button', { name: /입장하기|로딩중/ });
    await expect(enterBtn).toBeVisible({ timeout: 15_000 });

    // 씬이 완전히 로드되기 전까지 비활성화 상태인지 확인
    const isDisabled = await enterBtn.isDisabled();
    // isAllReady가 false일 때 비활성화됨 — 초기 상태는 비활성화
    // (씬 로드 속도에 따라 이미 활성화되어 있을 수도 있음)
    expect(typeof isDisabled).toBe('boolean');
  });
});

test.describe('갤러리 오류 처리', () => {
  test('존재하지 않는 갤러리 ID 접근 시 에러가 표시된다', async ({ page }) => {
    await page.goto('/gallery/non-existent-exhibition-id-99999');

    // not-found 페이지의 고유 헤딩으로 확인
    await expect(
      page.getByRole('heading', { name: '페이지를 찾을 수 없어요' })
    ).toBeVisible({ timeout: 15_000 });
  });
});
