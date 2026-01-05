<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { env } from "$env/dynamic/public";
    import { goto } from "$app/navigation";
    import { onMount, type ComponentProps } from "svelte";
    import { deserialize } from "$app/forms";
    import { userState } from "$lib/user-state.svelte";

    let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

    let first_name = $state("");
    let last_name = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    let error = $state(false);
    let errorMessage = $state<Record<string, string[]>>({});
    let loading = $state(false);
    let googleLoading = $state(false);

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
            if (response.ok) {
                goto("/login?registered=true");
            } else {
                error = true;
                errorMessage = res.errors || {
                    general: [res.message || "An error occurred"],
                };
            }
        } catch (err) {
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

    async function handleGoogleCallback(response: any) {
        googleLoading = true;

        try {
            const res = await fetch(`${env.PUBLIC_API_URL}/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: response.credential }),
            });

            if (res.ok) {
                const responseBody = await res.json(); // Renamed for clarity

                // FIX: Access the nested 'data' object
                const payload = responseBody.data;

                // Check if payload exists before checking its properties
                if (payload && payload.access_token && payload.user) {
                    localStorage.setItem("poi_access", payload.access_token);
                    userState.me = payload.user;
                    goto("/me");
                } else {
                    throw new Error("Missing token or user data in response");
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                errorMessage = errorData.errors || {
                    general: [
                        errorData.message || "Google registration failed",
                    ],
                };
                error = true;
            }
        } catch (e: any) {
            errorMessage = { general: [e.message || "Authentication failed"] };
            error = true;
        } finally {
            googleLoading = false;
        }
    }

    onMount(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onerror = () => {};
        script.onload = () => {
            try {
                const google = (window as any).google;
                const clientId = env.PUBLIC_GOOGLE_CLIENT_ID?.replace(
                    /^"|"$/g,
                    "",
                ).trim();

                if (google && clientId) {
                    google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleCallback,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    const googleBtnElement =
                        document.getElementById("googleBtn");
                    if (googleBtnElement) {
                        google.accounts.id.renderButton(googleBtnElement, {
                            theme: "outline",
                            size: "large",
                            text: "signup_with",
                            shape: "rectangular",
                            width: 350,
                        });
                    }
                }
            } catch (err: any) {}
        };
        document.head.appendChild(script);
    });
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

                        <div class="relative my-4">
                            <div class="absolute inset-0 flex items-center">
                                <span class="w-full border-t"></span>
                            </div>
                            <div
                                class="relative flex justify-center text-xs uppercase"
                            >
                                <span
                                    class="bg-background px-2 text-muted-foreground"
                                    >Or continue with</span
                                >
                            </div>
                        </div>

                        <div
                            id="googleBtn"
                            class="w-full flex justify-center min-h-[40px]"
                        >
                            {#if googleLoading}
                                <Button
                                    variant="outline"
                                    class="w-full"
                                    disabled
                                >
                                    Loading Google Auth...
                                </Button>
                            {/if}
                        </div>
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
