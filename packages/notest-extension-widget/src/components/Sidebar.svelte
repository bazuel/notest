<script lang="ts">
  import {createEventDispatcher, onMount} from "svelte";
  import Icon from '../shared/components/Icon.svelte';
  import Logo from '../shared/components/Logo.svelte';
  import StartTest from "./StartTest.svelte";
  import LoginRegistration from "./LoginRegistration.svelte";
  import {recordingService} from "../services/recording.service.js";
  import {copyToClipboard, NTSession} from "@notest/common";
  import {tokenService} from "../shared/services/token.service.js";
  import SessionPanel from "./SessionPanel.svelte";
  import {http} from "../shared/services/http.service";
  import {appStore, updateSessionSaved, updateSidebarState} from "../stores/settings.store.js";
  import {router} from "../shared/services/router.service";
  import {initSessionStore, removeSessionImage, sessionStore} from "../stores/session.store";

  export const dispatcher = createEventDispatcher();

  let validSessionTitle = true;
  let userSessions = []

  onMount(async () => {
    if ($appStore.logged) loadUserSessions()
  })

  const onClickStartButton = () => {
    dispatcher('start-recording');
  };
  const onClickSaveButton = async () => {
    if ($sessionStore.title) {
      validSessionTitle = true;
      recordingService.save({
        title: $sessionStore.title,
        description: $sessionStore.description,
        targetList: $sessionStore.targetList,
        isLogin: false,
        reference: recordingService.reference,
      })
      updateSessionSaved(await recordingService.referenceAvailable())
      loadUserSessions();
      //uploadScreenshot(sessionInfo.images[0], recordingService.reference)
    } else {
      validSessionTitle = false;
    }
  }
  const copyLinkReference = () => copyToClipboard(link(recordingService.reference))

  const link = (ref) => `${import.meta.env.VITE_APP_URL}/session/session-preview?reference=${ref}`

  function cancelSessionRecorded() {
    initSessionStore()
    updateSidebarState('start');
  }

  async function redirect(reference) {
    const token = await tokenService.getToken()
    let params;
    if (token) {
      params = {token, reference}
    } else {
      params = {reference}
    }
    router.navigateByUrl(`${import.meta.env.VITE_APP_URL}/session/session-preview`, params)
  }

  function redirectToDashboard() {
    router.navigateByUrl(`${import.meta.env.VITE_APP_URL}/session/session-dashboard`)
  }

  let loadUserSessions = () => {
    http.get('/session/find-by-userid').then((res: { sessions: NTSession[] }) => userSessions = res.sessions)
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
    <LoginRegistration on:login={loadUserSessions}></LoginRegistration>
  {/if}
  {#if $appStore.sidebarState === 'end'}
    <div class="nt-session-ended-container">
      <label class="nt-label">Title ⃰</label>
      <input class="nt-input" autofocus placeholder="Session title" bind:value={$sessionStore.title}/>
      {#if !validSessionTitle}
        <p class="nt-title-not-inserted-container">*Insert TITLE before saving</p>
      {/if}
      <label class="nt-label">Description</label>
      <textarea class="nt-textarea" placeholder="Session description"
                bind:value={$sessionStore.description}></textarea>
      <div>
        <label class="nt-label">Test assertions (Optional)</label>
        <div class="nt-test-assertion-container">
          {#each $sessionStore.images as url }
            <div class="nt-img-assertion-container"
                 on:mouseup={() => removeSessionImage(url)}>
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
          <button on:click={onClickSaveButton} title="Save this session" class="nt-button nt-save-session-button">
            <Icon name="save" color="white"></Icon>
          </button>
          <button class="nt-button nt-cancel-session-button" title="Discard this session"
                  on:mouseup={cancelSessionRecorded}>
            <Icon name="discard" color="white"></Icon>
          </button>
        {:else}
          <div class="nt-session-saved-dialog">
            Session Saved
          </div>
        {/if}
      </div>
      {#if $appStore.sessionSaved}
        <div class="nt-copy-button-container">
          <input class="nt-input" value="{link(recordingService.reference)}"/>
          <button class="nt-button nt-copy-button" title="Copy session link" on:click={copyLinkReference}>
            <Icon name="copy" color="white"></Icon>
          </button>
          <button class="nt-button nt-redirect-container" title="Open your session"
                  on:click={()=>redirect(recordingService.reference)}>
            <Icon color="white" name="redirect"></Icon>
          </button>
        </div>
        <div class="nt-home-button-container">
          <a class="nt-home-button"
             on:click={()=>{cancelSessionRecorded(); updateSessionSaved(false)}}>↩ Go Back Home
          </a>
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

  .nt-redirect-container {
    @apply flex items-center ml-2 cursor-pointer;
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
    @apply my-5 w-10 h-10;
  }

  .nt-cancel-session-button {
    @apply bg-bos ml-2 w-10 h-10;
  }

  .nt-saved-button {
    @apply my-5 border-0;
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

  .nt-session-saved-dialog {
    @apply text-bop mt-2 mb-2;
  }

  .nt-home-button-container {
    @apply mt-5;
  }
</style>