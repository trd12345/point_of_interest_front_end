<script lang="ts">
    import { env } from "$env/dynamic/public";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import {
        Loader2Icon,
        MapPinIcon,
        SearchIcon,
        FilterIcon,
        PlusIcon,
        ArrowRightIcon,
    } from "@lucide/svelte";
    import PlacemarkCard from "$lib/components/placemarks/placemark-card.svelte";
    import { userState } from "$lib/user-state.svelte";

    let placemarks = $state<any[]>([]);
    let categories = $state<any[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Filter/Search state
    let searchQuery = $state("");
    let selectedCategory = $state(
        page.url.searchParams.get("category") || "all",
    );

    async function fetchData() {
        loading = true;
        try {
            const [placemarksRes, categoriesRes] = await Promise.all([
                fetch(`${env.PUBLIC_API_URL}/placemarks`),
                fetch(`${env.PUBLIC_API_URL}/categories`),
            ]);

            const pData = await placemarksRes.json();
            const cData = await categoriesRes.json();

            if (placemarksRes.ok && categoriesRes.ok) {
                placemarks = pData.data.placemarks;
                categories = cData.data.categories;
            } else {
                error =
                    pData.message || cData.message || "Failed to fetch data";
            }
        } catch (err) {
            error = "An unexpected error occurred.";
        } finally {
            loading = false;
        }
    }

    let filteredPlacemarks = $derived(
        placemarks.filter((p) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                p.name?.toLowerCase().includes(query) ||
                p.city?.toLowerCase().includes(query);
            const matchesCategory =
                selectedCategory === "all" || p.categoryId === selectedCategory;
            return matchesSearch && matchesCategory;
        }),
    );

    onMount(() => {
        fetchData();
    });
</script>

<div class="max-w-7xl mx-auto space-y-6">
    <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Camping Spots</h1>
            <p class="text-muted-foreground">
                Explore and manage your favorite camping locations.
            </p>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
            <SearchIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
                placeholder="Search by name or city..."
                class="pl-10"
                bind:value={searchQuery}
            />
        </div>
        <div class="flex items-center space-x-2">
            <FilterIcon class="h-4 w-4 text-muted-foreground" />
            <select
                class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[150px]"
                bind:value={selectedCategory}
            >
                <option value="all">All Categories</option>
                {#each categories as category (category.id)}
                    <option value={category.id}>{category.name}</option>
                {/each}
            </select>
        </div>
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2Icon class="h-12 w-12 animate-spin text-primary" />
            <p class="text-muted-foreground animate-pulse">
                Loading amazing spots...
            </p>
        </div>
    {:else if error}
        <div
            class="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100"
        >
            <p class="text-lg font-semibold">{error}</p>
            <Button variant="outline" class="mt-4" onclick={fetchData}
                >Try Again</Button
            >
        </div>
    {:else if filteredPlacemarks.length === 0}
        <div
            class="text-center py-24 border-2 border-dashed rounded-xl bg-muted/30"
        >
            <MapPinIcon class="mx-auto h-16 w-16 text-muted-foreground/40" />
            <h3 class="mt-4 text-xl font-semibold">No spots found</h3>
            <p class="text-muted-foreground max-w-sm mx-auto mt-2">
                {#if searchQuery || selectedCategory !== "all"}
                    Adjust your filters or search query to find what you're
                    looking for.
                {:else}
                    Be the first to share an amazing camping spot with the
                    community!
                {/if}
            </p>
            {#if searchQuery || selectedCategory !== "all"}
                <Button
                    variant="link"
                    class="mt-2"
                    onclick={() => {
                        searchQuery = "";
                        selectedCategory = "all";
                    }}
                >
                    Clear all filters
                </Button>
            {/if}
        </div>
    {:else}
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {#each filteredPlacemarks as placemark (placemark.id)}
                <PlacemarkCard {placemark} />
            {/each}
        </div>
    {/if}
</div>
