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
    let googleLoading = $state(false);

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

    async function handleGoogleLogin() {
        googleLoading = true;
        error = false;

        try {
            const google = (window as any).google;
            if (!google) {
                throw new Error(
                    "Google Identity Services not loaded. Please refresh the page.",
                );
            }

            const clientId = env.PUBLIC_GOOGLE_CLIENT_ID?.replace(
                /^"|"$/g,
                "",
            ).trim();

            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCallback,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    // If One Tap is not displayed, we should probably tell the user or try another way
                    errorMessage = {
                        general: [
                            "Google Sign-In prompt was blocked or not available. Please try again or check your browser settings.",
                        ],
                    };
                    error = true;
                    googleLoading = false;
                } else if (notification.isSkippedMoment()) {
                    googleLoading = false;
                } else if (notification.isDismissedMoment()) {
                    googleLoading = false;
                }
            });
        } catch (e: any) {
            errorMessage = { general: [e.message || "Google login failed"] };
            error = true;
            googleLoading = false;
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
                body: JSON.stringify({
                    token: response.credential,
                    intent: "login",
                }),
            });

            if (res.ok) {
                const responseBody = await res.json();
                // The API returns { success: true, data: { access_token, user } }
                const payload = responseBody.data;

                if (payload && payload.access_token && payload.user) {
                    localStorage.setItem("poi_access", payload.access_token);
                    userState.me = payload.user;
                    goto(
                        payload.user.role === "ADMIN"
                            ? "/admin"
                            : "/categories",
                    );
                } else {
                    throw new Error("Missing token or user data in response");
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                errorMessage = errorData.errors || {
                    general: [
                        errorData.message || "Google authentication failed",
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
        script.onerror = () => {
            errorMessage = {
                general: [
                    "Failed to load Google Sign-In. Check your internet connection or browser settings.",
                ],
            };
            error = true;
        };
        script.onload = () => {
            try {
                const google = (window as any).google;

                if (!env.PUBLIC_GOOGLE_CLIENT_ID) {
                    errorMessage = {
                        general: [
                            "Frontend configuration error: Missing Google Client ID.",
                        ],
                    };
                    error = true;
                    return;
                }

                const clientId = env.PUBLIC_GOOGLE_CLIENT_ID?.replace(
                    /^"|"$/g,
                    "",
                ).trim();
                if (google) {
                    google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleCallback,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    // Render the official Google button
                    const googleBtnElement =
                        document.getElementById("googleBtn");
                    if (googleBtnElement) {
                        google.accounts.id.renderButton(googleBtnElement, {
                            theme: "outline",
                            size: "large",
                            text: "signin_with",
                            shape: "rectangular",
                            width: 350,
                        });
                    }

                    // Also try One Tap prompt
                    google.accounts.id.prompt((notification: any) => {
                        if (
                            notification.isNotDisplayed() &&
                            notification.getNotDisplayedReason() ===
                                "opt_out_or_no_session"
                        ) {
                            // This is normal if user has opted out or isn't logged into Google
                        }
                    });
                }
            } catch (err: any) {
                errorMessage = {
                    general: [
                        "Google Login initialization failed. Please check console for details.",
                    ],
                };
                error = true;
            }
        };
        document.head.appendChild(script);
    });
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
                            <Button variant="outline" class="w-full" disabled>
                                Loading Google Auth...
                            </Button>
                        {/if}
                    </div>
                    <FieldDescription class="text-center">
                        Don't have an account? <a href="/register">Register</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    </Card.Content>
</Card.Root>
