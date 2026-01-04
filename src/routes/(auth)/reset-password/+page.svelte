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
                <span class="sr-only">Info</span>
                <div>
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
