import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('User Profile', () => {
    test.describe.configure({ mode: 'serial' });

    const testEmail = 'pamy@mailinator.com';
    const password = 'Password123!';

    test.beforeEach(async ({ page }) => {
        await login(page, testEmail, password);
    });

    test('should update profile information', async ({ page }) => {
        await page.goto('/me');
        await page.waitForTimeout(1000);

        const newFirstName = 'Updated' + Math.random().toString(36).substring(7);
        const firstNameInput = page.locator('#firstName');

        await firstNameInput.fill(newFirstName);
        await page.getByRole('button', { name: /Save Changes/i }).click();

        // Wait for success message or page update
        await page.waitForTimeout(2000);

        // Check for success message or verify the value persisted
        const successVisible = await page.getByText(/Profile updated successfully/i).isVisible().catch(() => false);
        const successInAlert = await page.getByText(/updated/i).isVisible().catch(() => false);

        expect(successVisible || successInAlert).toBeTruthy();

        // Refresh and verify persistence
        await page.reload();
        await page.waitForTimeout(1000);
        await expect(firstNameInput).toHaveValue(newFirstName);
    });
});
