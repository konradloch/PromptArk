export const createGroup = async (page: any, name: string) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Prompts' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByLabel('Group name').click();
    await page.getByLabel('Group name').fill(name);
    await page.getByLabel('Description (optional)').click();
    await page.getByLabel('Description (optional)').fill(name + ': Descr group abc. ');
    await page.getByRole('button', { name: 'Create' }).click();
}

export const deleteGroup = async (page: any, id: string) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Prompts' }).click();
    await page.locator('tbody tr').nth(id).getByLabel('delete').click();
    await page.getByRole('button', { name: 'Delete' }).click();
}

export const createPublication = async (page: any, group: string, pubName: string) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Prompts' }).click();
    await page.getByRole('rowheader', { name: group }).click();
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.getByLabel('Publication Identifier').click();
    await page.getByLabel('Publication Identifier').fill(pubName);
    await page.getByRole('button', { name: 'Publish' }).click();
}

export const deletePubication = async (page: any, name: string) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Publisher' }).click();
    await page.getByRole('row', { name: 'expand row ' + name}).getByLabel('delete').click();
    await page.getByRole('button', { name: 'Delete' }).click();
}

export const fillPromptAndActivate = async (page: any, group: string, name: string, p1: string, p2: string, p3: string, p4: string, p5: string, p6: string) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Prompts' }).click();
    await page.getByRole('rowheader', { name: group }).click();
    await page.getByRole('tab', { name: 'List View' }).dblclick();

    await page.getByRole('row', { name: name + ' Prompt desc. name:' }).getByLabel('builder').click();
    await page.locator('.view-lines').first().click();
    await page.locator('div').filter({ hasText: /^System Role Prompt1$/ }).getByLabel('Editor content;Press Alt+F1').fill(p1);
    await page.locator('div:nth-child(3) > section > div > .monaco-editor > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines').click();
    await page.locator('div').filter({ hasText: /^Prompt1$/ }).getByLabel('Editor content;Press Alt+F1').fill(p2);
    await page.getByLabel('Parameters').click();
    await page.getByLabel('Parameters').fill(p3);
    await page.getByLabel('Parameters').press('Enter');
    await page.locator('div:nth-child(5) > section > div > .monaco-editor > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines').click();
    await page.locator('div').filter({ hasText: /^Output Prompt1$/ }).getByLabel('Editor content;Press Alt+F1').fill(p4);
    await page.locator('.MuiGrid-root > div > div > section > div > .monaco-editor > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines').click();
    await page.locator('section').filter({ hasText: /^1$/ }).getByLabel('Editor content;Press Alt+F1').fill(p5);
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.locator('.MuiSlider-rail').first().click();
    await page.locator('div:nth-child(8) > .MuiBox-root > div > div:nth-child(2) > .MuiSlider-root').click(); //TODO fixed values
    await page.getByLabel('Custom Param Key').click();
    await page.getByLabel('Custom Param Key').fill('model');
    await page.getByLabel('Custom Param Value').click();
    await page.getByLabel('Custom Param Value').fill('gpt-4.0');
    await page.getByRole('button', { name: 'Add' }).nth(1).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Activate' }).click();
}

export const createPrompt = async (page: any, group: string, name: string, type: string, parent: string | null) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Prompts' }).click();
    await page.getByRole('rowheader', { name: group }).click();

    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByLabel('Name (unique, not editable)').click();
    await page.getByLabel('Name (unique, not editable)').fill(name);
    await page.getByLabel('Description').click();
    await page.getByLabel('Description').fill('Prompt desc. name: ' + name);
    if (parent) {
        await page.locator('#input7').click();
        await page.getByRole('option', { name: parent }).click();
    }
    await page.getByRole('button', { name: 'Create' }).click();
}