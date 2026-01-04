<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { onMount } from "svelte";
    import { ChevronLeftIcon, Loader2Icon } from "@lucide/svelte";
    import PlacemarkForm from "$lib/components/placemarks/placemark-form.svelte";

    let placemark = $state<any>(null);
    let categories = $state<any[]>([]);
    let loading = $state(true);
    let saving = $state(false);
    let error = $state<string | null>(null);

    async function fetchData() {
        loading = true;
        try {
            const id = page.params.id;
            const token = localStorage.getItem("poi_access");
            const [placemarkRes, categoriesRes] = await Promise.all([
                fetch(`${env.PUBLIC_API_URL}/placemarks/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch(`${env.PUBLIC_API_URL}/categories`),
            ]);

            const pData = await placemarkRes.json();
            const cData = await categoriesRes.json();

            if (placemarkRes.ok && categoriesRes.ok) {
                placemark = pData.data.placemark;
                categories = cData.data.categories;
            } else {
                // Prioritize errors from the placemark request if it failed
                if (!placemarkRes.ok) {
                    error =
                        pData.message ||
                        pData.errors?.join(", ") ||
                        "Failed to load spot details";
                } else {
                    error = cData.message || "Failed to load categories";
                }
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
            const response = await fetch(
                `${env.PUBLIC_API_URL}/placemarks/${placemark.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // Note: When using FormData, let the browser set the Content-Type
                    },
                    body: formData,
                },
            );

            const res = await response.json();

            if (response.ok) {
                goto(`/placemarks/${placemark.id}`);
            } else {
                error = res.message || "Failed to update spot";
            }
        } catch (err) {
            error = "An unexpected error occurred.";
        } finally {
            saving = false;
        }
    }

    onMount(() => {
        fetchData();
    });
</script>

<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center space-x-4">
        <Button variant="ghost" size="icon" href="/placemarks/{page.params.id}">
            <ChevronLeftIcon class="h-5 w-5" />
        </Button>
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Edit Spot</h1>
            <p class="text-muted-foreground">
                Update the details for "{placemark?.name || "Loading..."}"
            </p>
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center py-24">
            <Loader2Icon class="h-12 w-12 animate-spin text-primary" />
        </div>
    {:else if error}
        <div
            class="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100"
        >
            <p class="text-lg font-semibold">{error}</p>
            <Button variant="outline" class="mt-4" href="/placemarks"
                >Back to Dashboard</Button
            >
        </div>
    {:else}
        <Card.Root>
            <Card.Header>
                <Card.Title>Update Information</Card.Title>
                <Card.Description
                    >Only the fields you modify will be updated.</Card.Description
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
                    initialData={placemark}
                    onSave={handleSave}
                    loading={saving}
                />
            </Card.Content>
        </Card.Root>
    {/if}
</div>
