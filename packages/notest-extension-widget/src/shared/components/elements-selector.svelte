<script lang="ts">
  import {createEventDispatcher, onDestroy, onMount} from "svelte";
  import Icon from "./icon.svelte"
  import {getHighlighterRect, getSelectorRect, renderElement} from "../functions/highlighter";

  export const dispatcher = createEventDispatcher()

  let enabled = false;
  let highlighter: HTMLElement | null = null;
  let cursorSelector: HTMLElement | null = null;
  let lastTarget: HTMLElement | null = null;

  let targetList: HTMLElement[] = [];
  let cursorRect = {left: Infinity, top: Infinity, width: 0, height: 0}
  let highlighterRect = {left: Infinity, top: Infinity, width: 0, height: 0}

  onMount(() => {
    setListeners();
  })

  onDestroy(() => {
    console.log('destroyed')
    removeListeners();
  })

  function onMouseDown(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    dispatcher('selecting-started')
    cursorRect.left = e.x
    cursorRect.top = e.y
    cursorRect.width = 1
    cursorRect.height = 1
    cursorSelector?.removeAttribute('hidden')
    enabled = true
  }

  function onMouseUp(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    dispatcher('selecting-ended', {targetList, rect: highlighterRect})
    targetList = []
    highlighterRect = {} as any
    enabled = false
    cursorSelector.setAttribute('hidden', 'true')
    return false
  }

  function onMouseMove(e: MouseEvent) {
    if (!enabled) return;
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    if (
      e.target != lastTarget &&
      e.target instanceof HTMLElement &&
      !targetList.includes(e.target as HTMLElement) &&
      e.target != highlighter &&
      e.target != cursorSelector &&
      e.target != document.body &&
      e.target.tagName != 'NOTEST-WIDGET'
    ) {
      targetList.push(e.target as HTMLElement)
    }
    cursorRect = getSelectorRect(e.x, e.y, cursorRect)
    highlighterRect = getHighlighterRect(targetList)
    renderElement(cursorSelector, cursorRect)
    renderElement(highlighter, highlighterRect)
  }

  function onScroll() {
    console.log('scroll')
    console.log(document.body.scrollTop)
    console.log(document.body.scrollLeft)
    console.log(window.scrollY)
    highlighter.style.top = `${highlighterRect.top - document.body.scrollTop}px`
  }

  function onClick(e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    return false
  }

  function setListeners() {
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mouseup', onMouseUp, true);
    document.addEventListener('scroll', onScroll, true);
    document.addEventListener('click', onClick, true);
  }

  function removeListeners() {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mousedown', onMouseDown, true);
    document.removeEventListener('mouseup', onMouseUp, true);
    document.removeEventListener('scroll', onScroll, true);
    document.removeEventListener('click', onClick, true);
  }

</script>

<div class="nt-cursor-selection" bind:this={cursorSelector}></div>
<div class="nt-highlighter" bind:this={highlighter}>
  <Icon name="highlighter" color="white"></Icon>
</div>

<style lang="scss">
  .nt-highlighter {
    z-index: 10001;
    @apply flex justify-items-center justify-center items-center fixed pointer-events-none bg-nt-300 bg-opacity-30;
  }

  .nt-cursor-selection {
    @apply fixed bg-nt-600 border-dashed border-2 border-nt-700 bg-opacity-30 rounded-sm;
    z-index: 10002;
  }

</style>