<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { userState } from "$lib/user-state.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { onMount } from "svelte";
    import {
        Loader2Icon,
        MapPinIcon,
        UserIcon,
        EyeIcon,
        CalendarIcon,
        ChevronLeftIcon,
        Trash2Icon,
        EditIcon,
        GlobeIcon,
        LockIcon,
    } from "@lucide/svelte";
    import Map from "$lib/components/placemarks/Map.svelte";

    let placemark = $state<any>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let deleting = $state(false);

    async function fetchPlacemark() {
        loading = true;
        try {
            const id = page.params.id;
            const token = localStorage.getItem("poi_access");
            const response = await fetch(
                `${env.PUBLIC_API_URL}/placemarks/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const res = await response.json();

            if (response.ok) {
                placemark = res.data.placemark;
            } else {
                error = res.message || "Spot not found";
            }
        } catch (err) {
            error = "Connection error";
        } finally {
            loading = false;
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this camping spot?"))
            return;

        deleting = true;
        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(
                `${env.PUBLIC_API_URL}/placemarks/${placemark.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.ok) {
                goto("/placemarks");
            } else {
                alert("Failed to delete spot.");
            }
        } catch (err) {
            alert("An error occurred.");
        } finally {
            deleting = false;
        }
    }

    onMount(() => {
        fetchPlacemark();
    });

    const mapKey = $derived(
        env.PUBLIC_MAPTILER_KEY?.replace(/['"]/g, "").trim(),
    );

    const isOwner = $derived(
        placemark?.userId === userState.me?.id ||
            userState.me?.role === "ADMIN",
    );
</script>

<div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <Button variant="ghost" size="icon" href="/placemarks">
                <ChevronLeftIcon class="h-5 w-5" />
            </Button>
            <h1 class="text-3xl font-bold tracking-tight">Spot Details</h1>
        </div>

        {#if isOwner}
            <div class="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    href="/placemarks/{placemark?.id}/edit"
                >
                    <EditIcon class="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onclick={handleDelete}
                    disabled={deleting}
                >
                    {#if deleting}
                        <Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
                    {:else}
                        <Trash2Icon class="mr-2 h-4 w-4" />
                    {/if}
                    Delete
                </Button>
            </div>
        {/if}
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2Icon class="h-12 w-12 animate-spin text-primary" />
            <p class="text-muted-foreground animate-pulse">
                Loading spot details...
            </p>
        </div>
    {:else if error}
        <div
            class="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100"
        >
            <p class="text-lg font-semibold">{error}</p>
            <Button variant="outline" class="mt-4" href="/placemarks"
                >Back to List</Button
            >
        </div>
    {:else if placemark}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
                <div
                    class="rounded-2xl overflow-hidden bg-muted border shadow-sm aspect-video relative"
                >
                    {#if placemark.image_url}
                        <img
                            src={placemark.image_url}
                            alt={placemark.name}
                            class="w-full h-full object-cover"
                        />
                    {:else}
                        <div
                            class="w-full h-full flex items-center justify-center"
                        >
                            <MapPinIcon
                                class="h-24 w-24 text-muted-foreground/30"
                            />
                        </div>
                    {/if}

                    <div class="absolute top-4 right-4 flex space-x-2">
                        {#if placemark.is_public}
                            <div
                                class="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center"
                            >
                                <GlobeIcon class="h-3 w-3 mr-1.5" /> Public
                            </div>
                        {:else}
                            <div
                                class="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center"
                            >
                                <LockIcon class="h-3 w-3 mr-1.5" /> Private
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="space-y-4">
                    <div
                        class="flex items-center space-x-2 text-primary font-semibold text-sm tracking-wider uppercase"
                    >
                        <span>{placemark.category.name}</span>
                    </div>
                    <h2 class="text-4xl font-extrabold">{placemark.name}</h2>
                    <p
                        class="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed"
                    >
                        {placemark.description || "No description provided."}
                    </p>
                </div>

                <div
                    class="pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div class="p-4 rounded-xl bg-muted/50 flex items-start">
                        <MapPinIcon class="h-5 w-5 text-primary mr-3 mt-1" />
                        <div>
                            <h4
                                class="font-bold text-sm uppercase text-muted-foreground tracking-tight"
                            >
                                Location
                            </h4>
                            <p class="mt-1 font-medium text-sm sm:text-base">
                                {placemark.street}
                                {placemark.house_number || ""}
                            </p>
                            <p
                                class="text-muted-foreground text-sm sm:text-base"
                            >
                                {placemark.zip}
                                {placemark.city}, {placemark.country}
                            </p>
                        </div>
                    </div>
                    <div class="p-4 rounded-xl bg-muted/50 flex items-start">
                        <GlobeIcon class="h-5 w-5 text-primary mr-3 mt-1" />
                        <div>
                            <h4
                                class="font-bold text-sm uppercase text-muted-foreground tracking-tight"
                            >
                                Coordinates
                            </h4>
                            <div class="mt-1 space-y-1">
                                <p class="font-medium text-sm sm:text-base">
                                    Lat: {placemark.lat.toFixed(6)}
                                </p>
                                <p class="font-medium text-sm sm:text-base">
                                    Lng: {placemark.lng.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map Visualization -->
                <div class="pt-8 border-t">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold">Map Overview</h3>
                        <div class="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                href="https://www.google.com/maps/search/?api=1&query={placemark.lat},{placemark.lng}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <GlobeIcon class="h-4 w-4 mr-2" />
                                Google Maps
                            </Button>
                        </div>
                    </div>
                    <div
                        class="rounded-2xl overflow-hidden border bg-muted shadow-sm aspect-video sm:aspect-[21/9] relative group"
                    >
                        {#if mapKey}
                            <Map
                                apiKey={mapKey}
                                lat={placemark.lat}
                                lng={placemark.lng}
                            />
                        {:else}
                            <div
                                class="w-full h-full flex flex-col items-center justify-center space-y-3 p-8 text-center"
                            >
                                <div
                                    class="p-4 rounded-full bg-primary/5 text-primary/20"
                                >
                                    <MapPinIcon class="h-12 w-12" />
                                </div>
                                <div class="max-w-xs space-y-1">
                                    <p class="font-semibold">
                                        Map Preview Unavailable
                                    </p>
                                    <p class="text-sm text-muted-foreground">
                                        Please configure your <code
                                            class="bg-muted px-1 rounded"
                                            >PUBLIC_MAPTILER_KEY</code
                                        > to enable interactive maps.
                                    </p>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="text-lg">Host Information</Card.Title
                        >
                    </Card.Header>
                    <Card.Content class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <div
                                class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                            >
                                <UserIcon class="h-5 w-5" />
                            </div>
                            <div>
                                <p class="font-bold">
                                    {placemark.user.profile.first_name}
                                    {placemark.user.profile.last_name}
                                </p>
                                <p class="text-xs text-muted-foreground">
                                    Certified Host
                                </p>
                            </div>
                        </div>
                        <Button variant="secondary" class="w-full"
                            >Contact Host</Button
                        >
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title class="text-lg">Stats & Activity</Card.Title
                        >
                    </Card.Header>
                    <Card.Content class="space-y-4">
                        <div
                            class="flex items-center justify-between py-2 border-b border-dashed"
                        >
                            <div
                                class="flex items-center text-sm text-muted-foreground"
                            >
                                <EyeIcon class="h-4 w-4 mr-2" /> Views
                            </div>
                            <span class="font-bold">{placemark.view_count}</span
                            >
                        </div>
                        <div class="flex items-center justify-between py-2">
                            <div
                                class="flex items-center text-sm text-muted-foreground"
                            >
                                <CalendarIcon class="h-4 w-4 mr-2" /> Listed on
                            </div>
                            <span class="font-bold"
                                >{new Date(
                                    placemark.created_at,
                                ).toLocaleDateString()}</span
                            >
                        </div>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    {/if}
</div>
