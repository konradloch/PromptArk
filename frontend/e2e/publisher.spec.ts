import { test, expect } from '@playwright/test';
import { createGroup, createPrompt, createPublication, deleteGroup, deletePubication, fillPromptAndActivate } from './generic';

let apiContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: 'http://localhost:8000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  });
});

test.afterAll(async ({ }) => {
    await apiContext.dispose();
  });

  test('search publication', async ({ page }) => {
    const pubName = 'Publication 1' + new Date().getTime().toString();
    const pubName2 = 'Publication 2' + new Date().getTime().toString();
    await createGroup(page, 'Test 6 1 ABC nr 1');
    await page.getByRole('cell').first().click();
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'List', null);
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'List', "Prompt 1");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'List', "Prompt 2");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPublication(page, 'Test 6 1 ABC nr 1', pubName);
    await createPublication(page, 'Test 6 1 ABC nr 1', pubName2);

    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Publisher' }).click();

    await page.getByLabel('Search').click();
    await page.getByLabel('Search').fill(pubName2);
    await expect(page.getByRole('rowheader')).toContainText(pubName2);
    await page.getByLabel('Search').fill('');
    await deletePubication(page, pubName);
    await deletePubication(page, pubName2);

    await deleteGroup(page, '0');
});

test('create publication', async ({ page }) => {
    const pubName = 'Publication 1' + new Date().getTime().toString();
    await createGroup(page, 'Test 6 1 ABC nr 1');
    await page.getByRole('cell').first().click();
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'List', null);
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'List', "Prompt 1");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'List', "Prompt 2");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPublication(page, 'Test 6 1 ABC nr 1', pubName);

    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Publisher' }).click();
    await expect(page.getByRole('rowheader')).toContainText(pubName);
    await expect(page.locator('tbody')).toContainText('active');

    //API normal
    const normalReq = await apiContext.post(`/group/Test 6 1 ABC nr 1/publisher/`+pubName+`/prompt/Prompt 1`, {});
    expect(normalReq.ok()).toBeTruthy();
    expect(await normalReq.json()).toEqual(expect.objectContaining(
        {
            "name": "Prompt 1",
            "parentName": "",
            "publishIdentifier": pubName,
            "groupName": "Test 6 1 ABC nr 1",
            "disabled": false,
            "devVersion": false,
            "systemRolePrompt": "sfsdfsdfsdfsdf",
            "userPrompt": "\nPrrr1\n\n\nResponse only in format:\nd\n\n\nExample outputs:\n\n- f\n\n",
            "fullPrompt": "\nsfsdfsdfsdfsdf\n\n\nPrrr1\n\n\n Response only in format:\nd\n\n\nExample outputs:\n\n- f\n\n",
            "temperature": 49,
            "topP": 50,
            "params": [
              "abc"
            ],
            "promptParams": {},
            "customParams": {
              "model": "gpt-4.0"
            }
          }
    ));

    await page.getByLabel('devmode').click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('tbody')).toContainText('dev mode');

    //API dev mode
    const devReq = await apiContext.post(`/group/Test 6 1 ABC nr 1/publisher/`+pubName+`/prompt/Prompt 1`, {});
    expect(devReq.ok()).toBeTruthy();
    expect(await devReq.json()).toEqual(expect.objectContaining(
        {
            "devVersion": true,
        }
    ));

    await page.getByLabel('disable').click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('tbody')).toContainText('disabled');

    //API disabled
    const disReq = await apiContext.post(`/group/Test 6 1 ABC nr 1/publisher/`+pubName+`/prompt/Prompt 1`, {});
    expect(disReq.ok()).toBeTruthy();
    expect(await disReq.json()).toEqual(expect.objectContaining(
        {
            "disabled": true
        }
    ));

    await page.getByLabel('delete').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('cell')).toContainText('No data');

    // API no data
    const noReq = await apiContext.post(`/group/Test 6 1 ABC nr 1/publisher/`+pubName+`/prompt/Prompt 1`, {});
    expect(noReq.status()).toBe(404);

    await deleteGroup(page, '0');
});

test('a/b tests', async ({ page }) => {
    const pubName1 = 'Publication 1' + new Date().getTime().toString();
    const pubName2 = 'Publication 2' + new Date().getTime().toString();
    await createGroup(page, 'Test 6 1 ABC nr 1');
    await page.getByRole('cell').first().click();
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'List', null);
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 1', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'List', "Prompt 1");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 2', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPrompt(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'List', "Prompt 2");
    await fillPromptAndActivate(page, 'Test 6 1 ABC nr 1', 'Prompt 3', 'sfsdfsdfsdfsdf', 'Prrr1', 'abc', 'd', 'f', 'fsdfsdfsdfsdfsdfsdf');
    await createPublication(page, 'Test 6 1 ABC nr 1', pubName1);
    await createPublication(page, 'Test 6 1 ABC nr 1', pubName2);

    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Publisher' }).click();
    await page.getByLabel('collapsible table').getByRole('paragraph').nth(1).click();
    await expect(page.getByLabel('collapsible table').getByRole('paragraph').nth(1)).toBeVisible();
    await page.getByRole('row', { name: 'expand row '+pubName1+' Test' }).getByLabel('abtest').click();
    await page.getByLabel('Publication').click();
    await page.getByRole('option', { name: 'Publication' }).click();
    await page.getByLabel('Hit Ratio (%)').click();
    await page.getByLabel('Hit Ratio (%)').fill('50');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('row', { name: 'expand row '+pubName1+' Test' }).getByRole('radio')).toBeVisible();
    await deletePubication(page, pubName1);
    await deletePubication(page, pubName2);
    await deleteGroup(page, '0');
});