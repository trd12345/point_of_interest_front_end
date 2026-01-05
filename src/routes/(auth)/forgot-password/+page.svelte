<script lang="ts">
    import { onMount } from "svelte";
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

    let email = $state("");
    let loading = $state(false);
    let success = $state(false);
    let errorMessage = $state<Record<string, string[]>>({});
    let cooldown = $state(0);
    const id = $props.id();

    let timer: ReturnType<typeof setInterval>;

    function startCooldown(seconds: number) {
        cooldown = seconds;
        localStorage.setItem(
            "forgot_password_cooldown",
            (Date.now() + seconds * 1000).toString(),
        );

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            cooldown -= 1;
            if (cooldown <= 0) {
                clearInterval(timer);
                localStorage.removeItem("forgot_password_cooldown");
            }
        }, 1000);
    }

    onMount(() => {
        const stored = localStorage.getItem("forgot_password_cooldown");
        if (stored) {
            const remaining = Math.ceil((parseInt(stored) - Date.now()) / 1000);
            if (remaining > 0) {
                startCooldown(remaining);
            } else {
                localStorage.removeItem("forgot_password_cooldown");
            }
        }
    });

    async function handleForgotPassword(e: Event) {
        e.preventDefault();
        if (cooldown > 0) return;

        loading = true;
        success = false;
        errorMessage = {};

        try {
            const response = await fetch(
                `${env.PUBLIC_API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                },
            );

            const res = await response.json();

            if (response.ok) {
                success = true;
                startCooldown(60);
            } else {
                errorMessage = res.errors || {
                    general: [res.message || "Failed to send reset link."],
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
</script>

<Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
        <Card.Title class="text-2xl">Forgot Password</Card.Title>
        <Card.Description>
            Enter your email below to reset your password
        </Card.Description>
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
                    <span class="font-medium">Success!</span> Check your email for
                    a password reset link.
                </div>
            </div>
        {/if}

        {#if errorMessage.general}
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
                    {#if errorMessage.general.includes("GOOGLE_ACCOUNT_ERROR")}
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
                            {#each errorMessage.general as msg}
                                <li>{msg}</li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>
        {/if}

        <form onsubmit={handleForgotPassword}>
            <FieldGroup>
                <Field>
                    <FieldLabel for="email-{id}">Email</FieldLabel>
                    <Input
                        id="email-{id}"
                        type="email"
                        placeholder="m@example.com"
                        bind:value={email}
                        required
                    />
                    {#if errorMessage.email}
                        {#each errorMessage.email as msg}
                            <FieldError>{msg}</FieldError>
                        {/each}
                    {/if}
                </Field>
                <Field>
                    <Button
                        type="submit"
                        class="w-full"
                        disabled={loading || cooldown > 0}
                    >
                        {#if loading}
                            Sending...
                        {:else if cooldown > 0}
                            Resend in {cooldown}s
                        {:else}
                            Reset Password
                        {/if}
                    </Button>
                    <Button variant="link" class="w-full text-sm" href="/login">
                        Back to Login
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    </Card.Content>
</Card.Root>
