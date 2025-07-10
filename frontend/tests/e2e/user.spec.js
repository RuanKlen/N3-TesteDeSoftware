const { test, expect } = require('@playwright/test');

test.describe('User Management CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForSelector('h1:has-text("CRUD de Usuários")');
    });

    test('should create a new user', async ({ page }) => {
        await page.getByRole('button', { name: 'Cancelar Edição' }).click().catch(() => { });

        const randomEmail = `test${Date.now()}@example.com`;
        await page.getByPlaceholder('Nome').fill('Playwright Test User');
        await page.getByPlaceholder('Email').fill(randomEmail);
        await page.getByPlaceholder('Senha').fill('P@ssword123');
        await page.getByPlaceholder('Endereço (Opcional)').fill('Rua dos Testes, 456');
        await page.getByPlaceholder('Telefone (Opcional)').fill('98765-4321');

        await page.getByRole('button', { name: 'Enviar' }).click();

        await expect(page.getByText('Usuário criado com sucesso!')).toBeVisible();
        await expect(page.locator('li').filter({ hasText: 'Playwright Test User' })).toBeVisible();
    });

    test('should edit an existing user', async ({ page }) => {
        const uniqueEmail = `edit_user${Date.now()}@example.com`;
        await page.getByPlaceholder('Nome').fill('User to Edit');
        await page.getByPlaceholder('Email').fill(uniqueEmail);
        await page.getByPlaceholder('Senha').fill('editpass');
        await page.getByRole('button', { name: 'Enviar' }).click();
        await expect(page.getByText('Usuário criado com sucesso!')).toBeVisible();
        await page.waitForTimeout(500);

        await page.locator('li').filter({ hasText: 'User to Edit' }).getByRole('button', { name: 'Editar' }).click();

        await expect(page.getByRole('heading', { name: 'Editar Usuário' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Salvar Edição' })).toBeVisible();

        await page.getByPlaceholder('Nome').fill('Updated Playwright User');
        await page.getByPlaceholder('Nova Senha (deixe em branco para não alterar)').fill('NewP@ssword');
        await page.getByPlaceholder('Telefone').fill('1122334455');

        await page.getByRole('button', { name: 'Salvar Edição' }).click();

        await expect(page.getByText('Usuário atualizado com sucesso!')).toBeVisible();
        await expect(page.locator('li').filter({ hasText: 'Updated Playwright User' })).toBeVisible();
    });

    test('should delete an existing user', async ({ page }) => {
        const deleteEmail = `delete_user${Date.now()}@example.com`;
        await page.getByPlaceholder('Nome').fill('User to Delete');
        await page.getByPlaceholder('Email').fill(deleteEmail);
        await page.getByPlaceholder('Senha').fill('deletepass');
        await page.getByRole('button', { name: 'Enviar' }).click();
        await expect(page.getByText('Usuário criado com sucesso!')).toBeVisible();
        await page.waitForTimeout(500);

        await page.locator('li').filter({ hasText: 'User to Delete' }).getByRole('button', { name: 'Excluir' }).click();

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Tem certeza que deseja deletar este usuário?');
            await dialog.accept();
        });

        await expect(page.getByText('Usuário deletado com sucesso!')).toBeVisible();
        await expect(page.locator('li').filter({ hasText: 'User to Delete' })).not.toBeVisible();
    });

    test('should display existing users', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Usuários Cadastrados' })).toBeVisible();
        await expect(page.locator('ul li')).not.toHaveCount(0);
    });
});