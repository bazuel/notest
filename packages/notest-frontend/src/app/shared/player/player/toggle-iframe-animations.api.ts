export class ToggleIframeAnimationsApi {

    toogleAnimations(iframe: HTMLIFrameElement) {
        const doc = iframe.contentDocument!
        this.checkPauseStylesAlreadyInjected(doc);
        doc.body?.classList.toggle("pause-animations")
    }

    pauseAnimations(iframe: HTMLIFrameElement) {
        const doc = iframe.contentDocument!
        this.checkPauseStylesAlreadyInjected(doc);
        doc.body?.classList.add("pause-animations")
    }

    playAnimations(iframe: HTMLIFrameElement) {
        const doc = iframe.contentDocument!
        this.checkPauseStylesAlreadyInjected(doc);
        doc.body?.classList.remove("pause-animations")
    }

    private checkPauseStylesAlreadyInjected(doc: Document) {
        let injectedStyle = doc.querySelector("#bl-injected-style")
        if (!injectedStyle) {
            let injectedStyle = doc.createElement("style")
            injectedStyle.id = "bl-injected-style"
            injectedStyle.innerHTML = `
.pause-animations * {
  -webkit-animation-play-state: paused !important;
  -moz-animation-play-state: paused !important;
  -ms-animation-play-state: paused !important;
  -o-animation-play-state: paused !important;
  animation-play-state: paused !important;
}
        `
            doc.head?.appendChild(injectedStyle)
        }
    }
}
