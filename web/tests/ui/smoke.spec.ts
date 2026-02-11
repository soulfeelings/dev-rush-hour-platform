import { test, expect } from '@playwright/test';

// Проверяем базовый happy-path: переход в админку и успешная авторизация.
test('Авторизация в админке', async ({ page }) => {
  // Проверяем, что главная страница открывается и имеет ожидаемый title.
  await test.step('Открыть главную страницу и проверить заголовок', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle('Rush Hour Real Estate Platform');
  });

  // Проверяем, что ссылка Admin ведёт на страницу авторизации админки.
  await test.step('Перейти в админку', async () => {
    await page.getByTestId('header').getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  // Проверяем ввод валидных учётных данных и отправку формы.
  await test.step('Ввести логин и пароль, и нажать Login', async () => {
    const username = page.getByPlaceholder('Enter username');
    const password = page.getByPlaceholder('Enter password');

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();

    await username.fill('admin');
    await password.fill('admin');

    await page.getByRole('button', { name: 'Login' }).click();
  });

  // Проверяем, что после логина открыт раздел проектов админ-панели.
  await test.step('Проверить успешную авторизацию', async () => {
    await expect(page).toHaveURL('/admin/projects');
    await expect(page.getByText('Admin Panel')).toBeVisible();
  });
});
