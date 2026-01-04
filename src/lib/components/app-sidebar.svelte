<script lang="ts" module>
    import { BookOpenIcon } from "@lucide/svelte";
    import { BotIcon } from "@lucide/svelte";
    import { ChartPieIcon } from "@lucide/svelte";
    import { FrameIcon } from "@lucide/svelte";
    import { LifeBuoyIcon } from "@lucide/svelte";
    import { MapIcon } from "@lucide/svelte";
    import { SendIcon } from "@lucide/svelte";
    import { Settings2Icon } from "@lucide/svelte";
    import { SquareTerminalIcon } from "@lucide/svelte";
    const data = {
        user: {
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
        },
        navMain: [
            {
                title: "Dashboard",
                url: "/placemarks",
                icon: MapIcon,
                isActive: true,
            },
            {
                title: "Categories",
                url: "/categories",
                icon: BookOpenIcon,
            },
        ],
        navSecondary: [
            {
                title: "Support",
                url: "#",
                icon: LifeBuoyIcon,
            },
            {
                title: "Feedback",
                url: "#",
                icon: SendIcon,
            },
        ],
        projects: [
            {
                name: "Design Engineering",
                url: "#",
                icon: FrameIcon,
            },
            {
                name: "Sales & Marketing",
                url: "#",
                icon: ChartPieIcon,
            },
            {
                name: "Travel",
                url: "#",
                icon: MapIcon,
            },
        ],
    };
</script>

<script lang="ts">
    import NavMain from "./nav-main.svelte";
    import NavProjects from "./nav-projects.svelte";
    import NavSecondary from "./nav-secondary.svelte";
    import NavUser from "./nav-user.svelte";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { CommandIcon } from "@lucide/svelte";
    import type { ComponentProps } from "svelte";
    let {
        ref = $bindable(null),
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
    <Sidebar.Header>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton size="lg">
                    {#snippet child({ props })}
                        <a href="##" {...props}>
                            <div
                                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                            >
                                <CommandIcon class="size-4" />
                            </div>
                            <div
                                class="grid flex-1 text-start text-sm leading-tight"
                            >
                                <span class="truncate font-medium"
                                    >Acme Inc</span
                                >
                                <span class="truncate text-xs">Enterprise</span>
                            </div>
                        </a>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Header>
    <Sidebar.Content>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} class="mt-auto" />
    </Sidebar.Content>
    <Sidebar.Footer>
        <NavUser />
    </Sidebar.Footer>
</Sidebar.Root>
