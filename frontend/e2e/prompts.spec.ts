import { test, expect } from '@playwright/test';
import { createGroup, createPrompt, deleteGroup, fillPromptAndActivate } from './generic';

test('create prompts', async ({ page }) => {
  await createGroup(page, 'Test 6 1 ABC nr 1');
  await page.getByRole('cell').first().click();
  await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'List', null);
  await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'Object', 'Prompt 1');
  await page.getByRole('tab', { name: 'List View' }).dblclick();
  await expect(page.locator('tbody')).toContainText('Prompt 1');
  await expect(page.locator('tbody')).toContainText('Prompt 2');
  await page.getByRole('row', { name: 'Prompt 1 Prompt desc. name:' }).getByLabel('delete').click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('tbody')).toContainText('No data');
  await deleteGroup(page, '0');
  await expect(page.locator('tbody')).toContainText('No data');
});

test('prompt builder', async ({ page }) => {
    await createGroup(page, 'Test 6 1 ABC nr 1');
    await page.getByRole('cell').first().click();
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'List', null);
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await page.getByLabel('breadcrumb').getByRole('link', { name: 'Prompts' }).click();
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'List', "Prompt 1");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await page.getByLabel('breadcrumb').getByRole('link', { name: 'Prompts' }).click();
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'List', "Prompt 2");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await page.getByLabel('breadcrumb').getByRole('link', { name: 'Prompts' }).click();
    //TODO contains in preview
    await deleteGroup(page, '0');
});

