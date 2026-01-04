<script lang="ts">
    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import {
        FieldGroup,
        Field,
        FieldLabel,
        FieldDescription,
    } from "$lib/components/ui/field/index.js";
    import { userState } from "$lib/user-state.svelte";
    import { page } from "$app/state";

    let error = $state(false);
    let errorMessage = $state<Record<string, string[]>>({});
    let email = $state("");
    let password = $state("");

    let registered = $derived(
        page.url.searchParams.get("registered") === "true",
    );

    async function login(e: Event) {
        e.preventDefault();
        try {
            const response = await fetch(`${env.PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const res = await response.json();

            if (response.ok) {
                console.log(
                    "Login successful, updating user state and redirecting...",
                );
                localStorage.setItem("poi_access", res.data.access_token);
                userState.me = res.data.user;
                goto(res.data.user.role === "ADMIN" ? "/admin" : "/categories");
            } else {
                errorMessage = res.errors || {
                    general: [res.message || "Login failed"],
                };
                error = true;
            }
        } catch (e) {
            error = true;
        }
    }
</script>

{#if registered && !error}
    <div
        class="flex items-start sm:items-center p-4 mb-4 text-sm rounded-lg bg-green-100 text-green-800"
        role="alert"
    >
        <svg
            class="w-4 h-4 me-2 shrink-0 mt-0.5 sm:mt-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            ><path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
            /></svg
        >
        <p>
            <span class="font-medium me-1">Success!</span>
            Registration was successful. Please verify your email first.
        </p>
    </div>
{/if}

{#if error}
    <div
        class="flex items-start sm:items-center p-4 mb-4 text-sm rounded-lg bg-amber-100"
        role="alert"
    >
        <svg
            class="w-4 h-4 me-2 shrink-0 mt-0.5 sm:mt-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            ><path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            /></svg
        >
        <p class="flex flex-col ml-2">
            <span class="font-medium me-1">Warning alert!</span>
            {#each errorMessage.general as message}
                <span>{message}</span>
            {/each}
        </p>
    </div>
{/if}
<Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
        <Card.Title class="text-2xl">Login</Card.Title>
        <Card.Description
            >Enter your email below to login to your account</Card.Description
        >
    </Card.Header>
    <Card.Content>
        <form onsubmit={login}>
            <FieldGroup>
                <Field>
                    <FieldLabel for="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        bind:value={email}
                    />
                </Field>
                <Field>
                    <div class="flex items-center">
                        <FieldLabel for="password">Password</FieldLabel>
                        <a
                            href="/forgot-password"
                            class="ms-auto inline-block text-sm underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        bind:value={password}
                    />
                </Field>
                <Field>
                    <Button type="submit" class="w-full">Login</Button>
                    <Button variant="outline" class="w-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                        Login with Google
                    </Button>
                    <FieldDescription class="text-center">
                        Don't have an account? <a href="/register">Register</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    </Card.Content>
</Card.Root>
