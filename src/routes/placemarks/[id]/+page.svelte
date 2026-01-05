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
        StarIcon,
        MessageSquareIcon,
        SendIcon,
    } from "@lucide/svelte";
    import Map from "$lib/components/placemarks/Map.svelte";

    let placemark = $state<any>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let deleting = $state(false);

    // Review State
    let newComment = $state("");
    let newRating = $state(0);
    let submittingReview = $state(false);
    let hoveredRating = $state(0);
    let replyingTo = $state<string | null>(null);
    let replyComment = $state("");
    let submittingReply = $state(false);

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
                // Ensure a fresh reference to trigger Svelte 5 reactivity if needed,
                // though $state handles mutations, reassignment is safer for deep structures in some contexts.
                placemark = { ...res.data.placemark };
            } else {
                error = res.message || "Spot not found";
            }
        } catch (err) {
            error = "Connection error";
        } finally {
            loading = false;
        }
    }

    async function submitReview() {
        if (newRating === 0) return alert("Please select a rating");
        if (!newComment.trim()) return alert("Please enter a comment");

        submittingReview = true;
        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(`${env.PUBLIC_API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    placemarkId: placemark.id,
                    rating: newRating,
                    comment: newComment,
                }),
            });

            if (response.ok) {
                newComment = "";
                newRating = 0;
                await fetchPlacemark(); // Refresh data
            } else {
                const res = await response.json();
                alert(res.errors?.[0] || "Failed to submit review");
            }
        } catch (err) {
            alert("Connection error");
        } finally {
            submittingReview = false;
        }
    }

    async function submitReply(parentId: string) {
        if (!replyComment.trim()) return;

        submittingReply = true;
        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(`${env.PUBLIC_API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    placemarkId: placemark.id,
                    comment: replyComment,
                    parentId,
                }),
            });

            if (response.ok) {
                replyComment = "";
                replyingTo = null;
                await fetchPlacemark();
            } else {
                alert("Failed to post reply");
            }
        } catch (err) {
            alert("Connection error");
        } finally {
            submittingReply = false;
        }
    }

    async function deleteReview(reviewId: string) {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(
                `${env.PUBLIC_API_URL}/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.ok) {
                await fetchPlacemark();
            } else {
                alert("Failed to delete review");
            }
        } catch (err) {
            alert("Connection error");
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

    const avgRating = $derived(
        placemark?.reviews?.length
            ? (
                  placemark.reviews
                      .filter((r: any) => r.rating)
                      .reduce((acc: number, r: any) => acc + r.rating, 0) /
                  placemark.reviews.filter((r: any) => r.rating).length
              ).toFixed(1)
            : "0.0",
    );

    const totalReviews = $derived(
        placemark?.reviews ? placemark.reviews.length : 0,
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

                <div class="pt-8 border-t">
                    <div
                        class="p-6 rounded-2xl bg-muted/50 flex items-start shadow-sm border border-border/50"
                    >
                        <MapPinIcon class="h-6 w-6 text-primary mr-4 mt-1" />
                        <div>
                            <h4
                                class="font-bold text-sm uppercase text-muted-foreground tracking-tight"
                            >
                                General Location
                            </h4>
                            <p
                                class="text-muted-foreground text-lg mt-1 font-medium"
                            >
                                {placemark.zip}
                                {placemark.city}, {placemark.country}
                            </p>
                            <p
                                class="text-xs text-primary font-medium mt-2 flex items-center"
                            >
                                <LockIcon class="h-3 w-3 mr-1" /> Specific address
                                hidden for privacy
                            </p>
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
                        class="rounded-3xl overflow-hidden border bg-muted shadow-lg aspect-square sm:aspect-[16/10] relative group ring-1 ring-border"
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

                <!-- Reviews & Ratings Section -->
                <div class="pt-12 border-t space-y-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold">
                                Reviews & Ratings
                            </h3>
                            <div class="flex items-center mt-1 space-x-2">
                                <div class="flex items-center text-amber-500">
                                    <StarIcon class="size-4 fill-current" />
                                    <span class="ml-1 font-bold text-lg"
                                        >{avgRating}</span
                                    >
                                </div>
                                <span class="text-muted-foreground text-sm"
                                    >• {totalReviews} reviews</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Review Form -->
                    {#if userState.me && !isOwner}
                        <Card.Root class="bg-primary/5 border-primary/10">
                            <Card.Content class="p-6 space-y-4">
                                <h4 class="font-bold">Leave a Review</h4>
                                <div class="flex items-center space-x-1">
                                    {#each Array(5) as _, i}
                                        <button
                                            type="button"
                                            class="p-1 focus:outline-none transition-transform active:scale-90"
                                            onmouseenter={() =>
                                                (hoveredRating = i + 1)}
                                            onmouseleave={() =>
                                                (hoveredRating = 0)}
                                            onclick={() => (newRating = i + 1)}
                                        >
                                            <StarIcon
                                                class="size-8 {i <
                                                (hoveredRating || newRating)
                                                    ? 'text-amber-500 fill-current'
                                                    : 'text-muted-foreground/30'}"
                                            />
                                        </button>
                                    {/each}
                                </div>
                                <div class="relative">
                                    <textarea
                                        bind:value={newComment}
                                        placeholder="Share your experience here..."
                                        class="w-full bg-background border rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm"
                                    ></textarea>
                                    <div class="mt-4 flex justify-end">
                                        <Button
                                            onclick={submitReview}
                                            disabled={submittingReview}
                                        >
                                            {#if submittingReview}
                                                <Loader2Icon
                                                    class="mr-2 h-4 w-4 animate-spin"
                                                />
                                            {/if}
                                            Submit Review
                                        </Button>
                                    </div>
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {:else if !userState.me}
                        <div
                            class="p-6 bg-muted rounded-2xl border border-dashed text-center"
                        >
                            <p class="text-sm text-muted-foreground">
                                Please <a
                                    href="/login"
                                    class="text-primary font-bold hover:underline"
                                    >login</a
                                > to leave a review.
                            </p>
                        </div>
                    {:else if isOwner}
                        <div
                            class="p-6 bg-primary/5 rounded-2xl border border-dashed text-center"
                        >
                            <p class="text-sm text-muted-foreground">
                                You are the host of this spot. You can reply to
                                guest reviews below.
                            </p>
                        </div>
                    {/if}

                    <!-- Review List -->
                    <div class="space-y-6">
                        {#if placemark.reviews?.length === 0}
                            <div
                                class="py-12 text-center text-muted-foreground"
                            >
                                <MessageSquareIcon
                                    class="size-12 mx-auto opacity-10 mb-4"
                                />
                                <p>No reviews yet. Be the first to rate!</p>
                            </div>
                        {:else}
                            <div class="space-y-8">
                                {#each placemark.reviews as review}
                                    <div class="space-y-4">
                                        <div class="flex justify-between">
                                            <div
                                                class="flex items-center space-x-3"
                                            >
                                                <div
                                                    class="size-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground"
                                                >
                                                    {review.user.profile
                                                        .first_name[0]}
                                                </div>
                                                <div>
                                                    <p
                                                        class="font-bold text-sm"
                                                    >
                                                        {review.user.profile
                                                            .first_name}
                                                        {review.user.profile
                                                            .last_name}
                                                    </p>
                                                    <p
                                                        class="text-[10px] text-muted-foreground"
                                                    >
                                                        {new Date(
                                                            review.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                class="flex items-center space-x-1 text-amber-500"
                                            >
                                                {#each Array(5) as _, i}
                                                    <StarIcon
                                                        class="size-3 {i <
                                                        review.rating
                                                            ? 'fill-current'
                                                            : 'text-muted-foreground/20'}"
                                                    />
                                                {/each}
                                            </div>
                                        </div>
                                        <div
                                            class="bg-muted/30 p-4 rounded-2xl border border-border/50 relative group"
                                        >
                                            <p class="text-sm leading-relaxed">
                                                {review.comment}
                                            </p>

                                            <div
                                                class="mt-4 flex items-center space-x-3 transition-opacity"
                                            >
                                                {#if isOwner && !review.replies?.length}
                                                    <button
                                                        class="text-[10px] font-bold uppercase tracking-tight text-primary hover:underline flex items-center"
                                                        onclick={() =>
                                                            (replyingTo =
                                                                review.id)}
                                                    >
                                                        <MessageSquareIcon
                                                            class="size-3 mr-1"
                                                        /> Reply
                                                    </button>
                                                {/if}
                                                {#if userState.me?.id === review.userId || userState.me?.role === "ADMIN"}
                                                    <button
                                                        class="text-[10px] font-bold uppercase tracking-tight text-destructive hover:underline flex items-center"
                                                        onclick={() =>
                                                            deleteReview(
                                                                review.id,
                                                            )}
                                                    >
                                                        <Trash2Icon
                                                            class="size-3 mr-1"
                                                        /> Delete
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>

                                        <!-- Host Replies -->
                                        {#if review.replies?.length}
                                            <div
                                                class="ml-10 space-y-4 border-l-2 border-primary/10 pl-6"
                                            >
                                                {#each review.replies as reply}
                                                    <div class="space-y-2">
                                                        <div
                                                            class="flex items-center space-x-2"
                                                        >
                                                            <div
                                                                class="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary"
                                                            >
                                                                H
                                                            </div>
                                                            <p
                                                                class="text-xs font-bold"
                                                            >
                                                                Host Reply
                                                            </p>
                                                            <p
                                                                class="text-[9px] text-muted-foreground"
                                                            >
                                                                {new Date(
                                                                    reply.created_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div
                                                            class="bg-primary/5 p-3 rounded-xl border border-primary/10 relative group"
                                                        >
                                                            <p
                                                                class="text-xs leading-relaxed"
                                                            >
                                                                {reply.comment}
                                                            </p>
                                                            {#if isOwner || userState.me?.role === "ADMIN"}
                                                                <button
                                                                    class="mt-2 text-[9px] font-bold uppercase tracking-tight text-destructive hover:underline flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onclick={() =>
                                                                        deleteReview(
                                                                            reply.id,
                                                                        )}
                                                                >
                                                                    <Trash2Icon
                                                                        class="size-2.5 mr-1"
                                                                    /> Delete
                                                                </button>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}

                                        <!-- Reply Form -->
                                        {#if replyingTo === review.id}
                                            <div class="ml-10 pt-2">
                                                <div class="relative">
                                                    <textarea
                                                        bind:value={
                                                            replyComment
                                                        }
                                                        placeholder="Write your response as host..."
                                                        class="w-full bg-background border rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm"
                                                    ></textarea>
                                                    <div
                                                        class="mt-2 flex justify-end space-x-2"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            class="text-xs"
                                                            onclick={() =>
                                                                (replyingTo =
                                                                    null)}
                                                            >Cancel</Button
                                                        >
                                                        <Button
                                                            size="sm"
                                                            class="text-xs"
                                                            onclick={() =>
                                                                submitReply(
                                                                    review.id,
                                                                )}
                                                            disabled={submittingReply}
                                                        >
                                                            {#if submittingReply}
                                                                <Loader2Icon
                                                                    class="size-3 mr-2 animate-spin"
                                                                />
                                                            {/if}
                                                            Post Reply
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
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
                                    {placemark.user.profile.first_name?.[0]}. {placemark
                                        .user.profile.last_name}
                                </p>
                                <p class="text-xs text-muted-foreground">
                                    Verified Host
                                </p>
                            </div>
                        </div>

                        {#if placemark.user.profile.contact_email || placemark.user.profile.contact_phone}
                            <div class="pt-4 border-t space-y-3">
                                <p
                                    class="text-xs font-bold uppercase text-muted-foreground tracking-widest"
                                >
                                    Contact Information
                                </p>

                                {#if placemark.user.profile.contact_email}
                                    <div class="flex items-center text-sm">
                                        <div
                                            class="size-6 rounded bg-primary/5 flex items-center justify-center mr-3 text-primary"
                                        >
                                            <GlobeIcon class="size-3.5" />
                                        </div>
                                        <a
                                            href="mailto:{placemark.user.profile
                                                .contact_email}"
                                            class="hover:underline font-medium"
                                        >
                                            {placemark.user.profile
                                                .contact_email}
                                        </a>
                                    </div>
                                {/if}

                                {#if placemark.user.profile.contact_phone}
                                    <div class="flex items-center text-sm">
                                        <div
                                            class="size-6 rounded bg-primary/5 flex items-center justify-center mr-3 text-primary"
                                        >
                                            <GlobeIcon class="size-3.5" />
                                        </div>
                                        <p class="font-medium">
                                            {placemark.user.profile
                                                .contact_phone}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <p
                                class="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-dashed text-center"
                            >
                                Direct contact info not shared.
                            </p>
                        {/if}
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
