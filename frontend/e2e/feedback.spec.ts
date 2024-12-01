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

    
test('create feebacks', async ({ page }) => {
    const pubName = "Publication 1" + new Date().getTime().toString();
    const groupName = 'Test GR1' + new Date().getTime().toString();
    await createGroup(page, groupName);
    await page.getByRole('cell').first().click();
    await createPrompt(page, groupName, 'Prompt 1', 'List', null);
    await fillPromptAndActivate(page, groupName, 'Prompt 1', 'You are professionaly split text.', 'Split: {{ .text }} on 3 parts. Try to not cut meaning.', 'text', 'Reponse in JSON array.', '[{text: "..."},{text: "..."},{text: "..."}]', '');
    await createPublication(page, groupName, pubName);
    const correlationId = new Date().getTime().toString();

    const req1 = await apiContext.post(`/group/`+groupName+`/publisher/`+pubName+`/prompt/Prompt 1`, { data: {
        "text": "Lets talk about. First car was invented in 1885, it was a steam car. Then in 1886 first gasoline car was invented. It was a Benz Patent-Motorwagen. Then in 1896 first car was sold in USA. It was a Duryea Motor Wagon. Then in 1908 first car was produced in USA. It was a Ford Model T. Then in 1913 first car was produced in Germany. It was a Mercedes-Benz. Then in 1916 first car was produced in Italy. It was a Alfa Romeo. Then in 1924 first car was produced in Japan. It was a Datsun. Then in 1926 first car was produced in Czechoslovakia. It was a Tatra. Then in 1928 first car was produced in Sweden. It was a Volvo. Then in 1933 first car was produced in Russia. New car era came at..."
    }});
    expect(req1.ok()).toBeTruthy();
    const req1pid = await req1.json();
    const req1analyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req1pid.id,
            "promptOutput": "[{text: Lets talk about. First car was invented in 1885, it was a steam car. Then in 1886 first gasoline car was invented. It was a Benz Patent-Motorwage},{Then in 1896 first car was sold in USA. It was a Duryea Motor Wagon. Then in 1908 first car was produced in USA. It was a Ford Model T.},{Then in 1913 first car was produced in Germany. It was a Mercedes-Benz. Then in 1916 first car was produced in Italy. It was a Alfa Romeo. Then in 1924 first car was produced in Japan. It was a Datsun. Then in 1926 first car was produced in Czechoslovakia. It was a Tatra. Then in 1928 first car was produced in Sweden. It was a Volvo. Then in 1933 first car was produced in Russia. New car era came at..}]",
            "status": "correct"
    }});
    expect(req1analyzer.ok()).toBeTruthy();

    const req1aanalyzer = await apiContext.post(`/prompt/analyzer`, { data: {
        "correlationId": correlationId,
        "executionTime": new Date().toISOString(),
        "promptOutput": "[{text: Lets talk about. First car was invented in 1885, it was a steam car. Then in 1886 first gasoline car was invented. It was a Benz Patent-Motorwage},{Then in 1896 first car was sold in USA. It was a Duryea Motor Wagon. Then in 1908 first car was produced in USA. It was a Ford Model T.},{Then in 1913 first car was produced in Germany. It was a Mercedes-Benz. Then in 1916 first car was produced in Italy. It was a Alfa Romeo. Then in 1924 first car was produced in Japan. It was a Datsun. Then in 1926 first car was produced in Czechoslovakia. It was a Tatra. Then in 1928 first car was produced in Sweden. It was a Volvo. Then in 1933 first car was produced in Russia. New car era came at..}]",
        "status": "correct"
    }});
    expect(req1aanalyzer.ok()).toBeTruthy();

    
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Monitor' }).click();
    await page.getByLabel('Correlation Id').click();
    await page.getByRole('option', { name: correlationId }).click();

    await page.getByLabel('info').click();
    await page.getByRole('button').first().click();
    await page.getByRole('button').first().click();
    await page.getByRole('button').first().click();
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button').nth(1).click();

    await page.locator('div').filter({ hasText: '[{text: Lets talk about.' }).nth(1).press('Escape');

    await page.getByLabel('expand row').click();
    await page.getByLabel('expand row 2').click();
    await page.getByLabel('collapsible table 2s').getByRole('button').first().click();
    await page.getByLabel('collapsible table 2s').getByRole('button').first().click();
    await page.getByLabel('collapsible table 2s').getByRole('button').nth(1).click();

    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Feedback' }).click();

    await page.getByLabel('Publication Version').click();
    await page.getByRole('option', { name: pubName }).click();
    await expect(page.locator('tbody')).toContainText('5');
    await expect(page.locator('tbody')).toContainText('60');
    await expect(page.locator('tbody')).toContainText('8');
    await expect(page.locator('tbody')).toContainText('62.5');

    await page.getByLabel('expand row').click();
    await expect(page.getByLabel('promptrow').locator('tbody')).toContainText('3');
    await expect(page.getByLabel('promptrow').locator('tspan')).toContainText('66.667');

    await deletePubication(page, pubName);
    await deleteGroup(page, '0');
});