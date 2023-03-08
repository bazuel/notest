<script lang="ts">
  import type { NotestIcon } from '../services/icons';
  import { ntIcons } from '../services/icons';
  import { afterUpdate } from 'svelte';

  export let name: NotestIcon;
  export let tooltip;
  export let color = 'currentColor';

  let clazz: string = '';
  let defaultClasses = '';
  export { clazz as class };

  afterUpdate(() => {
    if (clazz) {
      const classes = clazz.split(' ');
      const hasHeight = classes.find((c) => c.startsWith('h'));
      const hasWidth = classes.find((c) => c.startsWith('w'));
      const hasColor = classes.find((c) => c.startsWith('text'));
      if (!hasColor) defaultClasses += ' text-gray-400';
      if (!hasWidth) defaultClasses += ' w-6';
      if (!hasHeight) defaultClasses += ' h-6';
    } else defaultClasses += 'text-gray-400  w-6 h-6';
  });
</script>

<div class="hl-icon" title={tooltip}>
  <svg on:mouseup class={(clazz || '') + defaultClasses} viewBox="0 0 24 24" fill="{color}" xmlns="http://www.w3.org/2000/svg">
    <path d={ntIcons[name]} stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</div>

<style lang="scss">
  @import '/app.scss';
  .hl-icon {
    @apply inline-block;
  }

  svg {
    @apply inline-block;
    path {
      stroke: none;
    }
  }

  svg.button {
    @apply cursor-pointer opacity-60 hover:opacity-100;
  }
</style>
