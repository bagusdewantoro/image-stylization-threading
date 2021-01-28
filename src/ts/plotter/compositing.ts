enum ECompositingOperation {
    DARKEN,
    LIGHTEN,
}

enum EColor {
    MONOCHROME,
    RED,
    GREEN,
    BLUE,
}

interface IColor {
    r: number;
    g: number;
    b: number;
}

let supportsAdvancedCompositing = true;
function useAdvancedCompositing(): boolean {
    return supportsAdvancedCompositing;
}

function computeRawColor(color: EColor): IColor {
    if (color === EColor.MONOCHROME) {
        return { r: 1, g: 1, b: 1 };
    }

    const result: IColor = {
        r: (color === EColor.RED) ? 1 : 0,
        g: (color === EColor.GREEN) ? 1 : 0,
        b: (color === EColor.BLUE) ? 1 : 0,
    };

    return result;
}

/**
 * @param opacity in [0, 1]
 */
function applyCanvasCompositing(context: CanvasRenderingContext2D, color: EColor, opacity: number, operation: ECompositingOperation): void {
    if (supportsAdvancedCompositing) {
        const targetOperation = (operation === ECompositingOperation.LIGHTEN) ? "lighter" : "difference";
        context.globalCompositeOperation = targetOperation;
        if (context.globalCompositeOperation === targetOperation) {
            const value = Math.ceil(255 * opacity);
            const rawRGB = computeRawColor(color);
            context.strokeStyle = `rgb(${rawRGB.r * value}, ${rawRGB.g * value}, ${rawRGB.b * value})`;
            return; // success
        } else {
            supportsAdvancedCompositing = false;
            Page.Demopage.setErrorMessage("advanced-compositing-not-supported", `Your browser does not support canvas2D compositing '${targetOperation}'. The project will not run as expected.`);
        }
    }

    // basic compositing
    {
        resetCanvasCompositing(context);
        const value = (operation === ECompositingOperation.LIGHTEN) ? 255 : 0;
        const rawRGB = computeRawColor(color);
        context.strokeStyle = `rgba(${rawRGB.r * value}, ${rawRGB.g * value}, ${rawRGB.b * value}, ${opacity})`;
    }
}

function resetCanvasCompositing(context: CanvasRenderingContext2D): void {
    context.globalCompositeOperation = "source-over";
}

export {
    EColor,
    ECompositingOperation,
    applyCanvasCompositing,
    computeRawColor,
    resetCanvasCompositing,
    useAdvancedCompositing,
};
