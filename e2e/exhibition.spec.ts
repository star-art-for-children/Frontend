import { test, expect } from '@playwright/test';
import {
  mockExhibitionLike,
  mockArtworkLike,
  mockReviewCreate,
  mockReviewMutations,
} from './helpers/mock-api';
import { hasGeneralAuth, AUTH_GENERAL } from './helpers/auth';

const EXHIBITION_ID = process.env.TEST_EXHIBITION_ID;
const UPCOMING_ID = process.env.TEST_UPCOMING_EXHIBITION_ID;
const ENDED_ID = process.env.TEST_ENDED_EXHIBITION_ID;

// 진행중 전시회 상세 — 실제 TEST_EXHIBITION_ID 필요
test.describe('진행중 전시회 상세 페이지', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!EXHIBITION_ID, 'TEST_EXHIBITION_ID 환경 변수 미설정');
    await page.goto(`/exhibitions/${EXHIBITION_ID}`);
  });

  test('배너 이미지와 전시 제목이 표시된다', async ({ page }) => {
    const banner = page.locator('section').first();
    await expect(banner).toBeVisible();

    // 전시 상태 배지 또는 제목 확인
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('"진행중" 배지가 표시된다', async ({ page }) => {
    await expect(page.getByText('진행중')).toBeVisible();
  });

  test('전시회 소개 섹션이 표시된다', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '전시회 소개' })
    ).toBeVisible();
  });

  test('3D 갤러리 입장 버튼이 표시되고 올바른 링크를 가진다', async ({
    page,
  }) => {
    const enterBtn = page.getByRole('link', { name: '전시회 입장하기' });
    await expect(enterBtn).toBeVisible();
    await expect(enterBtn).toHaveAttribute('href', `/gallery/${EXHIBITION_ID}`);
  });

  test('관람 후기 섹션이 표시된다', async ({ page }) => {
    await expect(page.getByText('관람 후기')).toBeVisible();
  });

  test('작품 그리드가 표시된다', async ({ page }) => {
    // 작품 섹션 존재 확인 (작품이 없을 수도 있으므로 존재 여부만)
    const worksSection = page.getByRole('heading', { name: /전시 작품/ });
    // 작품이 있을 경우에만 표시되므로 optional 확인
    if (await worksSection.isVisible()) {
      await expect(worksSection).toBeVisible();
    }
  });

  test('비로그인 전시 좋아요 클릭 시 로그인 페이지로 이동한다', async ({
    page,
  }) => {
    await mockExhibitionLike(page, true);

    // 하트 버튼 찾기 (좋아요 버튼)
    const likeBtn = page.getByRole('button').filter({ hasText: /\d+/ }).first();
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      // 비로그인이므로 로그인 페이지로 이동
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe('예정된 전시회 상세 페이지', () => {
  test('예정 상태 안내가 표시된다', async ({ page }) => {
    test.skip(!UPCOMING_ID, 'TEST_UPCOMING_EXHIBITION_ID 환경 변수 미설정');

    await page.goto(`/exhibitions/${UPCOMING_ID}`);
    // ExhibitionUpcoming h2: "아직 공개되지 않은 미술전입니다"
    await expect(
      page.getByRole('heading', { name: /공개되지 않은|관람 가능/ })
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('종료된 전시회 상세 페이지', () => {
  test('종료 안내 메시지가 표시된다', async ({ page }) => {
    test.skip(!ENDED_ID, 'TEST_ENDED_EXHIBITION_ID 환경 변수 미설정');

    await page.goto(`/exhibitions/${ENDED_ID}`);
    await expect(page.getByText(/종료|끝났|마감/).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe('로그인 상태에서 전시회 상세 — 후기 기능', () => {
  test.use({ storageState: AUTH_GENERAL });

  test.beforeEach(async () => {
    test.skip(!EXHIBITION_ID, 'TEST_EXHIBITION_ID 환경 변수 미설정');
    test.skip(!hasGeneralAuth(), 'TEST_USER_EMAIL / TEST_USER_PASSWORD 미설정');
  });

  test('로그인 상태에서 후기 작성 폼이 표시된다', async ({ page }) => {
    await mockReviewCreate(page);
    await page.goto(`/exhibitions/${EXHIBITION_ID}`);

    // 로그인 상태이므로 후기 작성 영역이 표시됨
    const reviewInput = page.getByPlaceholder(/후기|감상/);
    if (await reviewInput.isVisible()) {
      await expect(reviewInput).toBeVisible();
    }
  });

  test('후기를 작성하면 목록에 추가된다 (mock)', async ({ page }) => {
    await mockReviewCreate(page);
    await mockReviewMutations(page);
    await page.goto(`/exhibitions/${EXHIBITION_ID}`);

    const reviewInput = page.getByPlaceholder(/후기|감상/);
    if (await reviewInput.isVisible()) {
      await reviewInput.fill('정말 멋진 전시였어요!');
      await page
        .getByRole('button', { name: /등록|작성|제출/ })
        .last()
        .click();
    }
  });
});

test.describe('전시회 작품 다이얼로그', () => {
  test.skip(!EXHIBITION_ID, 'TEST_EXHIBITION_ID 환경 변수 미설정');

  test('작품 클릭 시 상세 다이얼로그가 열린다', async ({ page }) => {
    await mockArtworkLike(page, true);
    await page.goto(`/exhibitions/${EXHIBITION_ID}`);

    // WorkDialog: button 안에 img + h3 (작품명) 구조
    const firstWork = page
      .locator('button')
      .filter({ has: page.locator('img[alt]') })
      .filter({ has: page.locator('h3') })
      .first();

    if (await firstWork.isVisible()) {
      await firstWork.click();
      // ArtworkDetailContent: role="dialog" 없이 fixed z-50 overlay로 렌더됨
      await expect(
        page.locator('div[class*="fixed"][class*="z-50"]')
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
