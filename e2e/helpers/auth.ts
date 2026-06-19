import { Page } from '@playwright/test';
import path from 'path';

export const AUTH_GENERAL = path.join(__dirname, '../.auth/general.json');
export const AUTH_TEACHER = path.join(__dirname, '../.auth/teacher.json');

export function hasGeneralAuth(): boolean {
  return !!(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);
}

export function hasTeacherAuth(): boolean {
  return !!(process.env.TEST_TEACHER_EMAIL && process.env.TEST_TEACHER_PASSWORD);
}

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(email);
  await page.getByPlaceholder('비밀번호를 입력하세요').fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 20_000 });
}
