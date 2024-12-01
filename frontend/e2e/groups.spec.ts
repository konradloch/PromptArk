import { test, expect } from '@playwright/test';
import { createGroup, deleteGroup } from './generic';


test('create group', async ({ page }) => {
  await createGroup(page, 'Test 6 1 ABC');
  await expect(page.locator('tbody')).toContainText('Test 6 1 ABC');
  await deleteGroup(page, '0');
  await expect(page.locator('tbody')).toContainText('No data');
});

test('search group', async ({ page }) => {
  await createGroup(page, 'Test 6 1 ABC');
  await createGroup(page, 'FindME!');
  await page.getByLabel('Search').fill('Find');
  await expect(page.locator('tbody')).toContainText('FindME!');
  await expect(page.locator('tbody')).not.toContainText('Test 6 1 ABC');
  await page.getByLabel('Search').fill('');
  await deleteGroup(page, '0');
  await deleteGroup(page, '0');
  await expect(page.locator('tbody')).toContainText('No data');
});

test('access to group in other pages', async ({ page }) => {
  for (let i = 0; i <= 6; i++) {
    await createGroup(page, 'Test 6 1 ABC'+i);
  }
  await page.getByLabel('Go to next page').click();
  await expect(page.locator('tbody')).toContainText('Test 6 1 ABC0');
  await page.getByLabel('Go to previous page').click();
  for (let i = 0; i <= 6; i++) {
    await deleteGroup(page, '0');
  }
  await expect(page.locator('tbody')).toContainText('No data');
});

