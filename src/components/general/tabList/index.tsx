import { Box, Flex, FlexProps } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from "react"

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


const gradientBefore = 2.22; // in percent
const mouseHoverWidth = 40

export default function TabList({ tabSize, children, ...props }: TabListProps) {
    const baseColor = "var(--chakra-colors-tab-base)";
    const highlightColor = "var(--chakra-colors-tab-highlight)";

    const [tabs] = useState<Map<number, HTMLDivElement>>(new Map())
    const [update, setUpdate] = useState(0)

    const [active, setActive] = useState<number>(null)
    const [currMouse, setCurrMouse] = useState<Coords>(null)

    const gradientBox = useRef<HTMLDivElement>(null)
    const hoverDetector = useRef<HTMLDivElement>(null)

    const setGradient = (relX: number, relXEnd: number) => {
        const boxRects = gradientBox.current.getClientRects()[0]

        const percentX = relX / boxRects.width * 100
        const percentEndX = relXEnd / boxRects.width * 100

        const bufferFront = Math.max(percentX - gradientBefore, 0)
        const bufferAfter = Math.min(percentEndX + gradientBefore, 100)
        const img = `
        linear-gradient(to right, ${baseColor} 0%, ${baseColor} ${bufferFront}%, ${highlightColor} ${percentX}%, ${highlightColor} ${percentEndX}%, ${baseColor} ${bufferAfter}%, ${baseColor} 100%)
        `
        gradientBox.current.style.backgroundImage = img
    }

    useEffect(() => {
        if (!hoverDetector.current)
            return
        const curr = hoverDetector.current

        let isCurr = false
        const onMouseMove = (e: MouseEvent) => {
            const { x, y, width, height}= curr.getClientRects()[0]
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
        console.log("Active", active)
        if (!gradientBox.current)
            return;

        const boxRects = gradientBox.current.getClientRects()[0]
        if (currMouse) {
            const x = currMouse.x
            const relX = Math.min(Math.max(x - boxRects.x, 0), boxRects.width)
            const endX = relX + mouseHoverWidth

            setGradient(relX, endX)
            return
        }

        if (!active)
            return

        const activeTab = tabs.get(active)
        if (!activeTab)
            return;

        const activeRects = activeTab.getClientRects()[0]

        const relX = activeRects.x - boxRects.x
        const relXEnd = relX + activeRects.width

        setGradient(relX, relXEnd)
    }, [active, gradientBox, currMouse, update])

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
                top='-7'
                left='-7'
                right='-7'
                bottom='-7'
                zIndex='-1'
            />
            <Flex w='100%' pb='1' gap='3' {...props}>
                {children}
            </Flex>
            <Box  ref={gradientBox} w='100%' h='2px' bg={baseColor} />
        </Flex>
    </TabListContext.Provider>
}