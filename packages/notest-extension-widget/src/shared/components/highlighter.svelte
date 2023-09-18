<script lang="ts">
  import {createEventDispatcher, onDestroy, onMount} from "svelte";
  import Icon from "./icon.svelte"
  import {throttle} from "@notest/common";

  export const dispatcher = createEventDispatcher()

  let enabled = false;
  let lastTarget: HTMLElement | null = null;
  let highlighter: HTMLElement | null = null;

  onMount(() => {
    enabled = true
    setListeners()
  })

  onDestroy(() => {
    console.log('destroyed')
    removeListeners();
  })

  function setListeners() {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('click', onClick, true);
  }

  function removeListeners() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('click', onClick, true);
  }

  function onClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    if (lastTarget && enabled) {
      dispatcher('target-selected', lastTarget);
      enabled = false;
      unHighlight();
    }
  }

  function onMouseOver(mouseEvent: MouseEvent) {
    if (enabled) unHighlight();
    findTarget(mouseEvent);
    if (enabled) {
      highlightLatest();
    }
  }

  function onMouseMove(event: MouseEvent) {
    const mousemove = () => {
      if (enabled) {
        if (!lastTarget) findTarget(event);
        highlightLatest();
      } else unHighlight();
    };
    throttle(mousemove, 50);
  }

  function unHighlight() {
    lastTarget = null;
  }

  function findTarget(event: MouseEvent) {
    try {
      const target = event?.target as HTMLElement;
      if (target && target.className?.indexOf('nt-highlighter') < 0) {
        lastTarget = target;
      }
    } catch {
    }
  }

  function highlightLatest() {
    if (lastTarget) {
      highlight(lastTarget);
    }
  }

  function highlight(target: HTMLElement) {
    const box = target.getBoundingClientRect();
    if (box) {
      setTimeout(() => {
        const {x, y} = document.body.getBoundingClientRect();
        if (highlighter) {
          highlighter.style.width = box.width + 'px';
          highlighter.style.height = box.height + 'px';
          highlighter.style.top = box.top + y + 'px';
          highlighter.style.left = box.left + x + 'px';
        }
      });
    }
  }
</script>

<div class="nt-highlighter" bind:this={highlighter}>
  <Icon name="highlighter" color="white" tooltip=""></Icon>
</div>

<style lang="scss">
  .nt-highlighter {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 10001;
    pointer-events: none;
    background-color: rgba(6, 182, 212, .3);
  }

</style>