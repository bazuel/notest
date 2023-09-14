<script lang='ts'>
  import Icon from '../shared/components/icon.svelte';
  import Sidebar from './Sidebar.svelte';
  import Highlighter from '../shared/components/highlighter.svelte';
  import { extensionService } from '../services/extension.service';
  import { beforeUpdate, onMount } from 'svelte';
  import { appStore, updateSessionSaved, updateSidebarState } from '../stores/settings.store';
  import ElementsSelector from '../shared/components/elements-selector.svelte';
  import { capture } from '../shared/services/screenshot.service';
  import {initSessionStore, updateSessionImages, updateSessionTargetList} from '../stores/session.store';
  import { messageService } from '../services/message.service';

  let openSidebar = false;
  let recording;
  let enableElementsSelector = false;
  let enableHighlighter = false;
  let sidebarButtonHovered = false;

  messageService.waitForMessage<string>('screenshot-saved').then(async (reference) => {
    extensionService.saveReference(reference);
    updateSessionImages({reference,name:''});
  });

  onMount(() => {
    recording = extensionService.recording;
    updateSidebarState('start');
    addEventListener('message', (m) => {
      if (m.data.type === 'start-recording-from-extension') {
        startRecording();
      }
    });
  });

  beforeUpdate(() => {
    recording = extensionService.recording;
  });

  let startRecording = () => {
    openSidebar = false;
    updateSessionSaved(false);
    initSessionStore();
    extensionService.start($appStore.isLoginSession);
  };
  let cancelRecording = () => {
    recording = false;
    extensionService.cancel();
  };
  let stopRecording = async () => {
    recording = false;
    await extensionService.stop();
    updateSidebarState('end');
    openSidebar = true;
  };
  let startHighlighter = () => {
    enableHighlighter = true;
    openSidebar = false;
  };
  let stopHighlighter = async (e) => {
    updateSessionTargetList(e.detail.getBoundingClientRect());
    capture(e.detail, e.detail.getBoundingClientRect()).then(data => updateSessionImages(data.url));
    enableHighlighter = false;
    openSidebar = true;
    updateSidebarState('end');
  };
  let startElementsSelector = () => {
    enableElementsSelector = true;
    openSidebar = false;
  };
  let stopElementsSelector = async (e) => {
    const elements: HTMLElement[] = e.detail.targetList;
    const rects = elements.map(el => el.getBoundingClientRect());
    capture(elements, e.detail.rect).then(data => updateSessionImages(data.url));
    updateSessionTargetList(rects);
    enableElementsSelector = false;
    openSidebar = true;
    updateSidebarState('end');
  };
</script>

<!--<svelte:head>-->
<!--  <link href="https://fonts.googleapis.com/css?family=Anton" rel="stylesheet">-->
<!--  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap%27" rel="stylesheet">-->
<!--</svelte:head>-->
<div class='--nt-extension fixed --nt-widget flex flex-row'>
  {#if openSidebar}
    <Sidebar
      state={$appStore.sidebarState}
      on:start-recording={startRecording}
      on:close-sidebar={() => openSidebar = false}
      on:highlighter={startHighlighter}
      on:selector={startElementsSelector} />
  {/if}
  {#if recording}
    <div on:mouseup={cancelRecording} class='bo-icon cancel-button'>
      <Icon color='gray' class='w-4 h-4' name='cancel' />
    </div>
    <div on:mouseup={stopRecording} class='bo-icon stop-button'>
      <Icon color='gray' class='w-4 h-4' name='stop' />
    </div>
  {:else}
    {#if $appStore.recButtonOnScreen}
      <div on:mouseup={startRecording} class:out={sidebarButtonHovered} title='Start recording (Ctrl+Shift+Q)'
           class='bo-icon start-button'>
        <Icon color='gray' class='w-4 h-4' name='start' />
      </div>
    {/if}
    <div on:mouseup={() => openSidebar = !openSidebar}
         on:mouseenter={() => sidebarButtonHovered = true}
         on:mouseleave={() => sidebarButtonHovered = false}
         class='sidebar-button'>
      <Icon color='gray' name='arrowLeft' />
    </div>
  {/if}
</div>
{#if enableElementsSelector}
  <ElementsSelector on:selecting-ended={stopElementsSelector}></ElementsSelector>
{/if}
{#if enableHighlighter}
  <Highlighter on:target-selected={stopHighlighter}></Highlighter>
{/if}

<style lang='scss'>

  .start-button {
    @apply cursor-pointer absolute bottom-[-7px] right-11 w-10 h-10;
    &.out {
      animation: vanish 100s;
    }
  }

  .stop-button {
    @apply cursor-pointer absolute right-2 bottom-1 w-10 h-10;
  }

  .cancel-button {
    @apply cursor-pointer absolute right-2 w-10 h-10;
  }

  .sidebar-button {
    @apply -mr-8 hover:mr-0 pl-0.5 hover:pl-3 duration-200 cursor-pointer w-14 h-12;
    @apply transition-all duration-300 ease-in-out;
    @apply bg-gray-100 shadow-md shadow-gray-400 hover:shadow-md rounded-l-full;
    @apply flex items-center;
  }

  .--nt-widget {
    z-index: 10001;
    @apply top-1/2 right-0;
  }

  @keyframes vanish {
    0% {
      opacity: 1;
    }
    0.3% {
      opacity: 0;
    }
  }

</style>
