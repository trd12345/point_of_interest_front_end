<script lang="ts">
    import { BadgeCheckIcon, LogOutIcon } from "@lucide/svelte";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import { userState } from "$lib/user-state.svelte";

    async function stayLoggedIn() {
        const access_token = localStorage.getItem("poi_access");
        if (!access_token) return;

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
            } else {
                localStorage.removeItem("poi_access");
                userState.me = null;
                goto("/login");
            }
        } catch (error) {
            console.error("Failed to fetch user session:", error);
        }
    }

    async function logout() {
        const access_token = localStorage.getItem("poi_access");

        await fetch(`${env.PUBLIC_API_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        });

        localStorage.removeItem("poi_access");
        userState.me = null;
        goto("/login");
    }

    onMount(() => {
        stayLoggedIn();
    });
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger
        class="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
        <Avatar.Root class="size-8 rounded-full border border-border">
            <Avatar.Fallback
                class="bg-primary/10 text-primary uppercase font-bold text-xs"
            >
                {userState.me?.profile.first_name?.[0]}
                {userState.me?.profile.last_name?.[0]}
            </Avatar.Fallback>
        </Avatar.Root>
        <div class="hidden md:flex flex-col items-start gap-0.5">
            <span class="text-xs font-semibold leading-none">
                {userState.me?.profile.first_name}
                {userState.me?.profile.last_name}
            </span>
            <span class="text-[10px] text-muted-foreground leading-none">
                {userState.me?.email}
            </span>
        </div>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56" align="end">
        <DropdownMenu.Label class="font-normal">
            <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">
                    {userState.me?.profile.first_name}
                    {userState.me?.profile.last_name}
                </p>
                <p class="text-xs leading-none text-muted-foreground">
                    {userState.me?.email}
                </p>
            </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
            <DropdownMenu.Item onclick={() => goto("/me")}>
                <BadgeCheckIcon class="mr-2 h-4 w-4" />
                <span>Account</span>
            </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
            onclick={logout}
            class="text-red-600 focus:text-red-700 focus:bg-red-50"
        >
            <LogOutIcon class="mr-2 h-4 w-4" />
            <span>Log out</span>
        </DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>
