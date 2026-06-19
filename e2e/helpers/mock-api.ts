import { Page } from '@playwright/test';

export async function mockExhibitionLike(page: Page, liked = true) {
  await page.route('**/api/exhibitions/*/likes', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ liked, likes: liked ? 42 : 41 }),
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockArtworkLike(page: Page, liked = true) {
  await page.route('**/api/exhibitions/*/artworks/*/likes', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ liked, likes: liked ? 10 : 9 }),
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockReviewCreate(page: Page) {
  await page.route('**/api/exhibitions/*/reviews', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-review-id',
          content: '테스트 후기입니다.',
          author: '테스트유저',
          userId: 'mock-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockReviewMutations(page: Page) {
  await page.route('**/api/exhibitions/*/reviews/*', async (route) => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    } else {
      await route.continue();
    }
  });
}

export async function mockStamp(page: Page) {
  await page.route('**/api/exhibitions/*/artworks/*/stamp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stamped: true }),
    });
  });
}

export async function mockPaymentConfirm(page: Page, balance = 10_000) {
  await page.route('**/api/payments/confirm', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ balance }),
    });
  });
}

export async function mockOnboarding(page: Page) {
  await page.route('**/api/auth/onboarding', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

export async function mockReaction(page: Page) {
  await page.route('**/api/exhibitions/*/artworks/*/reactions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

export async function mockAnimate(page: Page) {
  await page.route('**/api/exhibitions/*/artworks/*/animate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ videoUrl: 'https://example.com/video.mp4' }),
    });
  });
}
