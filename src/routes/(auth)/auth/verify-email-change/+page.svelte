<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { env } from "$env/dynamic/public";
    import { goto } from "$app/navigation";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Loader2Icon, CheckCircleIcon, XCircleIcon } from "@lucide/svelte";

    let status = $state<"loading" | "success" | "error">("loading");
    let message = $state("Verifying your new email address...");

    onMount(async () => {
        const token = page.url.searchParams.get("token");

        if (!token) {
            status = "error";
            message = "No verification token found.";
            return;
        }

        try {
            const response = await fetch(
                `${env.PUBLIC_API_URL}/auth/verify-email-change`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                },
            );

            const res = await response.json();

            if (response.ok) {
                status = "success";
                message = "Your email has been successfully verified!";
            } else {
                status = "error";
                message = res.message || "Email verification failed.";
            }
        } catch (err) {
            status = "error";
            message = "Unable to connect to the server.";
        }
    });
</script>

<div class="flex items-center justify-center min-h-[60vh]">
    <Card.Root class="w-full max-w-md">
        <Card.Header class="text-center">
            <Card.Title class="text-2xl">Email Verification</Card.Title>
            <Card.Description>Confirming your email change</Card.Description>
        </Card.Header>
        <Card.Content
            class="flex flex-col items-center justify-center py-8 space-y-4"
        >
            {#if status === "loading"}
                <Loader2Icon class="w-12 h-12 animate-spin text-primary" />
            {:else if status === "success"}
                <CheckCircleIcon class="w-12 h-12 text-green-500" />
            {:else}
                <XCircleIcon class="w-12 h-12 text-destructive" />
            {/if}

            <p class="text-center font-medium">{message}</p>
        </Card.Content>
        <Card.Footer class="flex justify-center border-t pt-6">
            {#if status === "success"}
                <div class="flex flex-col items-center space-y-4 w-full">
                    <p class="text-sm text-muted-foreground text-center">
                        Please log in again with your new email address.
                    </p>
                    <Button
                        class="w-full"
                        onclick={() => {
                            localStorage.removeItem("poi_access");
                            goto("/login");
                        }}
                    >
                        Go to Login
                    </Button>
                </div>
            {:else if status === "error"}
                <Button
                    variant="outline"
                    class="w-full"
                    onclick={() => goto("/me")}
                >
                    Back to Profile
                </Button>
            {/if}
        </Card.Footer>
    </Card.Root>
</div>
