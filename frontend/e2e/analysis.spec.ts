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

    
test('create analysis', async ({ page }) => {
    const pubName = "Publication 1" + new Date().getTime().toString();
    await createGroup(page, 'Test GR1');
    await page.getByRole('cell').first().click();
    await createPrompt(page, 'Test GR1', 'Prompt 1', 'List', null);
    await fillPromptAndActivate(page, 'Test GR1', 'Prompt 1', 'You are professionaly split text.', 'Split: {{ .text }} on 3 parts. Try to not cut meaning.', 'text', 'Reponse in JSON array.', '[{text: "..."},{text: "..."},{text: "..."}]', '');
    await createPrompt(page, 'Test GR1', 'Prompt 2', 'List', "Prompt 1");
    await fillPromptAndActivate(page, 'Test GR1', 'Prompt 2', 'You know the cars..', 'For given text: {{ .text }} find car names.', 'text', 'Response in Json.', '{"model": "..."}', '');
    await createPrompt(page, 'Test GR1', 'Prompt 3', 'List', "Prompt 2");
    await fillPromptAndActivate(page, 'Test GR1', 'Prompt 3', 'You are car mechanic', 'For given car name: {{ .name }} list most common issues.', 'name', 'Respomse in JSON Array', '[{model: "...", issues: [...]}]', '');
    await createPublication(page, 'Test GR1', pubName);
    const correlationId = new Date().getTime().toString();

    const req1 = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 1`, { data: {
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
    
    
    const req2 = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 2`, { data: {
        "text": "Lets talk about. First car was invented in 1885, it was a steam car. Then in 1886 first gasoline car was invented. It was a Benz Patent-Motorwagen"
    }});
    expect(req2.ok()).toBeTruthy();
    const req2pid = await req2.json();
    const req2analyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req2pid.id,
            "promptOutput": "{name: Duryea Motor Wagon}",
            "status": "correct"
    }});
    expect(req2analyzer.ok()).toBeTruthy();

    const req2b = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 2`, { data: {
        "text": "Then in 1896 first car was sold in USA. It was a Duryea Motor Wagon. Then in 1908 first car was produced in USA. It was a Ford Model T."
    }});
    expect(req2b.ok()).toBeTruthy();
    const req2bpid = await req2b.json();
    const req2banalyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req2bpid.id,
            "promptOutput": "{name: Ford Model T}",
            "status": "correct"
    }});
    expect(req2banalyzer.ok()).toBeTruthy();


    const req2c = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 2`, { data: {
        "text": "Then in 1913 first car was produced in Germany. It was a Mercedes-Benz. Then in 1916 first car was produced in Italy. It was a Alfa Romeo. Then in 1924 first car was produced in Japan. It was a Datsun. Then in 1926 first car was produced in Czechoslovakia. It was a Tatra. Then in 1928 first car was produced in Sweden. It was a Volvo. Then in 1933 first car was produced in Russia. New car era came at.."
    }});
    expect(req2c.ok()).toBeTruthy();
    const req2cpid = await req2c.json();
    const req2canalyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req2cpid.id,
            "promptOutput": "{name: Mercedes-Benz}",
            "status": "correct"
    }});
    expect(req2canalyzer.ok()).toBeTruthy();


    const req3 = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 3`, { data: {
        "name": "Duryea Motor Wagon"
    }});
    expect(req3.ok()).toBeTruthy();
    const req3pid = await req3.json();
    const req3analyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req3pid.id,
            "promptOutput": "[engine, wheels, brakes]",
            "status": "correct"
    }});
    expect(req3analyzer.ok()).toBeTruthy();

    const req3b = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 3`, { data: {
        "name": "Ford Model T"
    }});
    expect(req3b.ok()).toBeTruthy();
    const req3bpid = await req3b.json();
    const req3banalyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req3bpid.id,
            "promptOutput": "[engine, wheels, brakes, body]",
            "status": "correct"
    }});
    expect(req3banalyzer.ok()).toBeTruthy();

    const req3c = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 3`, { data: {
        "name": "Mercedes-Benz"
    }});
    expect(req3c.ok()).toBeTruthy();

    const req3cpid = await req3b.json();
    const req3canalyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptId": req3cpid.id,
            "promptOutput": "[engine, wheels, brakes, body, interior]",
            "status": "correct"
    }});
    expect(req3canalyzer.ok()).toBeTruthy();

    const req4 = await apiContext.post(`/group/Test GR1/publisher/`+pubName+`/prompt/Prompt 3`, { data: {
        "name": "Mercedes-Benz"
    }});
    expect(req4.ok()).toBeTruthy();

    const req34pid = await req4.json();
    const req4canalyzer = await apiContext.post(`/prompt/analyzer`, { data: {
            "correlationId": correlationId,
            "executionTime": new Date().toISOString(),
            "promptOutput": "[engine, wheels, brakes, body, interior]",
            "status": "correct"
    }});
    expect(req4canalyzer.ok()).toBeTruthy();


    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Monitor' }).click();
    await page.getByLabel('Correlation Id').click();
    await page.getByRole('option', { name: correlationId }).click();
    await expect(page.getByLabel(correlationId)).toContainText(correlationId+'...');
    await page.getByLabel('info').click();
    await expect(page.locator('pre')).toContainText('[engine, wheels, brakes, body, interior]');
    await page.locator('div').filter({ hasText: 'Final result[engine, wheels,' }).nth(1).press('Escape');
    await page.getByLabel('expand row').click();
    await expect(page.locator('#root')).toContainText('Prompt 2');


    await deletePubication(page, pubName);
    await deleteGroup(page, '0');
});