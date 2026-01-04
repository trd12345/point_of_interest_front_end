<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { env } from "$env/dynamic/public";
    import { goto } from "$app/navigation";
    import type { ComponentProps } from "svelte";

    let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

    let first_name = $state("");
    let last_name = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    let error = $state(false);
    let errorMessage = $state<Record<string, string[]>>({});
    let loading = $state(false);

    async function handleRegister(e: Event) {
        e.preventDefault();
        error = false;
        errorMessage = {};

        if (password !== confirmPassword) {
            error = true;
            errorMessage = { confirmPassword: ["Passwords do not match"] };
            return;
        }

        loading = true;

        try {
            const response = await fetch(
                `${env.PUBLIC_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        first_name,
                        last_name,
                        email,
                        password,
                    }),
                },
            );

            const res = await response.json();
            console.log(res);
            if (response.ok) {
                goto("/login?registered=true");
            } else {
                error = true;
                errorMessage = res.errors || {
                    general: [res.message || "An error occurred"],
                };
            }
        } catch (err) {
            console.error(err);
            error = true;
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

<Card.Root {...restProps}>
    <Card.Header>
        <Card.Title>Create an account</Card.Title>
        <Card.Description>
            Enter your information below to create your account
        </Card.Description>
    </Card.Header>
    <Card.Content>
        {#if error && errorMessage.general}
            <div
                class="flex items-start p-4 mb-4 text-sm rounded-lg bg-amber-100 text-amber-800"
                role="alert"
            >
                <svg
                    class="w-4 h-4 me-2 shrink-0 mt-0.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                </svg>
                <div>
                    <span class="font-medium">Registration failed:</span>
                    <ul class="mt-1.5 list-disc list-inside">
                        {#each errorMessage.general as message}
                            <li>{message}</li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}

        <form onsubmit={handleRegister}>
            <Field.Group>
                <div class="grid grid-cols-2 gap-4">
                    <Field.Field>
                        <Field.Label for="first_name">First Name</Field.Label>
                        <Input
                            id="first_name"
                            type="text"
                            placeholder="John"
                            required
                            bind:value={first_name}
                        />
                        {#if errorMessage.first_name}
                            <p class="text-xs text-red-500 mt-1">
                                {errorMessage.first_name[0]}
                            </p>
                        {/if}
                    </Field.Field>
                    <Field.Field>
                        <Field.Label for="last_name">Last Name</Field.Label>
                        <Input
                            id="last_name"
                            type="text"
                            placeholder="Doe"
                            required
                            bind:value={last_name}
                        />
                        {#if errorMessage.last_name}
                            <p class="text-xs text-red-500 mt-1">
                                {errorMessage.last_name[0]}
                            </p>
                        {/if}
                    </Field.Field>
                </div>
                <Field.Field>
                    <Field.Label for="email">Email</Field.Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        bind:value={email}
                    />
                    {#if errorMessage.email}
                        <p class="text-xs text-red-500 mt-1">
                            {errorMessage.email[0]}
                        </p>
                    {/if}
                    <Field.Description>
                        We'll use this to contact you. We will not share your
                        email with anyone else.
                    </Field.Description>
                </Field.Field>
                <Field.Field>
                    <Field.Label for="password">Password</Field.Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        bind:value={password}
                    />
                    {#if errorMessage.password}
                        <p class="text-xs text-red-500 mt-1">
                            {errorMessage.password[0]}
                        </p>
                    {/if}
                    <Field.Description>
                        Must be at least 8 characters long and include
                        uppercase, lowercase, number, and special character.
                    </Field.Description>
                </Field.Field>
                <Field.Field>
                    <Field.Label for="confirm-password"
                        >Confirm Password</Field.Label
                    >
                    <Input
                        id="confirm-password"
                        type="password"
                        required
                        bind:value={confirmPassword}
                    />
                    {#if errorMessage.confirmPassword}
                        <p class="text-xs text-red-500 mt-1">
                            {errorMessage.confirmPassword[0]}
                        </p>
                    {/if}
                    <Field.Description>
                        Please confirm your password.
                    </Field.Description>
                </Field.Field>
                <Field.Group>
                    <Field.Field>
                        <Button type="submit" class="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                        <Button variant="outline" type="button" class="w-full">
                            <svg
                                class="mr-2 h-4 w-4"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fab"
                                data-icon="google"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 488 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                ></path>
                            </svg>
                            Sign up with Google
                        </Button>
                        <Field.Description class="px-6 text-center">
                            Already have an account? <a
                                href="/login"
                                class="underline">Log in</a
                            >
                        </Field.Description>
                    </Field.Field>
                </Field.Group>
            </Field.Group>
        </form>
    </Card.Content>
</Card.Root>
