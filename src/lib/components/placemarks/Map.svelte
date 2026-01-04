<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import * as maptilersdk from "@maptiler/sdk";
    import "@maptiler/sdk/dist/maptiler-sdk.css";

    let {
        apiKey,
        lat,
        lng,
        zoom = 14,
    } = $props<{
        apiKey: string;
        lat: number;
        lng: number;
        zoom?: number;
    }>();

    let mapContainer: HTMLElement;
    let map: maptilersdk.Map;

    onMount(() => {
        maptilersdk.config.apiKey = apiKey;

        map = new maptilersdk.Map({
            container: mapContainer,
            style: maptilersdk.MapStyle.STREETS,
            center: [lng, lat],
            zoom: zoom,
        });

        new maptilersdk.Marker({ color: "#FF0000" })
            .setLngLat([lng, lat])
            .addTo(map);
    });

    onDestroy(() => {
        if (map) map.remove();
    });
</script>

<div bind:this={mapContainer} class="w-full h-full"></div>

<style>
    /* Ensure the map container takes up the full size of its parent */
    div {
        width: 100%;
        height: 100%;
    }
</style>
