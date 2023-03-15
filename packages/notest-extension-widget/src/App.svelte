<script lang="ts">
    import Icon from './shared/components/icon.svelte';
    import Sidebar from "./components/Sidebar.svelte";
    import Highlighter from "./shared/components/Highlighter.svelte";
    import {recordingService} from "./services/recording.service";
    import {beforeUpdate, onMount} from "svelte";
    import {appStore, updateLoginSession, updateSessionSaved, updateSidebarState} from "./stores/settings.store";
    import ElementsSelector from './shared/components/elements-selector.svelte';
    import {capture} from "./shared/services/screenshot.service";
    import {http} from "./shared/services/http.service";

    let openSidebar = false;
    let recording;
    let sessionInfo: {
        title: string,
        description: string,
        targetList: DOMRect[],
        imgUrls: string[],
        images: { timestamp: Date, data: Blob, name: string }[],
        isLogin: boolean
    } = {
        title: "",
        description: "",
        targetList: [],
        imgUrls: [],
        images: [],
        isLogin: false
    };
    let enableElementsSelector = false;
    let enableHighlighter = false

    onMount(() => {
        recording = recordingService.recording
        sessionInfo.isLogin = $appStore.isLoginSession
        updateSidebarState('start');
        addEventListener('message', (m) => {
            if (m.data.type === 'start-recording-from-extension')
                startRecording();
        });
    })
    beforeUpdate(() => {
        recording = recordingService.recording;
    })

    let startRecording = () => {
        openSidebar = false;
        updateSessionSaved(false);
        recordingService.start();
    };
    let cancelRecording = () => {
        recording = false
        recordingService.cancel()
    };
    let stopRecording = async () => {
        recording = false
        recordingService.stop()
        http.getStreamImg(`/media/screenshot-download?reference=${recordingService.reference}&name=shot`).then((url) => {
            sessionInfo.imgUrls.push(url);
            sessionInfo = JSON.parse(JSON.stringify(sessionInfo));
        })
        updateSidebarState('end');
        openSidebar = true;
    };
    let startHighlighter = () => {
        enableHighlighter = true
        openSidebar = false
    }
    let stopHighlighter = async (e) => {
        sessionInfo.targetList.push(e.detail.getBoundingClientRect())
        capture(e.detail, e.detail.getBoundingClientRect()).then(data => {
            sessionInfo.imgUrls.push(data.url);
            sessionInfo = JSON.parse(JSON.stringify(sessionInfo));
        })
        enableHighlighter = false
        openSidebar = true
        updateSidebarState('end');
    }
    let startElementsSelector = () => {
        enableElementsSelector = true
        openSidebar = false
    }
    let stopElementsSelector = async (e) => {
        const elements: HTMLElement[] = e.detail.targetList
        const rects = elements.map(el => el.getBoundingClientRect())
        capture(elements, e.detail.rect).then(data => {
            sessionInfo.imgUrls.push(data.url);
            sessionInfo = JSON.parse(JSON.stringify(sessionInfo));
        })
        sessionInfo.targetList = [...sessionInfo.targetList, ...rects]
        enableElementsSelector = false
        openSidebar = true
        updateSidebarState('end');
    }
    let saveSession = (info) => {
        sessionInfo = info
        recordingService.save({
            title: info.title,
            description: info.description,
            targetList: info.targetList,
            isLogin: info.isLogin,
            reference: recordingService.reference,
            loginReference: info.loginReference,
        })
        sessionInfo.isLogin = false;
        updateLoginSession(false);
    }
</script>


<div class="--nt-extension fixed --nt-widget flex flex-row">
    {#if openSidebar}
        <Sidebar
                sessionInfo={sessionInfo}
                state={$appStore.sidebarState}
                on:save-session={(e) => saveSession(e.detail)}
                on:start-recording={startRecording}
                on:close-sidebar={() => openSidebar = false}
                on:highlighter={startHighlighter}
                on:selector={startElementsSelector}/>
    {/if}
    {#if recording}
        <div on:mouseup={cancelRecording} class="bo-icon cancel-button">
            <Icon color="gray" class="w-4 h-4" name="cancel"/>
        </div>
        <div on:mouseup={stopRecording} class="bo-icon stop-button">
            <Icon color="gray" class="w-4 h-4" name="stop"/>
        </div>
    {:else}
        {#if $appStore.recButtonOnScreen}
            <div on:mouseup={startRecording} title="Start recording (Ctrl+Shift+Q)" class="bo-icon start-button">
                <Icon color="gray" class="w-4 h-4" name="start"/>
            </div>
        {/if}
        <div on:mouseup={() => openSidebar = !openSidebar}
             class="sidebar-button">
            <Icon color=gray name="arrowLeft"/>
        </div>
    {/if}
</div>
{#if enableElementsSelector}
    <ElementsSelector on:selecting-ended={stopElementsSelector}></ElementsSelector>
{/if}
{#if enableHighlighter}
    <Highlighter on:target-selected={stopHighlighter}></Highlighter>
{/if}

<style lang="scss">
  @import '/app.scss';

  .start-button {
    @apply cursor-pointer absolute bottom-[-7px] right-11 w-5 h-5;
  }

  .stop-button {
    @apply cursor-pointer absolute right-2 bottom-1 w-6 h-6;
  }

  .cancel-button {
    @apply cursor-pointer absolute right-2 w-6 h-6;
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


</style>
