import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Admin Dashboard', () => {
    test.describe.configure({ mode: 'serial' });
    const adminEmail = 'admin@demo.com';
    const password = 'Password123!';

    test.beforeEach(async ({ page }) => {
        await login(page, adminEmail, password);
    });

    test('should restrict access for non-admins', async ({ page }) => {
        // Logout admin
        await page.goto('/');
        const userMenuTrigger = page.getByRole('button', { name: /Admin/i }).first();
        await userMenuTrigger.click();
        await page.getByText(/Log out/i).click();
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // Login as normal user
        await login(page, 'pamy@mailinator.com', password);

        // Try to access admin page
        await page.goto('/admin');
        await page.waitForTimeout(2000); // Wait for redirect
        await expect(page).toHaveURL(/^(http:\/\/localhost:5173\/)?\/?$/, { timeout: 10000 });
    });

    test('should filter users by search', async ({ page }) => {
        await page.goto('/admin');

        // Wait for page to be ready
        await page.waitForTimeout(3000);

        // Ensure we're on the Users tab (it should be default, but click it to be sure)
        const usersTab = page.getByRole('button', { name: /Users/i });
        if (await usersTab.isVisible()) {
            await usersTab.click();
            await page.waitForTimeout(1000);
        }

        const searchInput = page.getByPlaceholder(/Search users/i);
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        await searchInput.fill('admin');

        await page.waitForTimeout(1000);

        const rowCount = await page.locator('tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);
        await expect(page.locator('tbody')).toContainText('admin@demo.com');
    });

    test('should create and delete a category', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: /Categories/i }).click();

        const catName = `E2E Category ${Math.random().toString(36).substring(7)}`;
        await page.fill('#name', catName);
        await page.fill('#desc', 'Test description');
        await page.getByRole('button', { name: /Create Category/i }).click();

        // Check list
        await expect(page.getByText(catName)).toBeVisible({ timeout: 10000 });

        // Delete it
        const catRow = page.locator('.group', { hasText: catName });

        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept());

        await catRow.getByRole('button').first().click();

        await expect(page.getByText(catName)).not.toBeVisible({ timeout: 10000 });
    });
});
