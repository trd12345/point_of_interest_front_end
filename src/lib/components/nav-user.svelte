<script lang="ts">
    import { BadgeCheckIcon } from "@lucide/svelte";
    import { BellIcon } from "@lucide/svelte";
    import { ChevronsUpDownIcon } from "@lucide/svelte";
    import { CreditCardIcon } from "@lucide/svelte";
    import { LogOutIcon } from "@lucide/svelte";
    import { SparklesIcon } from "@lucide/svelte";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import {userState} from "$lib/user-state.svelte";

    const sidebar = useSidebar();

    async function stayLoggedIn() {
        const access_token = localStorage.getItem("poi_access");

        const response = await fetch(`${env.PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        });

        const result = await response.json();
        userState.me = result.data.user;
    }

    async function logout() {
        const access_token = localStorage.getItem("poi_access");

        const response = await fetch(`${env.PUBLIC_API_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        });

        const result = await response.json();
        localStorage.removeItem("poi_access");
        userState.me = null;
        goto("/login");
    }

    onMount(() => {
        stayLoggedIn();
    });
</script>

<Sidebar.Menu>
    <Sidebar.MenuItem>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                    <Sidebar.MenuButton
                        {...props}
                        size="lg"
                        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar.Root class="size-8 rounded-lg">
                            <Avatar.Fallback class="rounded-lg text-sm">
                                {userState.me?.profile.first_name[0]}
                                {userState.me?.profile.last_name[0]}
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <div
                            class="grid flex-1 text-start text-sm leading-tight"
                        >
                            <span class="truncate font-medium">
                                {userState.me?.profile.first_name}
                                {userState.me?.profile.last_name}
                            </span>
                            <span class="truncate text-xs">{userState.me?.email}</span>
                        </div>
                        <ChevronsUpDownIcon class="ms-auto size-4" />
                    </Sidebar.MenuButton>
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
                class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
                side={sidebar.isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
            >
                <DropdownMenu.Label class="p-0 font-normal">
                    <div
                        class="flex items-center gap-2 px-1 py-1.5 text-start text-sm"
                    >
                        <Avatar.Root class="size-8 rounded-lg">
                            <Avatar.Fallback class="rounded-lg text-xs">
                                {userState.me?.profile.first_name[0]}
                                {userState.me?.profile.last_name[0]}
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <div
                            class="grid flex-1 text-start text-sm leading-tight"
                        >
                            <span class="truncate font-medium">
                                {userState.me?.profile.first_name}
                                {userState.me?.profile.last_name}
                            </span>
                            <span class="truncate text-xs">{userState.me?.email}</span>
                        </div>
                    </div>
                </DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                    <DropdownMenu.Item>
                        <BadgeCheckIcon />
                        Account
                    </DropdownMenu.Item>
                </DropdownMenu.Group>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onclick={logout}>
                    <LogOutIcon />
                    Log out
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </Sidebar.MenuItem>
</Sidebar.Menu>
