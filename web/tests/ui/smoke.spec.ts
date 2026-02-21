import { test, expect } from '@playwright/test';

// Проверяем базовый happy-path: открытие главной и переход в каталог.
test('Главная страница и каталог доступны', async ({ page }) => {
  // Проверяем, что главная страница открывается и имеет ожидаемый title.
  await test.step('Открыть главную страницу и проверить заголовок', async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Rush Hour Real Estate Platform');
  });

  // Проверяем, что ссылка See Projects ведёт в каталог и фильтры загружаются.
  await test.step('Перейти в каталог проектов из хедера', async () => {
    await page.getByTestId('header').getByRole('link', { name: 'See Projects' }).click();
    await expect(page).toHaveURL('/catalog/projects');
    await expect(page.getByPlaceholder('Search by project name')).toBeVisible();
  });
});
