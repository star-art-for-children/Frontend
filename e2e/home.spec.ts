import { test, expect } from '@playwright/test';

// 홈 페이지 — 비로그인 상태로 전시회 탐색 플로우 검증

test.describe('홈 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('히어로 섹션이 렌더링된다', async ({ page }) => {
    await expect(page.getByText('아이들의 첫 미술전,')).toBeVisible();
    await expect(page.getByText('스타아트').first()).toBeVisible();
    await expect(page.getByText('아이들의 꿈이 예술이 되는 곳')).toBeVisible();
  });

  test('검색 폼이 표시된다', async ({ page }) => {
    await expect(
      page.getByPlaceholder('전시회 이름, 교육기관 검색...')
    ).toBeVisible();
  });

  test('정렬 필터 버튼이 모두 표시된다', async ({ page }) => {
    await expect(page.getByRole('button', { name: '최신순' })).toBeVisible();
    await expect(page.getByRole('button', { name: '인기순' })).toBeVisible();
    await expect(page.getByRole('button', { name: '오래된 순' })).toBeVisible();
    await expect(page.getByRole('button', { name: '예정된 전시' })).toBeVisible();
    await expect(page.getByRole('button', { name: '종료된 전시' })).toBeVisible();
  });

  test('정렬 필터 클릭 시 URL 파라미터가 변경된다', async ({ page }) => {
    await page.getByRole('button', { name: '인기순' }).click();

    await expect(page).toHaveURL(/sort=popular/);
  });

  test('예정된 전시 필터 클릭 시 URL 파라미터가 변경된다', async ({ page }) => {
    await page.getByRole('button', { name: '예정된 전시' }).click();

    await expect(page).toHaveURL(/sort=upcoming/);
  });

  test('검색어 입력 후 제출 시 URL search 파라미터가 추가된다', async ({ page }) => {
    const searchInput = page.getByPlaceholder('전시회 이름, 교육기관 검색...');
    await searchInput.fill('봄 전시');
    // SearchForm에 submit 버튼 없음 — Enter 키로 제출
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/search=%EB%B4%84\+%EC%A0%84%EC%8B%9C|search=.*봄/);
  });

  test('검색어를 비우고 제출하면 search 파라미터가 제거된다', async ({ page }) => {
    await page.goto('/?search=테스트');

    const searchInput = page.getByPlaceholder('전시회 이름, 교육기관 검색...');
    await searchInput.clear();
    await searchInput.press('Enter');

    await expect(page).not.toHaveURL(/search=/);
  });

  test('헤더에 로그인 / 회원가입 링크가 표시된다 (비로그인)', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: '로그인' });
    const signupLink = page.getByRole('link', { name: '회원가입' });

    // 적어도 하나는 표시되어야 함 (모바일/데스크탑 레이아웃에 따라 다를 수 있음)
    const loginVisible = await loginLink.first().isVisible();
    const signupVisible = await signupLink.first().isVisible();
    expect(loginVisible || signupVisible).toBeTruthy();
  });
});
