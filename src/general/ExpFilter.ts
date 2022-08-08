export class ExpFilter {
    private alphaDecay = 0.5
    private alphaRise = 0.5
    private value = 0
    constructor(value = 0, alphaDecay = 0.5, alphaRise = 0.5) {
        this.alphaDecay = alphaDecay
        this.alphaRise = alphaRise
        if (alphaDecay < 0 || alphaDecay > 1)
            throw new Error("alpha decay has to be above 0 and below 1")

        if (alphaRise < 0 || alphaRise > 1)
            throw new Error("alpha rise has to be above 0 and below 1")

        this.value = value
    }

    public update(value: number) {
        const alpha = value > this.value ? this.alphaRise : this.alphaDecay
        this.value = alpha * value + (1.0 - alpha) * this.value
        return this.value
    }
}
/*
    """Simple exponential smoothing filter"""

    def \
            __init__(self, val=0.0, alpha_decay=0.5, alpha_rise=0.5):
        """Small rise / decay factors = more smoothing"""
        assert 0.0 < alpha_decay < 1.0, 'Invalid decay smoothing factor'
        assert 0.0 < alpha_rise < 1.0, 'Invalid rise smoothing factor'
        self.alpha_decay = alpha_decay
        self.alpha_rise = alpha_rise
        self.value = val

    def update(self, value):
        if isinstance(self.value, (list, np.ndarray, tuple)):
            alpha = value - self.value
            alpha[alpha > 0.0] = self.alpha_rise
            alpha[alpha <= 0.0] = self.alpha_decay
        else:
            alpha = self.alpha_rise if value > self.value else self.alpha_decay
        self.value = alpha * value + (1.0 - alpha) * self.value
        return self.value
        */

