declare module "react-charty" {
    export type ChartyType = "line" | "bar" | "percentage_area" | "stacked_bar" | "multi_yaxis" | "pie"
    export type ChartyData = {
        [key: string]: number[];
        x: number[]
    }

    export type ChartyProps = {
        title?: string,
        type: ChartyType,
        data: ChartyData,
        names: { [key: string]: string },
        colors?: { [key: string]: string },
        fillColors?: {
            [key: string]: string | {
                type: "linear_gradient_v" | "linear_gradient_h",
                colors: string[]
            }
        },
        animated?: boolean,
        startX?: number,
        endX?: number,
        showLegend?: boolean,
        hideFromLegend?: { [key: string]: boolean },
        disabled?: { [key: string]: boolean },
        showLegendTitle?: boolean,
        legendPosition?: "top" | "bottom" | "cursor",
        showMainArea?: boolean,
        showPreview?: boolean,
        showBrush?: boolean,
        showButton?: boolean,
        showRangeText?: boolean,
        rangeTextType?: string,
        xAxisType?: string | ((x: number) => string),
        yAxisType?: string | ((y: number) => string),
        xAxisStep?: number,
        onZoomIn?: (x: number) => Promise<ChartyData>,
        zoomInterval?: number,
        zoomStepX?: number,
        autoScale?: boolean,
        minY?: number,
        maxY?: number
    }

    export default function Charty(props: ChartyProps): JSX.Element
}

/*
type: 'line',
    data: {
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      y0: [-20, 0, 20, 23, 25, 28, 40, 50, 33, 23, 14, 3, 15, 16, 18, 20, 34, 44, 30, 31, 43, 22, 15, 27, 23]
    },
    colors: {
      y0: '#5FB641'
    },
    names: {
      y0: 'Temperature, C°'
    },
    startX: 1,
    endX: 25,
    xAxisStep: 2,
    showPreview: false,
    showRangeText: false,
    showLegendTitle: false
*/