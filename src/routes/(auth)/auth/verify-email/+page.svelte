<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { env } from "$env/dynamic/public";
    import { goto } from "$app/navigation";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";

    let status = $state<"loading" | "success" | "error">("loading");
    let message = $state("");
    let countdown = $state(3);

    async function verifyEmail() {
        const token = page.url.searchParams.get("token");

        if (!token) {
            status = "error";
            message = "Verification token is missing.";
            return;
        }

        try {
            const response = await fetch(
                `${env.PUBLIC_API_URL}/auth/verify-email?token=${token}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const res = await response.json();

            if (response.ok) {
                status = "success";
                message =
                    res.message || "Your email has been successfully verified!";
                startRedirectTimer();
            } else {
                status = "error";
                message =
                    res.message ||
                    "Failed to verify email. The link may be invalid or expired.";
            }
        } catch (error) {
            console.error(error);
            status = "error";
            message = "An unexpected error occurred. Please try again later.";
        }
    }

    function startRedirectTimer() {
        const interval = setInterval(() => {
            countdown -= 1;
            if (countdown <= 0) {
                clearInterval(interval);
                goto("/login");
            }
        }, 800); // 2.5s total approx (3 * 800ms = 2.4s)
    }

    onMount(() => {
        verifyEmail();
    });
</script>

<Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
        <Card.Title class="text-2xl">Email Verification</Card.Title>
        <Card.Description>
            {#if status === "loading"}
                Verifying your email address...
            {:else if status === "success"}
                Verification successful!
            {:else}
                Verification failed.
            {/if}
        </Card.Description>
    </Card.Header>
    <Card.Content
        class="flex flex-col items-center justify-center py-6 text-center"
    >
        {#if status === "loading"}
            <div class="flex items-center justify-center space-x-2">
                <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                ></div>
                <span>Checking token...</span>
            </div>
        {:else if status === "success"}
            <div class="mb-4 rounded-full bg-green-100 p-3 text-green-600">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-8 w-8"><path d="M20 6 9 17l-5-5" /></svg
                >
            </div>
            <p class="mb-4">{message}</p>
            <p class="text-sm text-muted-foreground italic">
                Redirecting to login in {countdown}s...
            </p>
            <Button variant="link" onclick={() => goto("/login")} class="mt-4">
                Click here if you are not redirected
            </Button>
        {:else}
            <div class="mb-4 rounded-full bg-red-100 p-3 text-red-600">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-8 w-8"
                    ><circle cx="12" cy="12" r="10" /><line
                        x1="12"
                        x2="12"
                        y1="8"
                        y2="12"
                    /><line x1="12" x2="12.01" y1="16" y2="16" /></svg
                >
            </div>
            <p class="mb-4 text-red-500">{message}</p>
            <Button
                variant="outline"
                onclick={() => goto("/register")}
                class="w-full"
            >
                Back to Registration
            </Button>
        {/if}
    </Card.Content>
</Card.Root>
