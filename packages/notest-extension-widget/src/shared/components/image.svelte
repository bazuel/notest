<script lang="ts">
  import {onMount} from 'svelte';
  import {http} from "../services/http.service";
  import {getPathImage} from "../../functions/url.functions";

  export let reference: string;
  export let name: string;
  export let url: string;

  let base64Data: string;
  let loaded = false;

  onMount(async () => {
    if (reference) {
      const url = getPathImage(reference)
      const response = await http.get(url)
      base64Data = response.data
    }
    loaded = true
  })
</script>

{#if loaded}
  {#if base64Data}
    <img class="w-full h-full" src="{base64Data}" alt="{name}"/>
  {:else}
    <img height="10" src="{url}" alt="{name}"/>
  {/if}
{/if}