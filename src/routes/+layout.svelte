<script lang="ts">
    import { onMount } from "svelte";
    import "./layout.css";
    import { env } from "$env/dynamic/public";
    import { userState } from "$lib/user-state.svelte";
    import SiteNavigation from "$lib/components/site-navigation.svelte";

    let { children } = $props();

    async function restoreSession() {
        console.log("Restoring session...");
        const access_token = localStorage.getItem("poi_access");

        if (!access_token) {
            console.log("No token found");
            userState.loading = false;
            userState.restored = true;
            return;
        }

        try {
            const response = await fetch(`${env.PUBLIC_API_URL}/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                userState.me = result.data.user;
                console.log("Session restored for:", userState.me?.email);
            } else {
                console.warn("Session token invalid");
                localStorage.removeItem("poi_access");
                userState.me = null;
            }
        } catch (error) {
            console.error("Failed to restore session:", error);
        } finally {
            userState.loading = false;
            userState.restored = true;
        }
    }

    onMount(async () => {
        await restoreSession();
    });

    let favicon = $derived("/favicon.ico");
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-background flex flex-col">
    <SiteNavigation />
    <main class="flex-1 mt-16 p-4">
        {@render children()}
    </main>
</div>
