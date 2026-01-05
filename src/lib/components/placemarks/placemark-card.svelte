<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import {
        MapPinIcon,
        UserIcon,
        EyeIcon,
        TagIcon,
        StarIcon,
    } from "@lucide/svelte";

    interface Placemark {
        id: string;
        name: string;
        description?: string;
        street: string;
        city: string;
        country: string;
        image_url?: string;
        view_count: number;
        average_rating?: number;
        review_count?: number;
        category: {
            name: string;
        };
        user: {
            profile: {
                first_name: string;
                last_name: string;
            };
        };
    }

    let { placemark }: { placemark: Placemark } = $props();

    // Helper to render star rating
    function renderStars(rating: number) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return { fullStars, hasHalfStar, emptyStars };
    }

    const stars = $derived(renderStars(placemark.average_rating || 0));
</script>

<a href="/placemarks/{placemark.id}" class="block group">
    <Card.Root
        class="overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-card shadow-sm py-0"
    >
        <div class="relative aspect-video overflow-hidden">
            {#if placemark.image_url}
                <img
                    src={placemark.image_url}
                    alt={placemark.name}
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            {:else}
                <div
                    class="w-full h-full bg-muted flex items-center justify-center"
                >
                    <MapPinIcon class="h-12 w-12 text-muted-foreground/30" />
                </div>
            {/if}
            <div class="absolute top-3 left-3">
                <div
                    class="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider"
                >
                    <TagIcon class="h-3 w-3" />
                    <span>{placemark.category.name}</span>
                </div>
            </div>
            <div class="absolute top-3 right-3">
                <div
                    class="flex items-center bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-bold"
                >
                    <EyeIcon class="h-3 w-3 mr-1" />
                    {placemark.view_count}
                </div>
            </div>
        </div>

        <Card.Header class="px-4">
            <Card.Title
                class="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors"
            >
                {placemark.name}
            </Card.Title>
            <Card.Description
                class="flex items-center text-xs font-medium text-muted-foreground"
            >
                <MapPinIcon class="h-3 w-3 mr-1 text-primary/60" />
                {placemark.city}, {placemark.country}
            </Card.Description>

            <!-- Rating Stars -->
            {#if (placemark.review_count || 0) > 0}
                <div class="flex items-center gap-1 mt-2">
                    <div class="flex items-center">
                        {#each Array(stars.fullStars) as _}
                            <StarIcon
                                class="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                            />
                        {/each}
                        {#if stars.hasHalfStar}
                            <div class="relative">
                                <StarIcon class="h-3.5 w-3.5 text-yellow-400" />
                                <div
                                    class="absolute inset-0 overflow-hidden"
                                    style="width: 50%"
                                >
                                    <StarIcon
                                        class="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                                    />
                                </div>
                            </div>
                        {/if}
                        {#each Array(stars.emptyStars) as _}
                            <StarIcon
                                class="h-3.5 w-3.5 text-muted-foreground/30"
                            />
                        {/each}
                    </div>
                    <span class="text-xs font-semibold text-foreground/70 ml-1">
                        {placemark.average_rating?.toFixed(1)}
                    </span>
                    <span class="text-xs text-muted-foreground">
                        ({placemark.review_count}
                        {placemark.review_count === 1 ? "review" : "reviews"})
                    </span>
                </div>
            {:else}
                <div class="flex items-center gap-1 mt-2">
                    <div class="flex items-center">
                        {#each Array(5) as _}
                            <StarIcon
                                class="h-3.5 w-3.5 text-muted-foreground/20"
                            />
                        {/each}
                    </div>
                    <span class="text-xs text-muted-foreground ml-1">
                        No reviews yet
                    </span>
                </div>
            {/if}
        </Card.Header>

        <Card.Content class="px-4 pb-4 pt-0">
            <div
                class="flex items-center justify-between pt-3 border-t border-border/50"
            >
                <div class="flex items-center space-x-2">
                    <div
                        class="h-7 w-7 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10"
                    >
                        <UserIcon class="h-3.5 w-3.5 text-primary/70" />
                    </div>
                    <span class="text-xs font-semibold text-foreground/80">
                        {placemark.user.profile.first_name?.[0]}. {placemark
                            .user.profile.last_name}
                    </span>
                </div>
                <div
                    class="text-[10px] font-bold uppercase tracking-tighter text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    View Spot →
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-border/50 text-center">
                <span
                    class="text-xs font-semibold text-primary hover:underline group-hover:text-primary/80 transition-colors"
                >
                    View Details
                </span>
            </div>
        </Card.Content>
    </Card.Root>
</a>
