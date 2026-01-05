import { test, expect } from '@playwright/test';
import { getLatestEmail, extractTokenFromEmail } from './helpers';
import { env } from '$env/dynamic/public';

test.describe('Authentication Flow', () => {
    test.describe.configure({ mode: 'serial' });

    const randomSuffix = Math.random().toString(36).substring(7);
    const testEmail = `test-${randomSuffix}@example.com`;
    const password = 'Password123!';
    let testUserId: string | null = null;

    // Cleanup function to delete test user
    async function cleanupTestUser() {
        if (!testUserId) return;

        try {
            // Login as admin to get token
            const loginRes = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@demo.com', password: 'Password123!' })
            });

            if (loginRes.ok) {
                const loginData = await loginRes.json();
                const adminToken = loginData.data.access_token;

                // Delete the test user
                await fetch(`http://localhost:3000/admin/users/${testUserId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });

                console.log(`Cleaned up test user: ${testEmail}`);
            }
        } catch (error) {
            console.error('Failed to cleanup test user:', error);
        }
    }

    test.afterAll(async () => {
        await cleanupTestUser();
    });

    test('should register and verify email', async ({ page }) => {
        await page.goto('/register');

        await page.fill('#first_name', 'Test');
        await page.fill('#last_name', 'User');
        await page.fill('#email', testEmail);
        await page.fill('#password', password);
        await page.fill('#confirm-password', password);

        await page.getByRole('button', { name: 'Create Account', exact: true }).click();

        // Should redirect to login with success message
        await expect(page).toHaveURL(/.*login.*registered=true/, { timeout: 15000 });
        await expect(page.getByRole('alert')).toContainText(/Registration was successful/i, { timeout: 10000 });

        // Wait for and fetch verification email from Mailhog
        let token: string | null = null;
        for (let i = 0; i < 15; i++) {
            const email = await getLatestEmail(testEmail);
            if (email) {
                token = extractTokenFromEmail(email.Content.Body);
                break;
            }
            await page.waitForTimeout(1000);
        }

        expect(token, 'Should find verification token in Mailhog').toBeTruthy();

        // Verify email by visiting the link
        await page.goto(`/auth/verify-email?token=${token}`);
        await expect(page.getByText(/Verification successful/i)).toBeVisible({ timeout: 15000 });

        // Redirects to login
        await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

        // Get user ID for cleanup
        try {
            const loginRes = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail, password })
            });

            if (loginRes.ok) {
                const data = await loginRes.json();
                testUserId = data.data.user.id;
            }
        } catch (error) {
            console.error('Failed to get user ID:', error);
        }
    });

    test('should login successfully', async ({ page }) => {
        await page.goto('/login');

        await page.fill('#email', testEmail);
        await page.fill('#password', password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Should redirect to categories dashboard
        await expect(page).toHaveURL(/.*categories/, { timeout: 15000 });

        // Check if user state is reflected (more flexible locator)
        await expect(page.getByText(/Test/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should show error on wrong password', async ({ page }) => {
        await page.goto('/login');

        await page.fill('#email', testEmail);
        await page.fill('#password', 'WrongPassword123!');
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // The alert should eventually contain some error message
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });
        await expect(alert).toContainText(/failed|invalid|credentials/i);
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('#email', testEmail);
        await page.fill('#password', password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await expect(page).toHaveURL(/.*categories/, { timeout: 15000 });

        // Click logout in the Nav
        const userMenuTrigger = page.getByRole('button', { name: /Test/i });
        if (await userMenuTrigger.count() > 0) {
            await userMenuTrigger.first().click();
            await page.getByText(/Log out/i).click();
        } else {
            await page.getByRole('button', { name: /Logout/i }).click();
        }

        await expect(page).toHaveURL('/', { timeout: 15000 });
    });
});
