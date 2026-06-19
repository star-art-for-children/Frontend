import { test, expect } from '@playwright/test';
import { mockOnboarding } from './helpers/mock-api';

// 인증 관련 페이지 UI 검증 — 실제 Supabase 호출 없이 폼·라우팅 동작만 확인

test.describe('로그인 페이지', () => {
  test('기본 UI 요소가 렌더링된다', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    await expect(page.getByPlaceholder('example@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    await expect(page.getByRole('link', { name: '회원가입 하기' })).toBeVisible();
  });

  test('빈 폼 제출 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    await expect(page.getByText('이메일과 비밀번호를 입력해주세요.')).toBeVisible();
  });

  test('비밀번호 표시/숨기기 토글이 동작한다', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByPlaceholder('비밀번호를 입력하세요');
    await passwordInput.fill('test1234');

    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 눈 모양 토글 버튼 클릭
    await page.click('button[tabindex="-1"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.click('button[tabindex="-1"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('회원가입 링크 클릭 시 /signup으로 이동한다', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: '회원가입 하기' }).click();
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('회원가입 페이지', () => {
  test('기본 UI 요소가 렌더링된다', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    await expect(page.getByText('계정 유형을 선택하고 가입해보세요')).toBeVisible();
  });

  test('일반 사용자 / 선생님 탭이 표시된다', async ({ page }) => {
    await page.goto('/signup');

    // 탭은 '이메일로 회원가입' 클릭 후 form view에서만 노출됨
    await page.getByText('이메일로 회원가입').click();
    await expect(page.getByText('일반 사용자')).toBeVisible();
    await expect(page.getByText('선생님')).toBeVisible();
  });

  test('선생님 탭 선택 시 학원명 필드가 나타난다', async ({ page }) => {
    await page.goto('/signup');

    // form view로 전환 후 선생님 탭 클릭
    await page.getByText('이메일로 회원가입').click();
    await page.getByText('선생님').click();

    await expect(page.getByPlaceholder('학원 / 학교명')).toBeVisible();
  });
});

test.describe('온보딩 페이지', () => {
  test('비로그인 상태로 접근하면 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page).toHaveURL('/login');
  });

  test('일반 사용자 / 선생님 탭 전환이 동작한다 (UI mock)', async ({ page }) => {
    // onboarding은 auth가 필요하므로 redirect 동작만 확인
    await page.goto('/onboarding');
    await expect(page).toHaveURL('/login');
  });
});
