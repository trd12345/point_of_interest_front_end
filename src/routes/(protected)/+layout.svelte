<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { userState } from "$lib/user-state.svelte";

    let { children } = $props();

    onMount(() => {
        const access_token = localStorage.getItem("poi_access");
        if (!access_token) {
            goto("/login");
        }
    });
</script>

<div class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        {@render children()}
    </div>
</div>
