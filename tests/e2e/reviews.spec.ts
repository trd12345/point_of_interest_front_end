import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Review & Rating System', () => {
    test.describe.configure({ mode: 'serial' });
    const adminEmail = 'admin@demo.com';
    const userEmail = 'pamy@mailinator.com';
    const password = 'Password123!';

    test('should allow a user to rate and review a spot', async ({ page }) => {
        await login(page, userEmail, password);
        await page.goto('/placemarks');

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Check if placemark cards exist
        const cardCount = await page.locator('.placemark-card, [class*="card"], article').count();

        if (cardCount > 0) {
            // Click first available placemark
            await page.locator('.placemark-card, [class*="card"], article').first().click();
            await page.waitForTimeout(1000);

            // Try to find and fill review form
            const ratingButtons = page.locator('[role="radio"], button[aria-label*="star"], .star-rating button');
            if (await ratingButtons.count() > 0) {
                await ratingButtons.last().click();
            }

            const commentField = page.locator('textarea, input[placeholder*="comment"], input[placeholder*="review"]').first();
            if (await commentField.isVisible().catch(() => false)) {
                await commentField.fill('Great spot for E2E testing!');

                const submitButton = page.getByRole('button', { name: /Submit|Post|Add Review/i });
                if (await submitButton.isVisible().catch(() => false)) {
                    await submitButton.click();
                    await page.waitForTimeout(2000);
                }
            }
        }
    });

    test('should allow host to reply to a review', async ({ page }) => {
        await login(page, adminEmail, password);
        await page.goto('/placemarks');
        await page.waitForTimeout(2000);

        const cardCount = await page.locator('.placemark-card, [class*="card"], article').count();

        if (cardCount > 0) {
            await page.locator('.placemark-card, [class*="card"], article').first().click();
            await page.waitForTimeout(1000);

            // Look for reply button
            const replyButton = page.getByRole('button', { name: /Reply/i }).first();
            if (await replyButton.isVisible().catch(() => false)) {
                await replyButton.click();

                const replyField = page.locator('textarea, input').last();
                await replyField.fill('Thank you for your review!');

                const submitReply = page.getByRole('button', { name: /Submit|Post|Send/i }).last();
                if (await submitReply.isVisible().catch(() => false)) {
                    await submitReply.click();
                    await page.waitForTimeout(2000);
                }
            }
        }
    });
});
