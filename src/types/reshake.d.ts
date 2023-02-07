declare module "reshake" {
    type ReshakeProps = {
        /**
         * Max Horizontal
         * Unit: 'px'
         * @default 5
         */
        h: number
        /**
         * Max Vertical
         * Unit: 'px'
         * @default 5
         */
        v: number
        /**
         * Max Rotation
         * Unit: 'deg'
         * @default 5
         */
        r: number
        /**
         * Complete animation cycle duration
         * Unit: 'ms'
         * @default 300
         */
        dur: number
        /**
         * iterations quantity
         * @default infinite
         */
        q: number | string
        /**
         * CSS animation-timing-function
         * @default ease-in-out
         */
        tf: string
        /**
         * interval between each @keyframe, a kind of fine tuning for the animation
         * Unit: '%'
         * @default 10
         */
        int: number
        /**
         * max @keyframe value, in case other than 100% creates a pause in the animation
         * Unit: '%'
         * @default 100
         */
        max: number
        /**
         * CSS transform-origin
         * @default 'center center'
         */
        orig: string
        /**
         * fixed animation
         * @default false
         */
        fixed: boolean
        /**
         * pause in the animation when interacting
         * @default false
         */
        freez: boolean
        /**
         * active the animations
         * @default true
         */
        active: boolean
        /**
         * CSS pseudo-class which interacts with animation
         * @default true
         */
        trigger: string
        /**
         * Allows to stop the animation with trigger when animation is fixed
         * @default false
         */
        fixedStop: string
    }
}