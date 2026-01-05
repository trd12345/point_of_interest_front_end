import { expect } from '@playwright/test';

export async function getLatestEmail(email: string) {
    const response = await fetch('http://localhost:8025/api/v2/messages');
    const data = await response.json();
    return data.items.find((msg: any) => msg.To[0].Mailbox === email.split('@')[0]);
}

export function extractTokenFromEmail(emailBody: string) {
    const cleanBody = emailBody
        .replace(/=\r\n/g, '')
        .replace(/=3D/g, '=');

    const match = cleanBody.match(/token=([^"<\s&]+)/);
    return match ? match[1] : null;
}

export async function login(page: any, email: string, password: string) {
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
        }
    });

    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    try {
        await page.waitForURL(/.*categories|admin/, { timeout: 10000 });
    } catch (e) {
        // If it failed to redirect, check if there's an error message
        const errorAlert = page.getByRole('alert');
        if (await errorAlert.isVisible()) {
            const msg = await errorAlert.innerText();
            throw new Error(`Login failed for ${email}: ${msg}`);
        }
        throw e;
    }
}
