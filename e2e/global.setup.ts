import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '.auth');

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
}

function writeEmptyState(filename: string) {
  fs.writeFileSync(
    path.join(AUTH_DIR, filename),
    JSON.stringify({ cookies: [], origins: [] })
  );
}

setup('일반 유저 인증 세션 저장', async ({ page }) => {
  ensureAuthDir();

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn(
      '⚠️  TEST_USER_EMAIL / TEST_USER_PASSWORD 미설정 — 일반 유저 auth 건너뜀'
    );
    writeEmptyState('general.json');
    return;
  }

  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(email);
  await page.getByPlaceholder('비밀번호를 입력하세요').fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 20_000 });

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'general.json') });
  console.log('✅ 일반 유저 인증 세션 저장 완료');
});

setup('선생님 인증 세션 저장', async ({ page }) => {
  ensureAuthDir();

  const email = process.env.TEST_TEACHER_EMAIL;
  const password = process.env.TEST_TEACHER_PASSWORD;

  if (!email || !password) {
    console.warn(
      '⚠️  TEST_TEACHER_EMAIL / TEST_TEACHER_PASSWORD 미설정 — 선생님 auth 건너뜀'
    );
    writeEmptyState('teacher.json');
    return;
  }

  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(email);
  await page.getByPlaceholder('비밀번호를 입력하세요').fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 20_000 });

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'teacher.json') });
  console.log('✅ 선생님 인증 세션 저장 완료');
});
