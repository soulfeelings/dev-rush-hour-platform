import { test, expect } from '@playwright/test';

test('Авторизация в админке', async ({ page }) => {
  await test.step('Открыть главную страницу и проверить заголовок', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle('Rush Hour Real Estate Platform');
  });

  await test.step('Перейти в админку', async () => {
    await page.getByTestId('header').getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  await test.step('Ввести логин и пароль, и нажать Login', async () => {
    const username = page.getByPlaceholder('Enter username');
    const password = page.getByPlaceholder('Enter password');

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();

    await username.fill('admin');
    await password.fill('admin');

    await page.getByRole('button', { name: 'Login' }).click();
  });

  await test.step('Проверить успешную авторизацию', async () => {
    await expect(page).toHaveURL('/admin/projects');
    await expect(page.getByText('Admin Panel')).toBeVisible();
  });
});