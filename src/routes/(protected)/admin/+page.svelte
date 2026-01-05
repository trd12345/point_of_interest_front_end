<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import { userState } from "$lib/user-state.svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import {
        UsersIcon,
        TagIcon,
        MapPinIcon,
        Trash2Icon,
        PlusIcon,
        Loader2Icon,
        ShieldCheckIcon,
        ChevronRightIcon,
        SearchIcon,
    } from "@lucide/svelte";

    let users = $state<any[]>([]);
    let categories = $state<any[]>([]);
    let placemarks = $state<any[]>([]);

    let loading = $state(true);
    let activeTab = $derived(page.url.searchParams.get("tab") || "users");

    // Search/Filter states
    let userSearch = $state("");
    let spotSearch = $state("");

    let filteredUsers = $derived(
        users.filter(
            (u) =>
                u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                `${u.profile?.first_name} ${u.profile?.last_name}`
                    .toLowerCase()
                    .includes(userSearch.toLowerCase()),
        ),
    );

    let filteredSpots = $derived(
        placemarks.filter(
            (p) =>
                p.name.toLowerCase().includes(spotSearch.toLowerCase()) ||
                p.city.toLowerCase().includes(spotSearch.toLowerCase()),
        ),
    );

    function setTab(tab: string) {
        const url = new URL(page.url);
        url.searchParams.set("tab", tab);
        goto(url.toString(), {
            replaceState: true,
            keepFocus: true,
            noScroll: true,
        });
    }

    // Category form state
    let newCategoryName = $state("");
    let newCategoryDesc = $state("");
    let creatingCategory = $state(false);

    async function fetchData() {
        loading = true;
        const token = localStorage.getItem("poi_access");

        try {
            const [usersRes, catsRes, spotsRes] = await Promise.all([
                fetch(`${env.PUBLIC_API_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${env.PUBLIC_API_URL}/categories`),
                fetch(`${env.PUBLIC_API_URL}/placemarks`),
            ]);

            // Helper to safely parse JSON
            const safeJson = async (res: Response) => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error(`Invalid JSON response from ${res.url}`);
                }
            };

            const usersData = await safeJson(usersRes);
            const catsData = await safeJson(catsRes);
            const spotsData = await safeJson(spotsRes);

            if (!usersRes.ok) {
                alert(
                    `Users load failed: ${usersData.errors?.[0] || usersData.message || "Unknown error"}`,
                );
            } else {
                users = usersData.data.users;
            }

            if (catsRes.ok) {
                categories = catsData.data.categories;
            } else {
            }

            if (spotsRes.ok) {
                placemarks = spotsData.data.placemarks;
            } else {
            }
        } catch (error: any) {
            alert(`Error fetching admin data: ${error.message}`);
        } finally {
            loading = false;
        }
    }

    async function deleteUser(id: string) {
        if (
            !confirm(
                "Are you sure? This will delete the user and ALL their data!",
            )
        )
            return;

        const token = localStorage.getItem("poi_access");
        const res = await fetch(`${env.PUBLIC_API_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            users = users.filter((u) => u.id !== id);
            // Refresh spots and cats as they might be gone too
            fetchData();
        } else {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Unknown error" }));
            alert(
                `Failed to delete user: ${errorData.message || res.statusText}`,
            );
        }
    }

    async function updateUserRole(id: string, newRole: string) {
        const token = localStorage.getItem("poi_access");
        const res = await fetch(
            `${env.PUBLIC_API_URL}/admin/users/${id}/role`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            },
        );

        if (res.ok) {
            const data = await res.json();
            users = users.map((u) => (u.id === id ? data.data.user : u));
        } else {
            const data = await res
                .json()
                .catch(() => ({ errors: ["Unknown error"] }));
            alert(data.errors?.[0] || data.message || "Failed to update role");
        }
    }

    async function createCategory() {
        if (!newCategoryName) return;
        creatingCategory = true;

        const token = localStorage.getItem("poi_access");
        const res = await fetch(`${env.PUBLIC_API_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: newCategoryName,
                description: newCategoryDesc,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            categories = [...categories, data.data.category];
            newCategoryName = "";
            newCategoryDesc = "";
        } else {
            const data = await res.json();
            alert(data.errors?.[0] || "Failed to create category");
        }
        creatingCategory = false;
    }

    async function deleteCategory(id: string) {
        if (!confirm("Are you sure?")) return;

        const token = localStorage.getItem("poi_access");
        const res = await fetch(`${env.PUBLIC_API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            categories = categories.filter((c) => c.id !== id);
        } else {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Unknown error" }));
            alert(
                `Failed to delete category: ${errorData.message || "It might be in use."}`,
            );
        }
    }

    async function deletePlacemark(id: string) {
        if (!confirm("Are you sure?")) return;

        const token = localStorage.getItem("poi_access");
        const res = await fetch(`${env.PUBLIC_API_URL}/placemarks/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            placemarks = placemarks.filter((p) => p.id !== id);
        } else {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Unknown error" }));
            alert(
                `Failed to delete spot: ${errorData.message || res.statusText}`,
            );
        }
    }

    $effect(() => {
        if (userState.restored) {
            if (userState.me?.role !== "ADMIN") {
                goto("/");
            } else if (users.length === 0) {
                // Fetch data when we're admin and haven't loaded yet
                fetchData();
            }
        }
    });
</script>

{#if userState.restored}
    {#if userState.me?.role === "ADMIN"}
        <div class="max-w-6xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            <div
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 class="text-3xl font-bold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p class="text-muted-foreground mt-1">
                        Manage users, categories, and all camping spots.
                    </p>
                </div>
                <div
                    class="flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                    <ShieldCheckIcon class="size-4 mr-2" />
                    Administrator Access
                </div>
            </div>

            <!-- Tabs Header -->
            <div
                class="flex space-x-1 p-1 bg-muted rounded-lg w-fit overflow-x-auto max-w-full"
            >
                <button
                    onclick={() => setTab("users")}
                    class={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === "users" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <UsersIcon class="size-4 inline mr-2" />
                    Users
                </button>
                <button
                    onclick={() => setTab("categories")}
                    class={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === "categories" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <TagIcon class="size-4 inline mr-2" />
                    Categories
                </button>
                <button
                    onclick={() => setTab("placemarks")}
                    class={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === "placemarks" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <MapPinIcon class="size-4 inline mr-2" />
                    Placemarks
                </button>
            </div>

            {#if loading}
                <div class="flex items-center justify-center py-20">
                    <Loader2Icon class="size-8 animate-spin text-primary" />
                </div>
            {:else if activeTab === "users"}
                <Card.Root>
                    <Card.Header
                        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                        <div>
                            <Card.Title>Users Management</Card.Title>
                            <Card.Description
                                >Manage all registered users and their accounts.</Card.Description
                            >
                        </div>
                        <div class="relative w-full sm:w-64">
                            <SearchIcon
                                class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                            />
                            <Input
                                placeholder="Search users..."
                                class="pl-9"
                                bind:value={userSearch}
                            />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="overflow-x-auto -mx-6">
                            <table class="w-full text-sm text-left">
                                <thead
                                    class="text-xs uppercase bg-muted/50 text-muted-foreground"
                                >
                                    <tr>
                                        <th class="px-6 py-3 font-medium"
                                            >Name</th
                                        >
                                        <th class="px-6 py-3 font-medium"
                                            >Email</th
                                        >
                                        <th class="px-6 py-3 font-medium"
                                            >Role</th
                                        >
                                        <th class="px-6 py-3 font-medium"
                                            >Joined</th
                                        >
                                        <th
                                            class="px-6 py-3 font-medium text-right"
                                            >Actions</th
                                        >
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-border">
                                    {#each filteredUsers as user (user.id)}
                                        <tr
                                            class="hover:bg-muted/30 transition-colors"
                                        >
                                            <td class="px-6 py-4 font-medium">
                                                {user.profile?.first_name?.[0]}. {user
                                                    .profile?.last_name}
                                            </td>
                                            <td class="px-6 py-4"
                                                >{user.email}</td
                                            >
                                            <td class="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onchange={(e) =>
                                                        updateUserRole(
                                                            user.id,
                                                            e.currentTarget
                                                                .value,
                                                        )}
                                                    class="bg-background border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                                                    disabled={user.id ===
                                                        userState.me?.id}
                                                >
                                                    <option value="USER"
                                                        >USER</option
                                                    >
                                                    <option value="ADMIN"
                                                        >ADMIN</option
                                                    >
                                                </select>
                                            </td>
                                            <td
                                                class="px-6 py-4 text-muted-foreground whitespace-nowrap"
                                                >{new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}</td
                                            >
                                            <td class="px-6 py-4 text-right">
                                                {#if user.id !== userState.me?.id}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        class="text-destructive hover:bg-destructive/10"
                                                        onclick={() =>
                                                            deleteUser(user.id)}
                                                    >
                                                        <Trash2Icon
                                                            class="size-4"
                                                        />
                                                    </Button>
                                                {/if}
                                            </td>
                                        </tr>
                                    {:else}
                                        <tr>
                                            <td
                                                colspan="5"
                                                class="px-6 py-10 text-center text-muted-foreground"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </Card.Content>
                </Card.Root>
            {:else if activeTab === "categories"}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Create Category -->
                    <Card.Root class="lg:col-span-1 h-fit">
                        <Card.Header>
                            <Card.Title>New Category</Card.Title>
                            <Card.Description
                                >Create a new spot classification.</Card.Description
                            >
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div class="space-y-2">
                                <Label for="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Garden"
                                    bind:value={newCategoryName}
                                />
                            </div>
                            <div class="space-y-2">
                                <Label for="desc">Description</Label>
                                <Input
                                    id="desc"
                                    placeholder="Brief details..."
                                    bind:value={newCategoryDesc}
                                />
                            </div>
                            <Button
                                class="w-full"
                                disabled={creatingCategory || !newCategoryName}
                                onclick={createCategory}
                            >
                                {#if creatingCategory}
                                    <Loader2Icon
                                        class="size-4 mr-2 animate-spin"
                                    />
                                {:else}
                                    <PlusIcon class="size-4 mr-2" />
                                {/if}
                                Create Category
                            </Button>
                        </Card.Content>
                    </Card.Root>

                    <!-- Categories List -->
                    <Card.Root class="lg:col-span-2">
                        <Card.Header>
                            <Card.Title>Existing Categories</Card.Title>
                            <Card.Description
                                >Manage predefined spot categories.</Card.Description
                            >
                        </Card.Header>
                        <Card.Content>
                            <div class="grid grid-cols-1 gap-4">
                                {#each categories as cat (cat.id)}
                                    <div
                                        class="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
                                    >
                                        <div
                                            class="flex items-center space-x-4"
                                        >
                                            <div
                                                class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                                            >
                                                <TagIcon class="size-5" />
                                            </div>
                                            <div>
                                                <p class="font-bold text-sm">
                                                    {cat.name}
                                                </p>
                                                <p
                                                    class="text-xs text-muted-foreground line-clamp-1"
                                                >
                                                    {cat.description ||
                                                        "No description"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                                            onclick={() =>
                                                deleteCategory(cat.id)}
                                        >
                                            <Trash2Icon class="size-4" />
                                        </Button>
                                    </div>
                                {:else}
                                    <div
                                        class="py-12 text-center text-muted-foreground"
                                    >
                                        No categories created yet.
                                    </div>
                                {/each}
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>
            {:else if activeTab === "placemarks"}
                <Card.Root>
                    <Card.Header
                        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                        <div>
                            <Card.Title>Placemarks Management</Card.Title>
                            <Card.Description
                                >Monitor and manage all camping spots across the
                                platform.</Card.Description
                            >
                        </div>
                        <div class="relative w-full sm:w-64">
                            <SearchIcon
                                class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                            />
                            <Input
                                placeholder="Search spots..."
                                class="pl-9"
                                bind:value={spotSearch}
                            />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="overflow-x-auto -mx-6">
                            <table class="w-full text-sm text-left">
                                <thead
                                    class="text-xs uppercase bg-muted/50 text-muted-foreground"
                                >
                                    <tr>
                                        <th class="px-6 py-3 font-medium"
                                            >Spot Name</th
                                        >
                                        <th class="px-6 py-3 font-medium"
                                            >Location</th
                                        >
                                        <th class="px-6 py-3 font-medium"
                                            >Creator</th
                                        >
                                        <th
                                            class="px-6 py-3 font-medium text-right"
                                            >Actions</th
                                        >
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-border">
                                    {#each filteredSpots as p (p.id)}
                                        <tr
                                            class="hover:bg-muted/30 transition-colors"
                                        >
                                            <td class="px-6 py-4">
                                                <div
                                                    class="flex items-center space-x-3"
                                                >
                                                    {#if p.image_url}
                                                        <img
                                                            src={p.image_url}
                                                            alt={p.name}
                                                            class="size-10 rounded-lg object-cover"
                                                        />
                                                    {:else}
                                                        <div
                                                            class="size-10 rounded-lg bg-muted flex items-center justify-center"
                                                        >
                                                            <MapPinIcon
                                                                class="size-5 text-muted-foreground"
                                                            />
                                                        </div>
                                                    {/if}
                                                    <span class="font-medium"
                                                        >{p.name}</span
                                                    >
                                                </div>
                                            </td>
                                            <td
                                                class="px-6 py-4 text-muted-foreground whitespace-nowrap"
                                            >
                                                {p.city}, {p.country}
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex flex-col">
                                                    <span
                                                        class="font-medium text-xs whitespace-nowrap"
                                                        >{p.user?.profile
                                                            ?.first_name?.[0]}. {p
                                                            .user?.profile
                                                            ?.last_name}</span
                                                    >
                                                    <span
                                                        class="text-[10px] text-muted-foreground"
                                                        >ID: {p.userId.slice(
                                                            -6,
                                                        )}</span
                                                    >
                                                </div>
                                            </td>
                                            <td
                                                class="px-6 py-4 text-right space-x-2 whitespace-nowrap"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    href="/placemarks/{p.id}"
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    class="text-destructive hover:bg-destructive/10"
                                                    onclick={() =>
                                                        deletePlacemark(p.id)}
                                                >
                                                    <Trash2Icon
                                                        class="size-4"
                                                    />
                                                </Button>
                                            </td>
                                        </tr>
                                    {:else}
                                        <tr>
                                            <td
                                                colspan="4"
                                                class="px-6 py-10 text-center text-muted-foreground"
                                            >
                                                No placemarks found.
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/if}
        </div>
    {/if}
{:else}
    <div class="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon class="size-10 animate-spin text-primary" />
    </div>
{/if}

<style>
    /* Custom styles for select and tables */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        background-size: 0.75rem;
        padding-right: 1.5rem;
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }

    /* Tab styles for smooth interaction */
    button {
        cursor: pointer;
    }
</style>
