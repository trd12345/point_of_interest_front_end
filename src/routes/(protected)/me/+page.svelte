<script lang="ts">
    import { userState } from "$lib/user-state.svelte";
    import { env } from "$env/dynamic/public";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let firstName = $state(userState.me?.profile.first_name || "");
    let lastName = $state(userState.me?.profile.last_name || "");
    let email = $state(userState.me?.email || "");
    let email_verified_at = $state(userState.me?.email_verified_at || null);

    let currentPassword = $state("");
    let newPassword = $state("");
    let confirmPassword = $state("");

    let profileLoading = $state(false);
    let profileSuccess = $state(false);
    let emailChangeRequested = $state(false);
    let profileError = $state<string[]>([]);

    let passwordLoading = $state(false);
    let passwordSuccess = $state(false);
    let passwordError = $state<string[]>([]);

    let deleteLoading = $state(false);

    async function handleUpdateProfile(e: Event) {
        e.preventDefault();
        profileLoading = true;
        profileSuccess = false;
        emailChangeRequested = false;
        profileError = [];

        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(`${env.PUBLIC_API_URL}/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                }),
            });

            const res = await response.json();

            if (response.ok) {
                profileSuccess = true;
                emailChangeRequested = res.data.emailChangeRequested;
                userState.me = res.data.user;
                email_verified_at = userState.me?.email_verified_at || null;
            } else {
                // Handle Zod structure or generic errors
                if (res.errors) {
                    profileError = Object.values(res.errors).flat() as string[];
                } else {
                    profileError = [res.message || "Failed to update profile"];
                }
            }
            console.log(email_verified_at);
        } catch (error) {
            profileError = ["An unexpected error occurred."];
        } finally {
            profileLoading = false;
        }
    }

    async function handleChangePassword(e: Event) {
        e.preventDefault();
        // ... (rest of the code stays same, but I need to include it in the replacement chunk)
        if (newPassword !== confirmPassword) {
            passwordError = ["Passwords do not match."];
            return;
        }

        passwordLoading = true;
        passwordSuccess = false;
        passwordError = [];

        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(
                `${env.PUBLIC_API_URL}/auth/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        old_password: currentPassword,
                        new_password: newPassword,
                    }),
                },
            );

            const res = await response.json();

            if (response.ok) {
                passwordSuccess = true;
                currentPassword = "";
                newPassword = "";
                confirmPassword = "";
            } else {
                passwordError = res.errors || [
                    res.message || "Failed to change password",
                ];
            }
        } catch (error) {
            passwordError = ["An unexpected error occurred."];
        } finally {
            passwordLoading = false;
        }
    }

    async function handleDeleteAccount() {
        if (
            !confirm(
                "Are you sure you want to delete your account? This action cannot be undone.",
            )
        ) {
            return;
        }

        deleteLoading = true;
        try {
            const token = localStorage.getItem("poi_access");
            const response = await fetch(`${env.PUBLIC_API_URL}/auth/me`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem("poi_access");
                userState.me = null;
                goto("/login");
            } else {
                alert("Failed to delete account.");
            }
        } catch (error) {
            alert("An unexpected error occurred.");
        } finally {
            deleteLoading = false;
        }
    }

    // Sync initial state if userState changes
    $effect(() => {
        if (userState.me) {
            firstName = userState.me.profile.first_name;
            lastName = userState.me.profile.last_name;
            email = userState.me.email;
            email_verified_at = userState.me.email_verified_at;
            console.log(email_verified_at);
        }
    });
</script>

<div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-3xl font-bold tracking-tight">Profile Settings</h1>

    <div class="grid gap-6">
        <!-- Profile Information Card -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Profile Information</Card.Title>
                <Card.Description
                    >Update your personal details.</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <form onsubmit={handleUpdateProfile} class="space-y-4">
                    {#if profileSuccess}
                        <div
                            class="p-3 text-sm text-green-700 bg-green-100 rounded-md"
                        >
                            {emailChangeRequested
                                ? "Profile updated! A verification link has been sent to your new email address. Your email will be updated once you confirm it."
                                : "Profile updated successfully!"}
                        </div>
                    {/if}
                    {#if profileError.length > 0}
                        <div
                            class="p-3 text-sm text-red-700 bg-red-100 rounded-md"
                        >
                            <ul class="list-disc list-inside">
                                {#each profileError as error}
                                    <li>{error}</li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field.Field>
                            <Field.Label for="firstName">First Name</Field.Label
                            >
                            <Input
                                id="firstName"
                                bind:value={firstName}
                                required
                            />
                        </Field.Field>
                        <Field.Field>
                            <Field.Label for="lastName">Last Name</Field.Label>
                            <Input
                                id="lastName"
                                bind:value={lastName}
                                required
                            />
                        </Field.Field>
                    </div>

                    <Field.Field>
                        <Field.Label for="email">Email</Field.Label>
                        <Input
                            id="email"
                            type="email"
                            bind:value={email}
                            required
                        />
                        <Field.Description>
                            {#if !email_verified_at}
                                Please verify your email
                            {:else}
                                Changing your email will require verification.
                            {/if}
                        </Field.Description>
                    </Field.Field>

                    <Card.Footer class="px-0 pt-4">
                        <Button type="submit" disabled={profileLoading}>
                            {profileLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </Card.Footer>
                </form>
            </Card.Content>
        </Card.Root>

        <!-- Security Card -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Security</Card.Title>
                <Card.Description
                    >Change your password to keep your account secure.</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <form onsubmit={handleChangePassword} class="space-y-4">
                    {#if passwordSuccess}
                        <div
                            class="p-3 text-sm text-green-700 bg-green-100 rounded-md"
                        >
                            Password changed successfully!
                        </div>
                    {/if}
                    {#if passwordError.length > 0}
                        <div
                            class="p-3 text-sm text-red-700 bg-red-100 rounded-md"
                        >
                            <ul class="list-disc list-inside">
                                {#each passwordError as error}
                                    <li>{error}</li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                    <Field.Field>
                        <Field.Label for="currentPassword"
                            >Current Password</Field.Label
                        >
                        <Input
                            id="currentPassword"
                            type="password"
                            bind:value={currentPassword}
                            required
                        />
                    </Field.Field>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field.Field>
                            <Field.Label for="newPassword"
                                >New Password</Field.Label
                            >
                            <Input
                                id="newPassword"
                                type="password"
                                bind:value={newPassword}
                                required
                            />
                        </Field.Field>
                        <Field.Field>
                            <Field.Label for="confirmPassword"
                                >Confirm New Password</Field.Label
                            >
                            <Input
                                id="confirmPassword"
                                type="password"
                                bind:value={confirmPassword}
                                required
                            />
                        </Field.Field>
                    </div>

                    <Card.Footer class="px-0 pt-4">
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={passwordLoading}
                        >
                            {passwordLoading
                                ? "Changing..."
                                : "Change Password"}
                        </Button>
                    </Card.Footer>
                </form>
            </Card.Content>
        </Card.Root>

        <!-- Danger Zone Card -->
        <Card.Root class="border-destructive">
            <Card.Header>
                <Card.Title class="text-destructive">Danger Zone</Card.Title>
                <Card.Description
                    >Permanently delete your account and all associated data.</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <p class="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                </p>
                <Button
                    variant="destructive"
                    onclick={handleDeleteAccount}
                    disabled={deleteLoading}
                >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                </Button>
            </Card.Content>
        </Card.Root>
    </div>
</div>
