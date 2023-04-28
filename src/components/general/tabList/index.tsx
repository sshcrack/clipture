import { isRoughly } from '@backend/tools/math'
import { Box, Flex, FlexProps } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useRef, useState, useMemo } from "react"

export type TabListProps = React.PropsWithChildren<{
    tabSize?: string
} & FlexProps>

export type TabListState = {
    addTabHook: (div: HTMLDivElement) => (() => void),
    setTabActive: (div: HTMLDivElement) => unknown,
    tabSize: string
}

export const TabListContext = React.createContext<TabListState>({
    addTabHook: () => (() => {/**/ }),
    setTabActive: () => {/**/ },
    tabSize: "0"
})

type Coords = { x: number, y: number }


const updateAccuracy = 0.001

const gradientBefore = 0.0222; // in number percent
const mouseHoverWidth = 40
const gradientActivePadding = 0.25

export default function TabList({ tabSize, children, ...props }: TabListProps) {
    const baseColor = "var(--chakra-colors-tab-base)";
    const highlightColor = "var(--chakra-colors-tab-highlight)";

    const [tabs] = useState<Map<number, HTMLDivElement>>(new Map())
    const [update, setUpdate] = useState(0)

    // Ease in out smoothly
    const startXEase = useMemo(() => new ExpFilter(0, 0.05, 0.05), [])
    const startEndXEase = useMemo(() => new ExpFilter(0, 0.05, 0.05), [])

    const [active, setActive] = useState<number>(null)
    const [currMouse, setCurrMouse] = useState<Coords>(null)

    const gradientBox = useRef<HTMLDivElement>(null)
    const tabParentDiv = useRef<HTMLDivElement>(null)
    const hoverDetector = useRef<HTMLDivElement>(null)

    const setGradient = (relX: number, relXEnd: number) => {
        const tabParentRects = tabParentDiv.current.getBoundingClientRect()

        const percentX = relX / tabParentRects.width * 100
        const percentEndX = relXEnd / tabParentRects.width * 100

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
        if (currMouse) {
            const x = currMouse.x
            const halfWidth = mouseHoverWidth /2;

            const relX = Math.min(Math.max(x - tabParentRects.x, 0), tabParentRects.width) - halfWidth
            const endX = relX + halfWidth *2

            setGradient(relX, endX)
            return
        }

        if (!active)
            return

        const activeTab = tabs.get(active)
        if (!activeTab)
            return;

        const activeRects = activeTab.getBoundingClientRect()
        const inset = gradientActivePadding * activeRects.width

        const relX = activeRects.x - tabParentRects.x + inset
        const relXEnd = relX + activeRects.width - inset *2

        setGradient(relX, relXEnd)
    }, [active, gradientBox, currMouse, update, tabParentDiv])

    useEffect(() => {
        const l = () => setUpdate(Math.random())
        window.addEventListener("resize", l)

        return () => window.removeEventListener("resize", l)
    }, [])

    return <TabListContext.Provider
        value={{
            addTabHook: div => {
                const id = Math.random()
                div.setAttribute("data-id", id.toString())
                tabs.set(id, div)

                return () => tabs.delete(id)
            },
            setTabActive: div => {
                const id = div.getAttribute("data-id")
                if (!id)
                    return console.warn("Invalid tab id")

                setActive(parseFloat(id))
            },
            tabSize: tabSize ?? "5"
        }}
    >
        <Flex
            w='100%'
            alignItems='center'
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
            <Flex w='100%' pb='1' gap='3' ref={tabParentDiv} {...props}>
                {children}
            </Flex>
            <Box  ref={gradientBox} w='100%' h='2px' bg={baseColor} />
        </Flex>
    </TabListContext.Provider>
}