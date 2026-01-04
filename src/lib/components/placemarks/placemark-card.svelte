<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import { MapPinIcon, UserIcon, EyeIcon, TagIcon } from "@lucide/svelte";

    interface Placemark {
        id: string;
        name: string;
        description?: string;
        street: string;
        city: string;
        country: string;
        image_url?: string;
        view_count: number;
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
</script>

<Card.Root
    class="overflow-hidden hover:shadow-lg transition-shadow duration-300"
>
    {#if placemark.image_url}
        <img
            src={placemark.image_url}
            alt={placemark.name}
            class="w-full h-48 object-cover"
        />
    {:else}
        <div class="w-full h-48 bg-muted flex items-center justify-center">
            <MapPinIcon class="h-12 w-12 text-muted-foreground/50" />
        </div>
    {/if}
    <Card.Header class="p-4">
        <div class="flex items-center justify-between mb-2">
            <div
                class="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider"
            >
                <TagIcon class="h-3 w-3" />
                <span>{placemark.category.name}</span>
            </div>
            <div class="flex items-center text-muted-foreground text-xs">
                <EyeIcon class="h-3.3 w-3.3 mr-1" />
                {placemark.view_count}
            </div>
        </div>
        <Card.Title class="text-xl line-clamp-1">{placemark.name}</Card.Title>
        <Card.Description class="flex items-center mt-1 text-xs">
            <MapPinIcon class="h-3 w-3 mr-1 text-primary" />
            {placemark.street}, {placemark.city}
        </Card.Description>
    </Card.Header>
    <Card.Content class="px-4 pb-4 pt-0">
        {#if placemark.description}
            <p class="text-sm text-muted-foreground line-clamp-2 mb-4">
                {placemark.description}
            </p>
        {/if}
        <div class="flex items-center justify-between pt-4 border-t">
            <div class="flex items-center space-x-2">
                <div
                    class="h-6 w-6 rounded-full bg-muted flex items-center justify-center"
                >
                    <UserIcon class="h-3 w-3 text-muted-foreground" />
                </div>
                <span class="text-xs font-medium">
                    {placemark.user.profile.first_name}
                    {placemark.user.profile.last_name}
                </span>
            </div>
            <a
                href="/placemarks/{placemark.id}"
                class="text-xs font-semibold text-primary hover:underline"
            >
                View Details
            </a>
        </div>
    </Card.Content>
</Card.Root>
