<script lang="ts">
    import { onMount } from "svelte";
    import { env } from "$env/dynamic/public";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import PlacemarkCard from "$lib/components/placemarks/placemark-card.svelte";
    import {
        MapIcon,
        CompassIcon,
        ShieldCheckIcon,
        UsersIcon,
        ArrowRightIcon,
        CommandIcon,
    } from "@lucide/svelte";
    import { cn } from "$lib/utils.js";
    import { userState } from "$lib/user-state.svelte";

    let publicSpots = $state<any[]>([]);
    let loading = $state(true);

    async function fetchPublicSpots() {
        try {
            const response = await fetch(`${env.PUBLIC_API_URL}/placemarks`);
            if (response.ok) {
                const result = await response.json();
                // Just take the first 4 for the landing page
                publicSpots = result.data.placemarks?.slice(0, 4) || [];
            }
        } catch (error) {
            console.error("Failed to fetch public spots:", error);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchPublicSpots();
    });
</script>

<div class="flex flex-col">
    <!-- Hero Section -->
    <section
        class="relative h-[90vh] flex items-center justify-center overflow-hidden"
    >
        <div class="absolute inset-0 z-0">
            <img
                src="/hero-bg.png"
                alt="Beautiful Camping Spot"
                class="w-full h-full object-cover scale-105 animate-subtle-zoom"
            />
            <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div
            class="relative z-10 max-w-5xl mx-auto px-4 text-center text-white"
        >
            <div
                class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6 animate-fade-in-down"
            >
                <CompassIcon class="size-4 text-primary-foreground" />
                <span class="text-xs font-semibold tracking-wider uppercase"
                    >Your next adventure awaits</span
                >
            </div>
            <h1
                class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in"
            >
                Discover the World's <br />
                <span
                    class="text-transparent bg-clip-text bg-gradient-to-r from-primary-foreground to-blue-200"
                    >Hidden Camping Gems</span
                >
            </h1>
            <p
                class="text-lg md:text-xl text-zinc-100 max-w-2xl mx-auto mb-10 animate-fade-in opacity-90"
            >
                Join our community of outdoor enthusiasts. Share your favorite
                spots, explore unique locations, and plan your perfect escape
                into nature.
            </p>
            <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            >
                {#if userState.me}
                    <a
                        href="/placemarks"
                        class={cn(
                            buttonVariants({ size: "lg" }),
                            "w-full sm:w-auto text-lg px-8",
                        )}
                    >
                        Go to Placemarks
                        <ArrowRightIcon class="ml-2 size-5" />
                    </a>
                {:else}
                    <a
                        href="/register"
                        class={cn(
                            buttonVariants({ size: "lg" }),
                            "w-full sm:w-auto text-lg px-8",
                        )}
                    >
                        Start Exploring
                        <ArrowRightIcon class="ml-2 size-5" />
                    </a>
                    <a
                        href="/login"
                        class={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "w-full sm:w-auto bg-white/5 backdrop-blur-sm border-white/20 text-lg px-8 hover:bg-white/10",
                        )}
                    >
                        Sign In
                    </a>
                {/if}
            </div>
        </div>
    </section>

    <!-- The Mission Section -->
    <section class="py-24 bg-zinc-950 text-white overflow-hidden relative">
        <div
            class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-96 bg-primary/20 blur-[120px] rounded-full"
        ></div>
        <div
            class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-96 bg-blue-500/10 blur-[120px] rounded-full"
        ></div>

        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2
                        class="text-3xl md:text-5xl font-bold mb-8 italic leading-tight"
                    >
                        Sharing the <span class="text-primary">Wilderness</span
                        >,<br />
                        One Night at a Time.
                    </h2>
                    <div
                        class="space-y-6 text-zinc-400 text-lg leading-relaxed"
                    >
                        <p>
                            CampingPOI is built on the spirit of outdoor
                            hospitality. We connect generous land owners with
                            travelers looking for a safe, natural place to rest
                            during their journey.
                        </p>
                        <p>
                            Think of it as <span
                                class="text-white font-semibold"
                                >Couchsurfing for the great outdoors</span
                            >. No money changes hands, no commercial services
                            are traded—just a shared passion for nature and a
                            commitment to protecting it.
                        </p>
                    </div>

                    <div class="mt-12 flex flex-wrap gap-4">
                        <div
                            class="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <div
                                class="size-2 bg-emerald-500 rounded-full"
                            ></div>
                            <span class="text-sm font-medium"
                                >100% Free Stays</span
                            >
                        </div>
                        <div
                            class="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <div class="size-2 bg-blue-500 rounded-full"></div>
                            <span class="text-sm font-medium"
                                >Community Verified</span
                            >
                        </div>
                    </div>
                </div>

                <div
                    class="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <h3 class="text-2xl font-bold mb-8 flex items-center">
                        <ShieldCheckIcon class="mr-3 text-primary size-6" />
                        The CampingPOI Way
                    </h3>

                    <ul class="space-y-6">
                        <li class="flex items-start">
                            <div
                                class="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-4 mt-1 shrink-0"
                            >
                                1
                            </div>
                            <div>
                                <h4 class="font-bold text-white">
                                    One Night Only
                                </h4>
                                <p class="text-sm text-zinc-500 mt-1">
                                    Our spots are meant for a single night's
                                    rest during your travels, not for long-term
                                    vacations.
                                </p>
                            </div>
                        </li>
                        <li class="flex items-start">
                            <div
                                class="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-4 mt-1 shrink-0"
                            >
                                2
                            </div>
                            <div>
                                <h4 class="font-bold text-white">
                                    Always Connect First
                                </h4>
                                <p class="text-sm text-zinc-500 mt-1">
                                    Most spots are on private land. Respect your
                                    hosts by reaching out and verifying
                                    availability in advance.
                                </p>
                            </div>
                        </li>
                        <li class="flex items-start">
                            <div
                                class="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-4 mt-1 shrink-0"
                            >
                                3
                            </div>
                            <div>
                                <h4 class="font-bold text-white">
                                    Leave No Trace
                                </h4>
                                <p class="text-sm text-zinc-500 mt-1">
                                    Protect the beauty of our world. Leave every
                                    spot cleaner than you found it. Respect is
                                    our only currency.
                                </p>
                            </div>
                        </li>
                        <li class="flex items-start">
                            <div
                                class="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-4 mt-1 shrink-0"
                            >
                                4
                            </div>
                            <div>
                                <h4 class="font-bold text-white">
                                    Purely Social
                                </h4>
                                <p class="text-sm text-zinc-500 mt-1">
                                    We prohibit any exchange of money, services,
                                    or advertising. This is hospitality in its
                                    purest form.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-background">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 italic">
                    Why CampingPOI?
                </h2>
                <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="flex flex-col items-center text-center group">
                    <div
                        class="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform"
                    >
                        <MapIcon class="size-8" />
                    </div>
                    <h3 class="text-xl font-bold mb-3">Curated Locations</h3>
                    <p class="text-muted-foreground">
                        Find high-quality camping spots verified by our
                        passionate community of travelers.
                    </p>
                </div>
                <div class="flex flex-col items-center text-center group">
                    <div
                        class="size-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform"
                    >
                        <ShieldCheckIcon class="size-8" />
                    </div>
                    <h3 class="text-xl font-bold mb-3">Trusted Reviews</h3>
                    <p class="text-muted-foreground">
                        Get authentic insights and photos from real campers who
                        have visited the locations.
                    </p>
                </div>
                <div class="flex flex-col items-center text-center group">
                    <div
                        class="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 transition-transform"
                    >
                        <UsersIcon class="size-8" />
                    </div>
                    <h3 class="text-xl font-bold mb-3">Global Community</h3>
                    <p class="text-muted-foreground">
                        Connect with like-minded explorers and share your unique
                        discoveries with the world.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Public Spots Preview -->
    <section class="py-24 bg-zinc-50 border-y">
        <div class="max-w-7xl mx-auto px-4">
            <div
                class="flex flex-col md:flex-row items-end justify-between mb-12 gap-6"
            >
                <div class="max-w-2xl">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">
                        Explore Trending Spots
                    </h2>
                    <p class="text-muted-foreground">
                        A small selection of the amazing locations our community
                        is currently excited about.
                    </p>
                </div>
                <a
                    href="/placemarks"
                    class={cn(
                        buttonVariants({ variant: "ghost" }),
                        "text-primary hover:text-primary/80 font-semibold group",
                    )}
                >
                    View All Public Spots
                    <ArrowRightIcon
                        class="ml-1 size-4 group-hover:translate-x-1 transition-transform"
                    />
                </a>
            </div>

            {#if loading}
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {#each Array(4) as _}
                        <div
                            class="h-64 bg-zinc-200 rounded-xl animate-pulse"
                        ></div>
                    {/each}
                </div>
            {:else if publicSpots.length > 0}
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {#each publicSpots as spot}
                        <PlacemarkCard placemark={spot} />
                    {/each}
                </div>
            {:else}
                <div
                    class="text-center py-20 bg-white rounded-2xl border-2 border-dashed"
                >
                    <p class="text-muted-foreground">
                        No public spots available yet. Be the first to share
                        one!
                    </p>
                    <a
                        href="/placemarks/new"
                        class={cn(buttonVariants({ size: "sm" }), "mt-4")}
                    >
                        Add New Spot
                    </a>
                </div>
            {/if}
        </div>
    </section>

    <!-- Call to Action -->
    <section class="py-24">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-5xl font-bold mb-6 italic">
                Ready to start your journey?
            </h2>
            <p class="text-lg text-muted-foreground mb-10">
                Sign up today and join thousands of campers who are already
                discovering and sharing incredible spots around the globe.
            </p>
            <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <a
                    href="/register"
                    class={cn(
                        buttonVariants({ size: "xl" }),
                        "w-full sm:w-auto px-12 py-8 text-xl rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform",
                    )}
                >
                    Create Free Account
                </a>
            </div>
        </div>
    </section>

    <footer class="py-12 border-t bg-background">
        <div
            class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <div class="flex items-center space-x-3">
                <div
                    class="overflow-hidden rounded-full p-0.5 border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm"
                >
                    <img
                        src="/logo.png"
                        alt="CampingPOI Logo"
                        class="size-8 object-contain"
                    />
                </div>
                <span class="font-bold text-xl tracking-tight">CampingPOI</span>
            </div>
            <p class="text-sm text-muted-foreground">
                &copy; 2026 CampingPOI Inc. All rights reserved.
            </p>
            <div class="flex items-center space-x-6">
                <a
                    href="#"
                    class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >Privacy Policy</a
                >
                <a
                    href="#"
                    class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >Terms of Service</a
                >
            </div>
        </div>
    </footer>
</div>

<style>
    :global(.animate-subtle-zoom) {
        animation: subtle-zoom 20s infinite alternate ease-in-out;
    }

    @keyframes subtle-zoom {
        from {
            transform: scale(1.05);
        }
        to {
            transform: scale(1.15);
        }
    }

    .animate-fade-in {
        animation: fade-in 1s ease-out forwards;
    }

    .animate-fade-in-down {
        animation: fade-in-down 0.8s ease-out forwards;
    }

    .animate-fade-in-up {
        animation: fade-in-up 0.8s ease-out forwards;
    }

    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes fade-in-down {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fade-in-up {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
