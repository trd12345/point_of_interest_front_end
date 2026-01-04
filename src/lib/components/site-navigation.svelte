<script lang="ts">
    import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { cn } from "$lib/utils.js";
    import { page } from "$app/state";
    import {
        MapIcon,
        BookOpenIcon,
        CommandIcon,
        PlusIcon,
        LifeBuoyIcon,
        SendIcon,
        ChevronDownIcon,
        MenuIcon,
    } from "@lucide/svelte";
    import { userState } from "$lib/user-state.svelte";
    import UserAccountNav from "./user-account-nav.svelte";

    const navItems = [
        {
            title: "Placemarks",
            href: "/placemarks",
            icon: MapIcon,
        },
        {
            title: "Categories",
            href: "/categories",
            icon: BookOpenIcon,
        },
    ];

    const secondaryItems = [
        {
            title: "Support",
            href: "#",
            icon: LifeBuoyIcon,
            description: "Get help with your camping spots.",
        },
        {
            title: "Feedback",
            href: "#",
            icon: SendIcon,
            description: "Share your thoughts with us.",
        },
    ];
</script>

{#snippet ListItem(href: string, title: string, description: string)}
    <li>
        <NavigationMenu.Link>
            {#snippet child({ props })}
                <a
                    {href}
                    {...props}
                    class={cn(
                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                        props.class as string,
                    )}
                >
                    <div class="text-sm font-medium leading-none">{title}</div>
                    <p
                        class="text-muted-foreground line-clamp-2 text-sm leading-snug"
                    >
                        {description}
                    </p>
                </a>
            {/snippet}
        </NavigationMenu.Link>
    </li>
{/snippet}

<div
    class="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50 border-b backdrop-blur"
>
    <div class="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-8">
        <!-- Mobile Menu Mobile Menu Trigger -->
        <div class="mr-2 flex md:hidden">
            <Sheet.Root>
                <Sheet.Trigger>
                    {#snippet child({ props })}
                        <Button variant="ghost" size="icon" {...props}>
                            <MenuIcon class="size-5" />
                            <span class="sr-only">Toggle menu</span>
                        </Button>
                    {/snippet}
                </Sheet.Trigger>
                <Sheet.Content side="left" class="w-72">
                    <Sheet.Header class="px-2">
                        <Sheet.Title class="flex items-center space-x-2">
                            <CommandIcon class="size-5 text-primary" />
                            <span>CampingPOI</span>
                        </Sheet.Title>
                    </Sheet.Header>
                    <div class="mt-8 flex flex-col space-y-4">
                        <div class="flex flex-col space-y-2">
                            <h4
                                class="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                                Main
                            </h4>
                            {#each navItems as item}
                                <a
                                    href={item.href}
                                    class={cn(
                                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                        page.url.pathname.startsWith(item.href)
                                            ? "bg-accent text-primary"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    <item.icon class="size-4" />
                                    <span>{item.title}</span>
                                </a>
                            {/each}
                            {#if userState.me?.role === "ADMIN"}
                                <a
                                    href="/admin"
                                    class={cn(
                                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                        page.url.pathname.startsWith("/admin")
                                            ? "bg-accent text-primary"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    <CommandIcon class="size-4" />
                                    <span>Admin Dashboard</span>
                                </a>
                            {/if}
                        </div>
                        <div class="flex flex-col space-y-2 pt-4">
                            <h4
                                class="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                                Resources
                            </h4>
                            {#each secondaryItems as item}
                                <a
                                    href={item.href}
                                    class="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                                >
                                    <item.icon class="size-4" />
                                    <span>{item.title}</span>
                                </a>
                            {/each}
                        </div>
                        <div class="pt-6">
                            <a
                                href="/placemarks/new"
                                class={cn(
                                    buttonVariants({ variant: "default" }),
                                    "w-full justify-start",
                                )}
                            >
                                <PlusIcon class="mr-2 h-4 w-4" />
                                New Spot
                            </a>
                        </div>
                    </div>
                </Sheet.Content>
            </Sheet.Root>
        </div>

        <div class="mr-8 flex items-center space-x-2">
            <a
                href="/"
                class="flex items-center space-x-2 transition-opacity hover:opacity-90"
            >
                <div
                    class="overflow-hidden rounded-full border-2 border-primary/20 bg-white shadow-sm transition-transform hover:scale-105"
                >
                    <img
                        src="/logo.png"
                        alt="CampingPOI Logo"
                        class="size-10 object-contain sm:size-12"
                    />
                </div>
                <span
                    class="hidden text-xl font-bold tracking-tight sm:inline-block"
                    >CampingPOI</span
                >
            </a>
        </div>

        <!-- Desktop Navigation -->
        <NavigationMenu.Root class="hidden flex-1 md:flex">
            <NavigationMenu.List class="flex items-center gap-1">
                {#each navItems as item}
                    <NavigationMenu.Item>
                        <NavigationMenu.Link>
                            {#snippet child({ props })}
                                <a
                                    href={item.href}
                                    {...props}
                                    class={cn(
                                        buttonVariants({
                                            variant: "ghost",
                                            size: "default",
                                        }),
                                        "inline-flex h-10 items-center px-4",
                                        page.url.pathname.startsWith(
                                            item.href,
                                        ) &&
                                            "bg-accent/50 decoration-primary underline decoration-2 underline-offset-8",
                                        props.class as string,
                                    )}
                                >
                                    <span class="flex items-center">
                                        <item.icon class="mr-2 size-4" />
                                        {item.title}
                                    </span>
                                </a>
                            {/snippet}
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                {/each}

                {#if userState.me?.role === "ADMIN"}
                    <NavigationMenu.Item>
                        <NavigationMenu.Link>
                            {#snippet child({ props })}
                                <a
                                    href="/admin"
                                    {...props}
                                    class={cn(
                                        buttonVariants({
                                            variant: "ghost",
                                            size: "default",
                                        }),
                                        "inline-flex h-10 items-center px-4",
                                        page.url.pathname.startsWith(
                                            "/admin",
                                        ) &&
                                            "bg-accent/50 decoration-primary underline decoration-2 underline-offset-8",
                                        props.class as string,
                                    )}
                                >
                                    <span class="flex items-center">
                                        Dashboard
                                    </span>
                                </a>
                            {/snippet}
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                {/if}

                <NavigationMenu.Item>
                    <NavigationMenu.Trigger
                        class={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "default",
                            }),
                            "inline-flex h-10 items-center px-4",
                        )}
                    >
                        More
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content>
                        <ul
                            class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                        >
                            {#each secondaryItems as item}
                                {@render ListItem(
                                    item.href,
                                    item.title,
                                    item.description,
                                )}
                            {/each}
                        </ul>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>
            </NavigationMenu.List>
            <div class="absolute top-full left-0 flex justify-center">
                <NavigationMenu.Viewport
                    class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--bits-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg md:w-[var(--bits-navigation-menu-viewport-width)]"
                />
            </div>
        </NavigationMenu.Root>

        <div class="flex flex-1 items-center justify-end space-x-4">
            <nav class="flex items-center space-x-2">
                {#if userState.me}
                    <a
                        href="/placemarks/new"
                        class={cn(
                            buttonVariants({
                                variant: "default",
                                size: "default",
                            }),
                            "hidden h-10 items-center sm:flex",
                        )}
                    >
                        <PlusIcon class="mr-2 h-4 w-4" />
                        New Spot
                    </a>
                    <UserAccountNav />
                {:else}
                    <div class="flex items-center space-x-2">
                        <a
                            href="/login"
                            class={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "default",
                                }),
                                "h-10 items-center",
                            )}
                        >
                            Log in
                        </a>
                        <a
                            href="/register"
                            class={cn(
                                buttonVariants({
                                    variant: "default",
                                    size: "default",
                                }),
                                "h-10 items-center",
                            )}
                        >
                            Sign up
                        </a>
                    </div>
                {/if}
            </nav>
        </div>
    </div>
</div>
