<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { goto } from "$app/navigation";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { onMount } from "svelte";
    import { ChevronLeftIcon, Loader2Icon } from "@lucide/svelte";
    import PlacemarkForm from "$lib/components/placemarks/placemark-form.svelte";

    let categories = $state<any[]>([]);
    let loading = $state(true);
    let saving = $state(false);
    let error = $state<string | null>(null);

    async function fetchCategories() {
        try {
            const response = await fetch(`${env.PUBLIC_API_URL}/categories`);
            const res = await response.json();
            if (response.ok) {
                categories = res.data.categories;
            } else {
                error = res.message || "Failed to load categories";
            }
        } catch (err) {
            error = "Connection error";
        } finally {
            loading = false;
        }
    }

    async function handleSave(formData: FormData) {
        saving = true;
        error = null;

        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(`${env.PUBLIC_API_URL}/placemarks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData, // FormData will automatically set the correct Content-Type with boundary
            });

            const res = await response.json();

            if (response.ok) {
                goto("/placemarks");
            } else {
                error =
                    res.message ||
                    (res.errors
                        ? Object.values(res.errors).flat().join(", ")
                        : "Failed to save spot");
            }
        } catch (err) {
            error = "An unexpected error occurred during upload.";
        } finally {
            saving = false;
        }
    }

    onMount(() => {
        fetchCategories();
    });
</script>

<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center space-x-4">
        <Button variant="ghost" size="icon" href="/placemarks">
            <ChevronLeftIcon class="h-5 w-5" />
        </Button>
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Add New Spot</h1>
            <p class="text-muted-foreground">
                Share a new camping location with the world.
            </p>
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center py-24">
            <Loader2Icon class="h-12 w-12 animate-spin text-primary" />
        </div>
    {:else}
        <Card.Root>
            <Card.Header>
                <Card.Title>Spot Details</Card.Title>
                <Card.Description
                    >Fill in the details about the camping location.</Card.Description
                >
            </Card.Header>
            <Card.Content>
                {#if error}
                    <div
                        class="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200"
                    >
                        {error}
                    </div>
                {/if}

                <PlacemarkForm
                    {categories}
                    onSave={handleSave}
                    loading={saving}
                />
            </Card.Content>
        </Card.Root>
    {/if}
</div>
