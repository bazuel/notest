
export class RequestAnimationFrameTimer {
    private reqAniFrameId = 0;
    private baseRafTime = 0;
    private end = false;

    constructor() {
        this.resetTimer()
    }

    stop() {
        this.end = true
    }

    start(callback: ((msFromLast, msFromStart) => void)) {
        this.end = false
        let lastTime = 0
        let internalCallback = (t) => {
            const timeFromBase = t - this.baseRafTime
            callback(t - lastTime, timeFromBase)
            lastTime = t
            cancelAnimationFrame(this.reqAniFrameId)
            if (!this.end)
                this.reqAniFrameId = requestAnimationFrame(internalCallback)
        }

        this.reqAniFrameId = requestAnimationFrame(internalCallback)
    }

    resetTimer() {
        const x = requestAnimationFrame((t) => {
            this.baseRafTime = t
            cancelAnimationFrame(x)
        })
    }


}
