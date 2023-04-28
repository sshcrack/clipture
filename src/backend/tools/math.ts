export function clamp(number: number, min: number, max: number) {
    return Math.max(min, Math.min(number, max));
}

export function isRoughly(actual: number, num: number, tolerance: number) {
    const before = num - tolerance
    const after = num + tolerance
    return actual > before && actual < after
}