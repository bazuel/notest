<script lang="ts">
  import {NTSession} from '@notest/common'
  import {http} from "../shared/services/http.service";
  import {createEventDispatcher, onMount} from "svelte";
  import {getUrlImage} from "../functions/url.functions";

  export let sessions: NTSession[] = []
  export let title: String = "";

  export const dispatcher = createEventDispatcher()

  let imageList: string[] = []

  onMount(async () => {
    imageList = sessions.map(session => getUrlImage(session.reference));
  })

  let onSessionClick = (reference) => dispatcher('session-selected', {reference})
</script>

<div class="nt-session-panel-container">
    <h4 class="nt-h4">{title}</h4>
    <div class="nt-panel-session-list-container scrollbar-sm">
        {#each sessions as session, i}
            <div class="nt-panel-session-container">
                <h4 class="nt-h4 nt-session-title-container" title={session.info.title}>{session.info.title}</h4>
                {#if imageList[i]}
                    <div class="nt-preview-image nt-preview-session-image-container"
                         on:mouseup={() => onSessionClick(session.reference)}>
                        <img src={imageList[i]} alt=""/>
                    </div>
                {:else }
                    <div class="bo-loading nt-preview-image nt-center"
                         on:mouseup={() => onSessionClick(session.reference)}></div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
  @import "/app.scss";

  .nt-preview-image {
    @apply w-64 h-28 rounded-md shadow-lg overflow-hidden cursor-pointer;
  }

  .nt-session-panel-container {
    @apply shadow-md p-2;
  }

  .nt-panel-session-list-container {
    @apply flex flex-row overflow-auto w-full;
  }

  .nt-panel-session-container {
    @apply relative flex flex-col m-4;
  }

  .nt-session-title-container {
    @apply truncate w-56;
  }

  .nt-preview-session-image-container {
    @apply flex items-center justify-items-center;
  }

</style>