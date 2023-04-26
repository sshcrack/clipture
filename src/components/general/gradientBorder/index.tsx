import { Flex, FlexProps } from '@chakra-ui/react'
import React from "react"

const borderSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   inkscape:version="1.0 (4035a4fb49, 2020-05-01)"
   sodipodi:docname="border.svg"
   id="svg4"
   version="1.1">
  <metadata
     id="metadata10">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs
     id="defs8" />
  <sodipodi:namedview
     inkscape:current-layer="svg4"
     inkscape:window-maximized="1"
     inkscape:window-y="58"
     inkscape:window-x="1358"
     inkscape:cy="126.53402"
     inkscape:cx="90.404117"
     inkscape:zoom="1.8101934"
     showgrid="false"
     id="namedview6"
     inkscape:window-height="1009"
     inkscape:window-width="1920"
     inkscape:pageshadow="2"
     inkscape:pageopacity="0"
     guidetolerance="10"
     gridtolerance="10"
     objecttolerance="10"
     borderopacity="1"
     bordercolor="#666666"
     pagecolor="#ffffff" />
  <rect
     id="rect2"
     stroke="white"
     fill="transparent"
     stroke-width="--stroke-width"
     ry="100%"
     rx="45"
     style="height:calc(100% - 10px);width:calc(100% - 10px)"
     height="100%"
     width="100%"
     y="5"
     x="5" />
</svg>`

export type GradientBorderProps = FlexProps & {
    size: number,
    full: boolean,
    radius: string,
    gradient: string
}

export const MASK_BORDER_HALF = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS4wICg0MDM1YTRmYjQ5LCAyMDIwLTA1LTAxKSIKICAgc29kaXBvZGk6ZG9jbmFtZT0iYm9yZGVyLnN2ZyIKICAgaWQ9InN2ZzQiCiAgIHZlcnNpb249IjEuMSI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTAiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM4IiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmc0IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjU4IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIxMzU4IgogICAgIGlua3NjYXBlOmN5PSIxMjYuNTM0MDIiCiAgICAgaW5rc2NhcGU6Y3g9IjkwLjQwNDExNyIKICAgICBpbmtzY2FwZTp6b29tPSIxLjgxMDE5MzQiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlkPSJuYW1lZHZpZXc2IgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMDkiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiIC8+CiAgPHJlY3QKICAgICBpZD0icmVjdDIiCiAgICAgc3Ryb2tlPSJ3aGl0ZSIKICAgICBmaWxsPSJ0cmFuc3BhcmVudCIKICAgICBzdHJva2Utd2lkdGg9IjEwIgogICAgIHJ5PSIyMCIKICAgICByeD0iMjAiCiAgICAgc3R5bGU9ImhlaWdodDpjYWxjKDEwMCUgLSAxMHB4KTt3aWR0aDpjYWxjKDEwMCUgLSAxMHB4KSIKICAgICBoZWlnaHQ9IjEwMCUiCiAgICAgd2lkdGg9IjEwMCUiCiAgICAgeT0iNSIKICAgICB4PSI1IiAvPgo8L3N2Zz4K')"
export const getMaskBorderFull = (size: number) => {
    const svgOut = borderSvg.replace("--stroke-width", size.toString())

    console.log(svgOut)
    return `url('data:image/svg+xml;base64,${window.btoa(svgOut)}')`
}

export default function GradientBorder({ radius, _before, gradient, full, size, children, ...props }: GradientBorderProps) {
    const negative = "0"//`calc(${size} * -1)`

    // Still a little bit offset
    const maskBorder = full ? getMaskBorderFull(size) : MASK_BORDER_HALF
    return <Flex
        position='relative'
        zIndex='0'
        backgroundSize='0 0'
        w='100%'
        h='100%'
        borderRadius={radius}
        _before={{
            content: '""',
            position: "absolute",
            bgGradient: gradient,
            top: negative,
            right: negative,
            bottom: negative,
            left: negative,
            zIndex: '-1',
            backgroundSize: 'auto',
            WebkitMask: maskBorder,
            mask: maskBorder,
            ...(_before ?? {})
        }}
        {...props}
    >
        {children}
    </Flex>
}