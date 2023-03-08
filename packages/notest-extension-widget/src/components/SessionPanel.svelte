<script lang="ts">
  import {NTSession} from '@notest/common'
  import {http} from "../shared/services/http.service";
  import {createEventDispatcher, onMount} from "svelte";

  export let sessions: NTSession[] = []
  export let title: String = "";

  export const dispatcher = createEventDispatcher()

  let imageList: string[] = []

  onMount(async () => {
    imageList = await Promise.all(
      sessions.map(
        session => http.getStreamImg(`/media/screenshot-download?reference=${session.reference}&name=shot`).catch(() => '')
      )
    )
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
    @apply w-56 h-36 rounded-md shadow-lg cursor-pointer;
  }

  .nt-session-panel-container {
    @apply p-2 shadow-md h-fit;
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