<script lang="ts">
  import {beforeUpdate, createEventDispatcher, onMount} from "svelte";
  import Icon from '../shared/components/Icon.svelte';
  import Logo from '../shared/components/Logo.svelte';
  import StartTest from "./StartTest.svelte";
  import LoginRegistration from "./LoginRegistration.svelte";
  import {recordingService} from "../services/recording.service.js";
  import {copyToClipboard, NTSession} from "@notest/common";
  import {tokenService} from "../shared/services/token.service.js";
  import SessionPanel from "./SessionPanel.svelte";
  import {http} from "../shared/services/http.service";
  import {uploadScreenshot} from "../shared/services/screenshot.service";
  import {appStore, updateSessionSaved, updateSidebarState} from "../stores/settings.store.js";
  import {router} from "../shared/services/router.service";

  export const dispatcher = createEventDispatcher();
  export let sessionInfo:
    {
      title: string,
      description: string,
      targetList: DOMRect[],
      imgUrls: string[],
      images: { timestamp: Date, data: Blob, name: string }[],
      isLogin: boolean,
      loginReference?: string
    } = {
    title: "",
    imgUrls: [],
    description: "",
    targetList: [],
    images: [],
    isLogin: false,
  }

  let showLoginSessions = false;
  let validSessionTitle = true;
  let userSessions = []
  let loginSessions = []

  onMount(() => {
    if (tokenService.logged && $appStore.sidebarState === 'start') {
      http.get('/session/find-by-userid')
        .then((res: { sessions: NTSession[] }) => userSessions = res.sessions)
    }
    if ($appStore.sidebarState === 'end') {
      http.get(`/session/login-sessions?domain=${window.location.hostname}`)
        .then((res: NTSession[]) => {
          loginSessions = res
          console.log(loginSessions)
        })

      // http.get(`/media/screenshot-download?reference=${recordingService.reference}&name=shot`).then((res:StreamableFile) =>{
      //   const reader = new FileReader();
      //   reader.readAsDataURL(res);
      //   reader.onloadend = () => {
      //     sessionInfo.imgUrls.push(reader.result as string)
      //   }
      // })
    }
  })

  beforeUpdate(() => {
    if (tokenService.logged && $appStore.sidebarState === 'start') {
      http.get('/session/find-by-userid')
        .then((res: { sessions: NTSession[] }) => userSessions = res.sessions)
    }
  })

  const onClickStartButton = () => {
    dispatcher('start-recording');
  };
  const onClickSaveButton = async () => {
    if (sessionInfo.title) {
      validSessionTitle = true;
      dispatcher('save-session', sessionInfo);
      updateSessionSaved(await recordingService.referenceAvailable())
      //uploadScreenshot(sessionInfo.images[0], recordingService.reference)
    } else {
      validSessionTitle = false;
    }
  }
  const copyLinkReference = () => {
    copyToClipboard(link(recordingService.reference))
  };

  const link = (ref) => `${import.meta.env.VITE_APP_URL}/session/session-preview?reference=${ref}`

  function filterImg(url) {
    sessionInfo.imgUrls = sessionInfo.imgUrls.filter(img => img !== url)
  }

  function cancelSessionRecorded() {
    sessionInfo = {
      title: "",
      imgUrls: [],
      description: "",
      targetList: [],
      images: [],
      isLogin: false
    }
    updateSidebarState('start');
  }

  function redirect(reference) {
    const token = tokenService.token
    router.navigateByUrl(`${import.meta.env.VITE_APP_URL}/session/session-preview`, {token, reference})
  }

  function setLoginReference(reference) {
    sessionInfo.loginReference = reference
    showLoginSessions = false
  }

  function redirectToDashboard() {
    router.navigateByUrl(`${import.meta.env.VITE_APP_URL}/session/session-dashboard`)
  }

</script>

<div class="sidebar-right">
  <div class="nt-close-sidebar-container" on:mouseup={() => {dispatcher('close-sidebar')}}>
    <Icon color="gray" name="arrowRight"/>
  </div>
  <Logo class="nt-sidebar-logo-container"></Logo>
  {#if $appStore.sidebarState === 'start'}
    {#if $appStore.logged && userSessions.length > 0}
      <SessionPanel sessions="{userSessions}" title="Session History"
                    on:session-selected={(e) => redirect(e.detail.reference)}></SessionPanel>
    {/if}
    <div class="nt-center nt-start-registration-container">
      <StartTest on:start-registration={onClickStartButton}></StartTest>
    </div>
    {#if $appStore.logged}
      <div class="nt-center nt-session-dashboard-container">
        <button class="nt-button nt-dashboard-button" on:click={() => redirectToDashboard()}>Session Dashboard
        </button>
      </div>
    {/if}
    <LoginRegistration></LoginRegistration>
  {/if}
  {#if $appStore.sidebarState === 'end'}
    <div class="nt-session-ended-container">
      <label class="nt-label">Title</label>
      <input class="nt-input" placeholder="Session title" bind:value={sessionInfo.title}/>
      {#if !validSessionTitle}
        <p class="nt-title-not-inserted-container">*Insert TITLE before saving</p>
      {/if}
      <label class="nt-label">Description</label>
      <textarea class="nt-textarea" placeholder="Session description"
                bind:value={sessionInfo.description}></textarea>
      {#if !$appStore.sessionSaved}
        <div class="nt-user-login-session-container">
          <button class="nt-button nt-user-login-session-button"
                  on:click={() => showLoginSessions = !showLoginSessions}>
            Select User Login Session
          </button>
          {#if showLoginSessions}
            <div class="nt-login-session-panel">
              <SessionPanel sessions="{loginSessions}" title="Login Sessions"
                            on:session-selected={(e) => setLoginReference(e.detail.reference)}></SessionPanel>
            </div>
          {/if}
        </div>
      {/if}
      <div>
        <label class="nt-label">Test assertions (Optional)</label>
        <div class="nt-test-assertion-container">
          {#each sessionInfo.imgUrls as url }
            <div class="nt-img-assertion-container"
                 on:mouseup={() => filterImg(url)}>
              <div class="nt-cancel-assertion">✖</div>
              <img class="nt-img-url-assertion" src={url} alt=""/>
            </div>
          {/each}
          <button on:click={() => dispatcher('highlighter')} class="nt-button nt-assertion-utils">
            <Icon name="picker"></Icon>
          </button>
          <button on:click={() => dispatcher('selector')}
                  class="nt-button nt-assertion-utils nt-assertion-selector-container">
            <Icon name="selector"></Icon>
          </button>
        </div>
      </div>
      <div class="nt-session-save-delete-container">
        {#if !$appStore.sessionSaved}
          <button on:click={onClickSaveButton} class="nt-button nt-save-session-button">
            Save session
          </button>
          <button class="nt-button nt-cancel-session-button" on:mouseup={cancelSessionRecorded}>
            Cancel session
          </button>
        {:else}
          <button class="nt-button nt-saved-button disabled">Saved</button>
          <button class="nt-button nt-show-registered-session-button"
                  on:click={()=>redirect(recordingService.reference)}>Show your
            session
          </button>
        {/if}
      </div>
      {#if $appStore.sessionSaved}
        <div class="nt-copy-button-container">
          <input class="nt-input" value="{link(recordingService.reference)}"/>
          <button class="nt-button nt-copy-button" on:click={copyLinkReference}>Copy</button>
        </div>
        <div>
          <button class="nt-button nt-home-button"
                  on:click={()=>{cancelSessionRecorded(); updateSessionSaved(false)}}> Home
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>


<style lang="scss">
  @import "/app.scss";

  .sidebar-right {
    z-index: 10001;
    @apply flex flex-col p-4 fixed w-1/4 h-screen ease-in-out shadow-2xl shadow-black top-0 right-0;
    @apply bg-gradient-to-r from-white to-gray-100;
    @apply overflow-auto;
  }

  .nt-assertion-utils {
    @apply flex justify-center items-center w-24 h-16 rounded-lg border-dashed border-2 border-nt-700 bg-white;
  }

  .nt-close-sidebar-container {
    @apply h-0 w-0;
    @apply absolute top-1/2 left-2 cursor-pointer;
  }

  .nt-sidebar-logo-container {
    @apply fixed top-5 left-5;
  }

  .nt-start-registration-container {
    @apply flex-col h-fit mt-10;
  }

  .nt-session-dashboard-container {
    @apply mt-auto w-full;
  }

  .nt-dashboard-button {
    @apply w-2/3;
  }

  .nt-session-ended-container {
    @apply flex flex-col px-10;
  }

  .nt-title-not-inserted-container {
    @apply text-red-800;
  }

  .nt-user-login-session-container {
    @apply relative;
  }

  .nt-user-login-session-button {
    @apply mt-3;
  }

  .nt-login-session-panel {
    @apply absolute shadow-lg rounded-md bg-white top-10 z-50 w-11/12;
  }

  .nt-test-assertion-container {
    @apply flex py-2 gap-2 flex-wrap;
  }

  .nt-img-assertion-container {
    @apply relative cursor-pointer;
  }

  .nt-cancel-assertion {
    @apply absolute top-1 right-1 text-nt-400;
  }

  .nt-img-url-assertion {
    @apply w-24 h-16 rounded-lg shadow-md;
  }

  .nt-assertion-selector-container {
    @apply ml-2;
  }

  .nt-session-save-delete-container {
    @apply flex items-center;
  }

  .nt-save-session-button {
    @apply my-5;
  }

  .nt-cancel-session-button {
    @apply bg-bos ml-2;
  }

  .nt-saved-button {
    @apply my-5 outline;
  }

  .nt-show-registered-session-button {
    @apply ml-4;
  }

  .nt-copy-button-container {
    @apply flex;
  }

  .nt-copy-button {
    @apply ml-4;
  }

  .nt-home-button {
    @apply mt-2 items-center justify-center;
  }
</style>