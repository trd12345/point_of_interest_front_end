<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import {
        FieldGroup,
        Field,
        FieldLabel,
        FieldError,
    } from "$lib/components/ui/field/index.js";
    import { env } from "$env/dynamic/public";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    let password = $state("");
    let confirmPassword = $state("");
    let loading = $state(false);
    let success = $state(false);
    let errorMessage = $state<Record<string, string[]>>({});
    let countdown = $state(3);

    const token = $derived(page.url.searchParams.get("token"));
    const id = $props.id();

    async function handleResetPassword(e: Event) {
        e.preventDefault();

        if (!token) {
            errorMessage = { token: ["Reset token is missing from the URL."] };
            return;
        }

        if (password !== confirmPassword) {
            errorMessage = { confirmPassword: ["Passwords do not match."] };
            return;
        }

        loading = true;
        errorMessage = {};

        try {
            const response = await fetch(
                `${env.PUBLIC_API_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token, password }),
                },
            );

            const res = await response.json();

            if (response.ok) {
                success = true;
                startRedirectTimer();
            } else {
                errorMessage = res.errors || {
                    general: [res.message || "Failed to reset password."],
                };
            }
        } catch (error) {
            errorMessage = {
                general: [
                    "Unable to connect to the server. Please try again later.",
                ],
            };
        } finally {
            loading = false;
        }
    }

    function startRedirectTimer() {
        const interval = setInterval(() => {
            countdown -= 1;
            if (countdown <= 0) {
                clearInterval(interval);
                goto("/login");
            }
        }, 800);
    }
</script>

<Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
        <Card.Title class="text-2xl">Reset Password</Card.Title>
        <Card.Description>Enter your new password below.</Card.Description>
    </Card.Header>
    <Card.Content>
        {#if success}
            <div
                class="flex p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
                role="alert"
            >
                <svg
                    class="flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                    />
                </svg>
                <span class="sr-only">Info</span>
                <div>
                    <span class="font-medium">Success!</span> Password reset
                    successfully.
                    <p class="text-xs mt-1 italic">
                        Redirecting to login in {countdown}s...
                    </p>
                </div>
            </div>
        {/if}

        {#if errorMessage.general || errorMessage.token}
            <div
                class="flex p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                role="alert"
            >
                <svg
                    class="flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                    />
                </svg>
                <div class="flex-1">
                    {#if errorMessage.general?.includes("GOOGLE_ACCOUNT_ERROR")}
                        <span class="font-medium">Google Account Detected</span>
                        <p class="mt-1">
                            This account uses Google Sign-In. You don't have a
                            separate password to reset.
                        </p>
                        <div class="mt-4">
                            <Button
                                variant="outline"
                                class="w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                                href="/login"
                            >
                                <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    {:else}
                        <span class="font-medium">Error!</span>
                        <ul class="mt-1.5 list-disc list-inside">
                            {#if errorMessage.token}
                                {#each errorMessage.token as msg}
                                    <li>{msg}</li>
                                {/each}
                            {/if}
                            {#if errorMessage.general}
                                {#each errorMessage.general as msg}
                                    <li>{msg}</li>
                                {/each}
                            {/if}
                        </ul>
                    {/if}
                </div>
            </div>
        {/if}

        <form onsubmit={handleResetPassword}>
            <FieldGroup>
                <Field>
                    <FieldLabel for="password-{id}">New Password</FieldLabel>
                    <Input
                        id="password-{id}"
                        type="password"
                        bind:value={password}
                        required
                    />
                    {#if errorMessage.password}
                        {#each errorMessage.password as msg}
                            <FieldError>{msg}</FieldError>
                        {/each}
                    {/if}
                </Field>
                <Field>
                    <FieldLabel for="confirm-password-{id}"
                        >Confirm Password</FieldLabel
                    >
                    <Input
                        id="confirm-password-{id}"
                        type="password"
                        bind:value={confirmPassword}
                        required
                    />
                    {#if errorMessage.confirmPassword}
                        {#each errorMessage.confirmPassword as msg}
                            <FieldError>{msg}</FieldError>
                        {/each}
                    {/if}
                </Field>
                <Field>
                    <Button
                        type="submit"
                        class="w-full"
                        disabled={loading || !token}
                    >
                        {#if loading}
                            Reseting...
                        {:else}
                            Reset Password
                        {/if}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    </Card.Content>
</Card.Root>
