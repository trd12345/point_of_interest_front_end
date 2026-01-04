<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { userState } from "$lib/user-state.svelte";

    let { children } = $props();

    $effect(() => {
        if (userState.restored && !userState.me) {
            console.log(
                "[Protected Guard] No authenticated user found, redirecting to /login",
            );
            goto("/login");
        }
    });
</script>

<div class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        {@render children()}
    </div>
</div>
