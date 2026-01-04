<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Loader2Icon, UploadIcon, MapPinIcon } from "@lucide/svelte";

    let {
        categories,
        onSave,
        loading = false,
        initialData = {},
    } = $props<{
        categories: any[];
        onSave: (formData: FormData) => void;
        loading?: boolean;
        initialData?: any;
    }>();

    let name = $state(initialData.name || "");
    let description = $state(initialData.description || "");
    let categoryId = $state(initialData.categoryId || "");
    let street = $state(initialData.street || "");
    let houseNumber = $state(initialData.house_number || "");
    let zip = $state(initialData.zip || "");
    let city = $state(initialData.city || "");
    let country = $state(initialData.country || "Germany"); // Default
    let isPublic = $state(initialData.is_public ?? true);

    let imageFile = $state<File | null>(null);
    let imagePreview = $state<string | null>(initialData.image_url || null);
    let removeImage = $state(false);
    let fileInput: HTMLInputElement;

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            imageFile = file;
            removeImage = false; // Uploading a new one cancels "removal"
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e: Event) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("street", street);
        formData.append("house_number", houseNumber);
        formData.append("zip", zip.toString());
        formData.append("city", city);
        formData.append("country", country);
        formData.append("is_public", isPublic.toString());

        if (imageFile) {
            formData.append("image", imageFile);
        } else if (removeImage) {
            formData.append("removeImage", "true");
        }

        onSave(formData);
    }
</script>

<form onsubmit={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Info -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold border-b pb-2">Basic Details</h3>

            <Field.Field>
                <Field.Label for="name">Spot Name</Field.Label>
                <Input
                    id="name"
                    bind:value={name}
                    placeholder="e.g. Dreamy Garden"
                    required
                />
            </Field.Field>

            <Field.Field>
                <Field.Label for="category">Category</Field.Label>
                <select
                    id="category"
                    class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    bind:value={categoryId}
                    required
                >
                    <option value="" disabled>Select a category</option>
                    {#each categories as category (category.id)}
                        <option value={category.id}>{category.name}</option>
                    {/each}
                </select>
            </Field.Field>

            <Field.Field>
                <Field.Label for="description">Description</Field.Label>
                <textarea
                    id="description"
                    bind:value={description}
                    placeholder="Tell us about this spot..."
                    class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                ></textarea>
            </Field.Field>
        </div>

        <!-- Address Info -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold border-b pb-2">Location</h3>

            <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                    <Field.Field>
                        <Field.Label for="street">Street</Field.Label>
                        <Input id="street" bind:value={street} required />
                    </Field.Field>
                </div>
                <div>
                    <Field.Field>
                        <Field.Label for="houseNum">No.</Field.Label>
                        <Input id="houseNum" bind:value={houseNumber} />
                    </Field.Field>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <Field.Field>
                        <Field.Label for="zip">Zip Code</Field.Label>
                        <Input
                            id="zip"
                            type="number"
                            bind:value={zip}
                            required
                        />
                    </Field.Field>
                </div>
                <div class="col-span-2">
                    <Field.Field>
                        <Field.Label for="city">City</Field.Label>
                        <Input id="city" bind:value={city} required />
                    </Field.Field>
                </div>
            </div>

            <Field.Field>
                <Field.Label for="country">Country</Field.Label>
                <Input id="country" bind:value={country} required />
            </Field.Field>

            <div
                class="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-start"
            >
                <MapPinIcon class="h-4 w-4 mr-2 mt-0.5" />
                <span
                    >Geographical coordinates will be automatically calculated
                    based on the address.</span
                >
            </div>
        </div>
    </div>

    <!-- Image Upload -->
    <div class="space-y-4">
        <h3 class="text-lg font-semibold border-b pb-2">Media</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div
                class="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
                onclick={() => document.getElementById("image-upload")?.click()}
            >
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    class="hidden"
                    bind:this={fileInput}
                    onchange={handleFileChange}
                />
                <UploadIcon
                    class="mx-auto h-10 w-10 text-muted-foreground/50"
                />
                <p class="mt-2 font-medium">Click to upload image</p>
                <p class="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 5MB
                </p>
            </div>

            {#if imagePreview}
                <div class="relative group">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        class="w-full h-40 object-cover rounded-xl border shadow-sm"
                    />
                    <button
                        type="button"
                        class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onclick={() => {
                            imageFile = null;
                            imagePreview = null;
                            removeImage = true;
                            if (fileInput) fileInput.value = "";
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
                        >
                    </button>
                </div>
            {/if}
        </div>
    </div>

    <div class="flex items-center justify-between pt-6 border-t">
        <label class="flex items-center cursor-pointer space-x-2">
            <input
                type="checkbox"
                bind:checked={isPublic}
                class="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span class="text-sm font-medium">List this spot publicly</span>
        </label>

        <Button type="submit" size="lg" disabled={loading}>
            {#if loading}
                <Loader2Icon class="mr-2 h-5 w-5 animate-spin" />
                Saving Spot...
            {:else}
                Save Camping Spot
            {/if}
        </Button>
    </div>
</form>
