import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Placemark Management', () => {
    test.describe.configure({ mode: 'serial' });

    const testEmail = 'pamy@mailinator.com';
    const password = 'Password123!';
    const spotName = 'Dreamy Garden';

    test.beforeEach(async ({ page }) => {
        await login(page, testEmail, password);
    });

    test('should create a new placemark', async ({ page }) => {
        await page.goto('/placemarks/new');

        // Wait for categories to load (loading spinner to disappear)
        await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(1000);

        // Fill in the form with specific data
        await page.fill('#name', spotName);
        await page.fill('#description', 'test');

        // Select "Apartment" category - use the correct ID
        await page.selectOption('#category', { label: 'Apartment' });

        await page.fill('#street', 'Furtmayrstraße');
        await page.fill('#house_number', '22');
        await page.fill('#zip', '93053');
        await page.fill('#city', 'Regensburg');
        await page.fill('#country', 'Germany');

        await page.getByRole('button', { name: /Create Spot|Save/i }).click();

        // Wait for redirect to placemarks page
        await page.waitForURL(/\/placemarks/, { timeout: 15000 });
        await page.waitForTimeout(2000);

        // Check if spot appears
        const spotVisible = await page.getByText(spotName).isVisible().catch(() => false);
        expect(spotVisible).toBeTruthy();
    });

    test('should search for the created spot', async ({ page }) => {
        await page.goto('/placemarks');
        await page.waitForTimeout(1000);

        // Search for city "Regensburg"
        const searchInput = page.getByPlaceholder(/Search/i);
        if (await searchInput.isVisible()) {
            await searchInput.fill('Regensburg');
            await page.waitForTimeout(1000);

            // Should show the Dreamy Garden spot
            await expect(page.getByText(spotName)).toBeVisible({ timeout: 10000 });
        }
    });

    test('should verify address privacy logic', async ({ page }) => {
        // As owner, should see full address
        await page.goto('/placemarks');
        await page.waitForTimeout(1000);

        const spotCard = page.locator('.placemark-card', { hasText: spotName }).first();
        if (await spotCard.isVisible()) {
            await spotCard.click();
            await page.waitForTimeout(1000);

            // Owner should see street address "Furtmayrstraße"
            const addressVisible = await page.getByText(/Furtmayrstraße/i).isVisible().catch(() => false);
            expect(addressVisible).toBeTruthy();
        }
    });
});
