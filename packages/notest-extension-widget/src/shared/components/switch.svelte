<script lang="ts">
  import {createEventDispatcher} from "svelte";

  export let switched: boolean;
  const dispatcher = createEventDispatcher()

  const onSwitch = () => {
    switched = !switched;
    dispatcher('switched-change', switched);
  }

</script>

<div on:mouseup={onSwitch} class="switch">
    <div class="nt-switch-slot" class:text-bop="{switched}">
        <slot></slot>
    </div>
    <div class="nt-switch nt-switch-transition" class:on="{switched}"></div>
</div>

<style lang="scss">
    @import '/app.scss';
    .switch{
        @apply inline-flex cursor-pointer items-center transition-all;
        @apply p-3;
    }

    .nt-switch-slot {
        @apply text-sm text-gray-400 mr-2;
    }

    .nt-switch-transition {
        @apply transition-all;
    }
</style>