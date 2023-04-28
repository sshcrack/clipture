import { isRoughly } from '@backend/tools/math'
import { Box, Flex, FlexProps } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useRef, useState, useMemo } from "react"
import TabIndexProvider from './indexProvider'

export type TabListProps = {
    tabSize?: string,
    index: number,
    children?: JSX.Element[]
} & Omit<FlexProps, "children">


type Coords = { x: number, y: number }


const updateAccuracy = 0.001

const gradientBefore = 0.0222; // in number percent
const mouseHoverWidth = 40
const gradientActivePadding = 0.25

export default function TabList({ index, tabSize, children, ...props }: TabListProps) {
    const baseColor = "var(--chakra-colors-tab-base)";
    const highlightColor = "var(--chakra-colors-tab-highlight)";

    const [update, setUpdate] = useState(0)

    // Ease in out smoothly
    const startXEase = useMemo(() => new ExpFilter(0, 0.05, 0.05), [])
    const startEndXEase = useMemo(() => new ExpFilter(0, 0.05, 0.05), [])

    const [currMouse, setCurrMouse] = useState<Coords>(null)

    const gradientBox = useRef<HTMLDivElement>(null)
    const tabParentDiv = useRef<HTMLDivElement>(null)
    const hoverDetector = useRef<HTMLDivElement>(null)

    const setGradient = (relX: number, relXEnd: number) => {
        const gradientRects = gradientBox.current.getBoundingClientRect()

        const percentX = relX / gradientRects.width * 100
        const percentEndX = relXEnd / gradientRects.width * 100

        const easedX = startXEase.update(percentX)
        const easeEndX = startEndXEase.update(percentEndX)


        const bufferFront = Math.max(easedX - gradientBefore * 100, 0)
        const bufferAfter = Math.min(easeEndX + gradientBefore * 100, 100)
        const img = `linear-gradient(to right, ${baseColor} 0%,
            ${baseColor} ${bufferFront}%, ${highlightColor} ${easedX}%,
            ${highlightColor} ${easeEndX}%, ${baseColor} ${bufferAfter}%,
        ${baseColor} 100%)`
        gradientBox.current.style.backgroundImage = img

        const roughlyX = isRoughly(easedX, percentX, updateAccuracy)
        const roughlyEndX = isRoughly(easeEndX, percentEndX, updateAccuracy)
        if(!roughlyX || !roughlyEndX) {
            setTimeout(() => setUpdate(Math.random()), 10)
        }
    }

    useEffect(() => {
        if (!hoverDetector.current)
            return
        const curr = hoverDetector.current

        let isCurr = false
        const onMouseMove = (e: MouseEvent) => {
            const { x, y, width, height }= curr.getBoundingClientRect()
            if(e.x < x || e.y < y || e.x > x + width || e.y > y + height) {
                if(!isCurr)
                    return

                isCurr = false
                setCurrMouse(null)
                return
            }

            setCurrMouse({ x: e.x, y: e.y })
            isCurr = true
        }

        window.addEventListener("mousemove", onMouseMove)

        return () => {
            window.removeEventListener("mousemove", onMouseMove)
        }
    }, [hoverDetector, setCurrMouse])

    useEffect(() => {
        if (!gradientBox.current || !tabParentDiv.current)
            return;

        const tabParentRects = tabParentDiv.current.getBoundingClientRect()
        const gradientRects = gradientBox.current.getBoundingClientRect()
        if (currMouse) {
            const x = currMouse.x
            const halfWidth = mouseHoverWidth /2;

            const minConstrain = tabParentRects.x
            const maxConstrain = tabParentRects.width + minConstrain
            const relX = Math.min(Math.max(x, minConstrain), maxConstrain) - halfWidth - gradientRects.x
            const endX = relX + halfWidth *2

            setGradient(relX, endX)
            return
        }

        if (index === -1)
            return

        const activeTabList = tabParentDiv.current.getElementsByClassName(`tab-${index}`)
        if (!activeTabList || activeTabList.length === 0)
            return;

        const activeTab = activeTabList[0]
        const activeRects = activeTab.getBoundingClientRect()
        const inset = gradientActivePadding * activeRects.width

        const relX = activeRects.x - gradientRects.x + inset
        const relXEnd = relX + activeRects.width - inset *2

        setGradient(relX, relXEnd)
    }, [index, gradientBox, currMouse, update, tabParentDiv])

    useEffect(() => {
        const l = () => setUpdate(Math.random())
        window.addEventListener("resize", l)

        return () => window.removeEventListener("resize", l)
    }, [])

    return <Flex
            justifyContent='center'
            flexDir='column'
            position='relative'
        >
            <Box
                position='absolute'
                ref={hoverDetector}
                top='-5'
                left='-5'
                right='-5'
                bottom='-5'
                zIndex='-1'
            />
            <Flex pb='1' gap='3' w='fit-content' ref={tabParentDiv} {...props}>
                {React.Children.map(children, (e, i) => (
                    <TabIndexProvider index={i} tabSize={tabSize} isActive={i === index}>
                        {e}
                    </TabIndexProvider>
                ))}
            </Flex>
            <Box  ref={gradientBox} w='100%' h='2px' bg={baseColor} />
        </Flex>
}