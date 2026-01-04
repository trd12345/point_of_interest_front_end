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
            console.error(error);
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
                <span class="sr-only">Info</span>
                <div>
                    <span class="font-medium">Error!</span>
                    <ul class="mt-1.5 list-disc list-inside">
                        {#each errorMessage.general as msg}
                            <li>{msg}</li>
                        {/each}
                    </ul>
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
