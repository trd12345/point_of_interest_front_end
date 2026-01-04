<script lang="ts">
    import { onMount } from "svelte";
    import "./layout.css";
    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import { page } from "$app/state";
    import { userState } from "$lib/user-state.svelte";
    let { children } = $props();
    let favicon = $derived("/favicon.ico");

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
