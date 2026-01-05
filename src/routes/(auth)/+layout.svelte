<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { userState } from "$lib/user-state.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    import { page } from "$app/state";

    let { children } = $props();

    $effect(() => {
        // Redirection logic for authenticated users
        if (userState.restored && userState.me) {
            let target =
                userState.me.role === "ADMIN" ? "/admin" : "/categories";

            // If coming from register page (e.g. Google Auth), go to profile/me
            if (
                page.url.pathname === "/register" &&
                userState.me.role !== "ADMIN"
            ) {
                target = "/me";
            }

            goto(target);
        }
    });
</script>

{#if userState.restored && !userState.me}
    <div
        class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
        <div class="flex w-full max-w-sm flex-col gap-6">
            {@render children()}
        </div>
    </div>
{:else}
    <!-- Loading state or transition to redirect -->
    <div class="min-h-svh flex items-center justify-center">
        <div class="animate-pulse flex flex-col items-center">
            <div class="size-12 bg-zinc-200 rounded-full mb-4"></div>
            <div class="h-4 w-24 bg-zinc-200 rounded"></div>
        </div>
    </div>
{/if}
