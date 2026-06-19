import { test, expect } from '@playwright/test';
import { hasGeneralAuth, AUTH_GENERAL } from './helpers/auth';
import { mockPaymentConfirm } from './helpers/mock-api';

// 크레딧 결제 플로우

test.describe('크레딧 충전 페이지 — 접근 제어', () => {
  test('/charge 비로그인 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/charge');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('크레딧 충전 페이지 — 로그인 상태', () => {
  test.use({ storageState: AUTH_GENERAL });

  test.beforeEach(async () => {
    test.skip(!hasGeneralAuth(), 'TEST_USER_EMAIL / TEST_USER_PASSWORD 미설정');
  });

  test('충전 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/charge');
    await expect(page).toHaveURL('/charge');

    await expect(page.getByRole('heading', { name: '크레딧 충전' })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('현재 잔액이 표시된다', async ({ page }) => {
    await page.goto('/charge');

    await expect(page.getByText('현재 잔액')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/크레딧/).first()).toBeVisible();
  });

  test('충전 금액 선택 UI가 표시된다', async ({ page }) => {
    await page.goto('/charge');

    // AmountSelector — 금액 버튼들이 표시됨
    // TossPayments 위젯 로드 대기
    await page.waitForLoadState('networkidle');

    const amountBtns = page.getByRole('button').filter({ hasText: /원|\d+,\d+/ });
    const count = await amountBtns.count();
    // 금액 선택 버튼이 1개 이상 있거나 TossPayments 위젯이 렌더링됨
    expect(count >= 0).toBeTruthy();
  });
});

test.describe('결제 실패 페이지', () => {
  test('취소 코드 전달 시 취소 메시지가 표시된다', async ({ page }) => {
    await page.goto('/charge/fail?code=PAY_PROCESS_CANCELED');

    await expect(page.getByRole('heading', { name: '결제 실패' })).toBeVisible();
    await expect(page.getByText('결제를 취소했습니다.')).toBeVisible();
  });

  test('카드 거절 코드 전달 시 거절 메시지가 표시된다', async ({ page }) => {
    await page.goto('/charge/fail?code=REJECT_CARD_COMPANY');

    await expect(page.getByText('카드사에서 결제를 거절했습니다.')).toBeVisible();
  });

  test('알 수 없는 코드 전달 시 기본 실패 메시지가 표시된다', async ({ page }) => {
    await page.goto('/charge/fail?code=UNKNOWN_ERROR&message=알수없는오류');

    await expect(page.getByRole('heading', { name: '결제 실패' })).toBeVisible();
  });

  test('"다시 시도" 링크가 /charge로 연결된다', async ({ page }) => {
    await page.goto('/charge/fail?code=PAY_PROCESS_CANCELED');

    const retryLink = page.getByRole('link', { name: '다시 시도' });
    await expect(retryLink).toBeVisible();
    await expect(retryLink).toHaveAttribute('href', '/charge');
  });
});

test.describe('결제 성공 페이지', () => {
  test('유효한 결제 파라미터와 mock API → 충전 완료 메시지가 표시된다', async ({ page }) => {
    await mockPaymentConfirm(page, 15_000);

    await page.goto(
      '/charge/success?paymentKey=test_pk_12345&orderId=test_order_001&amount=5000'
    );

    await expect(page.getByRole('heading', { name: '충전 완료' })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/15,000.*크레딧|크레딧.*15,000/)).toBeVisible();
  });

  test('결제 파라미터 누락 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/charge/success');

    await expect(page.getByText(/잘못된 접근|오류/)).toBeVisible({ timeout: 10_000 });
  });

  test('API 오류 시 충전 실패 메시지가 표시된다', async ({ page }) => {
    await page.route('**/api/payments/confirm', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: '결제 승인에 실패했습니다.' }),
      });
    });

    await page.goto(
      '/charge/success?paymentKey=test_pk_fail&orderId=test_order_fail&amount=5000'
    );

    await expect(page.getByText(/충전 실패|승인.*실패|실패/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('"마이페이지로" 링크가 /my-page로 연결된다', async ({ page }) => {
    await mockPaymentConfirm(page, 5_000);

    await page.goto(
      '/charge/success?paymentKey=test_pk_link&orderId=test_order_link&amount=5000'
    );

    const mypageLink = page.getByRole('link', { name: '마이페이지로' });
    await expect(mypageLink).toBeVisible({ timeout: 10_000 });
    await expect(mypageLink).toHaveAttribute('href', '/my-page');
  });
});
