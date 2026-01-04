<script lang="ts">
    import {env} from "$env/dynamic/public";
    import {userState} from "$lib/user-state.svelte";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";

    let { children } = $props();
    let checkingSession = $state(true);

    async function stayLoggedIn() {
        const access_token = localStorage.getItem("poi_access");

        if (!access_token) {
            checkingSession = false;
            return;
        }

        const response = await fetch(`${env.PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        });

        const res = await response.json();

        if (response.ok) {
            userState.me = res.data.user;
            if (res.data.user.role === "ADMIN") {
                goto("/placemarks");
            } else {
                goto("/categories");
            }
        } else {
            checkingSession = false;
        }
    }

    onMount(() => {
        stayLoggedIn();
    });
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
        {@render children()}
    </div>
</div>
