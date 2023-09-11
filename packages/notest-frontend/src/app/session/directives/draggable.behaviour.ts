export async function enableDrag(
    element: HTMLElement | SVGElement,
    onMove: (start: { x: number, y: number }, current: { x: number, y: number }, moving: boolean, e?: MouseEvent,
             startRelative?: { x: number, y: number }, currentRelative?: { x: number, y: number }) => void, options = {matchTarget: false}) {


    let moving = false;
    let start = {x: 0, y: 0};
    let current = {x: 0, y: 0};
    let startAbsolute = {x: 0, y: 0};
    let currentAbsolute = {x: 0, y: 0};

    const delta = (e) => {
        const targetRect = e.target.getBoundingClientRect();
        return {
            relative: {x: e.clientX - targetRect.left, y: e.clientY - targetRect.top},
            absolute: {x: e.pageX, y: e.pageY}
        }
    }

    const updateCoordinates = (e, what) => {
        let deltaValues = delta(e)
        if (options.matchTarget) {
            what.x = deltaValues.relative.x;
            what.y = deltaValues.relative.y;
        } else {
            what.x = deltaValues.absolute.x;
            what.y = deltaValues.absolute.y;
        }
    };


    let lastCurrentAbsolut = {x: -1, y: -1}
    const mouseMoveHandler = (e) => {
        let targetOk = options.matchTarget ? e.target == element : true;
        if (moving && targetOk) {
            updateCoordinates(e, current);
            currentAbsolute = {...delta(e).absolute}
            if (Math.abs(currentAbsolute.x - lastCurrentAbsolut.x) > 5
                || Math.abs(currentAbsolute.y - lastCurrentAbsolut.y) > 5) {
                lastCurrentAbsolut = {...currentAbsolute}
                onMove(startAbsolute, currentAbsolute, moving, e, start, current);
            }
        }
    }

    const mouseUpHandler = (e) => {
        moving = false;
        onMove(startAbsolute, currentAbsolute, moving, e, start, current);
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);

    };
    const mouseDownHandler = async (e) => {
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        moving = true;
        updateCoordinates(e, start);
        startAbsolute = {...delta(e).absolute}
        currentAbsolute = {...delta(e).absolute}
        current = {...start};
        onMove(startAbsolute, currentAbsolute, moving, e, start, current);
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.returnValue = false;
        return false;
    };


    element.addEventListener('mousedown', mouseDownHandler);


}