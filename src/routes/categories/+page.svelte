<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { userState } from "$lib/user-state.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { onMount } from "svelte";
    import { Loader2Icon, PlusIcon, TagIcon } from "@lucide/svelte";

    interface Category {
        id: string;
        name: string;
        description?: string;
        created_at: string;
    }

    let categories = $state<Category[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Form state for new category
    let showCreateForm = $state(false);
    let newCategoryName = $state("");
    let newCategoryDescription = $state("");
    let createLoading = $state(false);
    let createError = $state<string | null>(null);

    async function fetchCategories() {
        loading = true;
        try {
            const response = await fetch(`${env.PUBLIC_API_URL}/categories`);
            const res = await response.json();
            if (response.ok) {
                categories = res.data.categories;
            } else {
                error = res.message || "Failed to fetch categories";
            }
        } catch (err) {
            error = "An unexpected error occurred.";
        } finally {
            loading = false;
        }
    }

    async function handleCreateCategory(e: Event) {
        e.preventDefault();
        createLoading = true;
        createError = null;

        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(`${env.PUBLIC_API_URL}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    description: newCategoryDescription,
                }),
            });

            const res = await response.json();

            if (response.ok) {
                newCategoryName = "";
                newCategoryDescription = "";
                showCreateForm = false;
                await fetchCategories();
            } else {
                createError = res.message || "Failed to create category";
            }
        } catch (err) {
            createError = "An unexpected error occurred.";
        } finally {
            createLoading = false;
        }
    }

    onMount(() => {
        fetchCategories();
    });
</script>

<div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Categories</h1>
            <p class="text-muted-foreground">
                Manage classifications for your camping spots.
            </p>
        </div>

        {#if userState.me?.role === "ADMIN"}
            <Button onclick={() => (showCreateForm = !showCreateForm)}>
                {#if showCreateForm}
                    Cancel
                {:else}
                    <PlusIcon class="mr-2 h-4 w-4" />
                    New Category
                {/if}
            </Button>
        {/if}
    </div>

    {#if showCreateForm}
        <Card.Root>
            <Card.Header>
                <Card.Title>Create New Category</Card.Title>
                <Card.Description>
                    Add a new classification for placemarks.
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <form onsubmit={handleCreateCategory} class="space-y-4">
                    {#if createError}
                        <div
                            class="p-3 text-sm text-red-700 bg-red-100 rounded-md"
                        >
                            {createError}
                        </div>
                    {/if}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field.Field>
                            <Field.Label for="categoryName">Name</Field.Label>
                            <Input
                                id="categoryName"
                                bind:value={newCategoryName}
                                placeholder="e.g. Garden, Driveway"
                                required
                            />
                        </Field.Field>
                        <Field.Field>
                            <Field.Label for="categoryDesc"
                                >Description</Field.Label
                            >
                            <Input
                                id="categoryDesc"
                                bind:value={newCategoryDescription}
                                placeholder="Short description..."
                            />
                        </Field.Field>
                    </div>
                    <div class="flex justify-end">
                        <Button type="submit" disabled={createLoading}>
                            {#if createLoading}
                                <Loader2Icon
                                    class="mr-2 h-4 w-4 animate-spin"
                                />
                                Creating...
                            {:else}
                                Create Category
                            {/if}
                        </Button>
                    </div>
                </form>
            </Card.Content>
        </Card.Root>
    {/if}

    {#if loading}
        <div class="flex justify-center py-12">
            <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
        </div>
    {:else if error}
        <div class="p-4 text-center text-red-500 bg-red-50 rounded-lg">
            {error}
        </div>
    {:else if categories.length === 0}
        <div class="text-center py-12 border-2 border-dashed rounded-lg">
            <TagIcon class="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 class="mt-4 text-lg font-semibold">No categories found</h3>
            <p class="text-muted-foreground">
                Get started by creating your first category.
            </p>
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each categories as category (category.id)}
                <a
                    href="/placemarks?category={category.id}"
                    class="block transition-transform hover:scale-[1.02]"
                >
                    <Card.Root
                        class="h-full hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <Card.Header>
                            <div class="flex items-center space-x-2">
                                <TagIcon class="h-4 w-4 text-primary" />
                                <Card.Title>{category.name}</Card.Title>
                            </div>
                            {#if category.description}
                                <Card.Description
                                    >{category.description}</Card.Description
                                >
                            {/if}
                        </Card.Header>
                        <Card.Footer class="text-xs text-muted-foreground">
                            Created on {new Date(
                                category.created_at,
                            ).toLocaleDateString()}
                        </Card.Footer>
                    </Card.Root>
                </a>
            {/each}
        </div>
    {/if}
</div>
