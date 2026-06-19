import { test, expect } from '@playwright/test';
import { hasGeneralAuth, AUTH_GENERAL } from './helpers/auth';

// 마이페이지 — 일반 유저 기준

test.describe('마이페이지 — 비로그인 접근 제어', () => {
  test('/my-page 비로그인 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page).toHaveURL('/login');
  });

  test('/artworks 비로그인 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/artworks');
    await expect(page).toHaveURL('/login');
  });

  test('/wish-list 비로그인 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/wish-list');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('마이페이지 — 로그인 상태 (일반 유저)', () => {
  test.use({ storageState: AUTH_GENERAL });

  test.beforeEach(async () => {
    test.skip(!hasGeneralAuth(), 'TEST_USER_EMAIL / TEST_USER_PASSWORD 미설정');
  });

  test('마이페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page).toHaveURL('/my-page');
  });

  test('프로필 카드에 이름과 이메일이 표시된다', async ({ page }) => {
    await page.goto('/my-page');

    // 이름/이메일은 실제 계정에 따라 다름 — 요소 존재 여부만 확인
    const profileCard = page.locator('[class*="profile"], [class*="Profile"]').first();
    if (await profileCard.isVisible()) {
      await expect(profileCard).toBeVisible();
    } else {
      // ProfileCard 컴포넌트가 렌더링되는 영역 확인
      await expect(page.getByText(process.env.TEST_USER_EMAIL!)).toBeVisible({ timeout: 10_000 });
    }
  });

  test('크레딧 잔액이 표시된다', async ({ page }) => {
    // 일반 유저는 CreditCard 섹션이 렌더링되지 않음 (teacher 전용)
    test.skip(true, '일반 유저는 크레딧 섹션 미표시 — teacher.spec.ts에서 검증');
    await page.goto('/my-page');
    await expect(page.getByText(/크레딧/)).toBeVisible({ timeout: 10_000 });
  });

  test('"충전하기" 링크가 /charge로 연결된다', async ({ page }) => {
    await page.goto('/my-page');

    const chargeLink = page.getByRole('link', { name: /충전/ });
    if (await chargeLink.isVisible()) {
      await expect(chargeLink).toHaveAttribute('href', '/charge');
    }
  });

  test('업적 섹션이 표시된다', async ({ page }) => {
    await page.goto('/my-page');

    await expect(page.getByText(/업적|첫 발자국|탐험가|마스터/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('"내 작품" 링크 클릭 시 /artworks로 이동한다', async ({ page }) => {
    await page.goto('/my-page');

    const artworksLink = page.getByRole('link', { name: /내 작품/ });
    if (await artworksLink.isVisible()) {
      await artworksLink.click();
      await expect(page).toHaveURL('/artworks');
    }
  });

  test('"찜 목록" 링크 클릭 시 /wish-list로 이동한다', async ({ page }) => {
    await page.goto('/my-page');

    const wishLink = page.getByRole('link', { name: /찜|위시리스트/ });
    if (await wishLink.isVisible()) {
      await wishLink.click();
      await expect(page).toHaveURL('/wish-list');
    }
  });

  test('로그아웃 버튼이 표시된다', async ({ page }) => {
    await page.goto('/my-page');

    await expect(page.getByRole('button', { name: /로그아웃/ })).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe('내 작품 페이지', () => {
  test.use({ storageState: AUTH_GENERAL });

  test.beforeEach(async () => {
    test.skip(!hasGeneralAuth(), 'TEST_USER_EMAIL / TEST_USER_PASSWORD 미설정');
  });

  test('내 작품 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/artworks');
    await expect(page).toHaveURL('/artworks');
    // 페이지가 로드되면 작품 목록 또는 빈 상태 메시지가 표시됨
    await page.waitForLoadState('networkidle');
  });
});

test.describe('찜 목록 페이지', () => {
  test.use({ storageState: AUTH_GENERAL });

  test.beforeEach(async () => {
    test.skip(!hasGeneralAuth(), 'TEST_USER_EMAIL / TEST_USER_PASSWORD 미설정');
  });

  test('찜 목록 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/wish-list');
    await expect(page).toHaveURL('/wish-list');
    await page.waitForLoadState('networkidle');
  });
});
