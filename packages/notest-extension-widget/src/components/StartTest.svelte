<script lang="ts">
  import Icon from "../shared/components/icon.svelte";
  import Switch from '../shared/components/Switch.svelte';
  import {createEventDispatcher} from "svelte";
  import {appStore, updateRecButtonOnScreen} from "../stores/settings.store.ts";

  export const dispatcher = createEventDispatcher()

  let createNewTestButtonPressed = false;
</script>

{#if $appStore.logged}
        <button class="nt-button nt-start-registration-button" on:click={() => dispatcher('start-registration')}>Start Registration</button>
{:else}
    <div class="info-panel">
        {#if !createNewTestButtonPressed}
            <div class="nt-create-first-test-container">
                <img class="nt-create-first-test-img" src={`https://notest.io/assets/img/test-img.svg`} alt="test-img"/>
                <p class="nt-p">To create your first test, press the button below</p>
                <button class="nt-button nt-create-first-test-button" on:click={() => createNewTestButtonPressed = true}>Create new test</button>
            </div>
        {:else}
            <div class="slide">
                <div class="nt-guide-element-container-1">
                    <div class="bo-point">1</div>
                    <div>
                        <h4>Use your app and show us the test</h4>
                        <p class="nt-p">We will record any click, mouse move and key press</p>
                    </div>
                </div>
                <div class="nt-guide-element-container-2">
                    <div class="bo-point">2</div>
                    <div>
                        <h4>Finish the test</h4>
                        <div class="nt-finish-test-container">
                            <p class="nt-p">Use the button on the right of the page to complete the test</p>
                            <div class="bo-icon">
                                <Icon name="stop" color="gray"></Icon>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="nt-button nt-start-first-test-button" on:click={() => dispatcher('start-registration')}>Start</button>
            </div>
        {/if}
    </div>
{/if}
<style lang="scss">
    @import "/app.scss";
    @keyframes open {
        0% {
            height: 0;
        }
        10% {
            height: 5rem;
        }
        50% {
            height: 18rem;
        }
        100% {
            height: 20rem;
        }
    }

    .info-panel {
        @apply flex flex-col items-center mt-2 w-3/4;
        @apply transition-all duration-500;
    }

    .slide {
        @apply flex flex-col items-center;
        @apply overflow-hidden;
        animation: open 300ms ease-in-out;
    }

    .nt-start-registration-button {
        @apply bg-bos my-3;
    }

    .nt-create-first-test-container {
        @apply flex flex-col text-center items-center;
    }

    .nt-create-first-test-img {
        @apply w-96 h-48;
    }

    .nt-create-first-test-button {
        @apply bg-bos;
    }

    .nt-guide-element-container-1 {
        @apply flex;
    }
    .nt-guide-element-container-2 {
        @apply flex mt-4;
    }

    .nt-finish-test-container {
        @apply flex;
    }

    .nt-start-first-test-button {
        @apply bg-bos mt-5;
    }

</style>
