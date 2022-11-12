import { Flex, Kbd } from '@chakra-ui/react'
import React, { CSSProperties, useEffect } from "react"
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'

export type OuterNavigationProps = React.PropsWithChildren<{
    previousPage: () => unknown,
    nextPage: () => unknown,
    hasPrevious: boolean,
    hasNext: boolean
}>

export default function OuterNavigation({ nextPage, previousPage, hasNext, hasPrevious, children }: OuterNavigationProps) {
    const icoStyle: CSSProperties = {
        width: "3em",
        height: "3em",
        cursor: "pointer"
    }


    useEffect(() => {
        const listener = ({ key }: KeyboardEvent) => {
            console.log("HasNext", hasNext, hasPrevious)
            if (key === "a" && hasPrevious)
                return previousPage()

            if (key === "d" && hasNext)
                return nextPage()
        }

        window.addEventListener("keyup", listener)

        return () => window.removeEventListener("keyup", listener)
    }, [hasPrevious, hasNext, nextPage, previousPage])

    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
    >
        <Flex
            h='100%'
            justifyContent='center'
            alignItems='center'
        >
            <FaCaretLeft
                style={{
                    ...icoStyle,
                    color: hasPrevious ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.5)"
                }}
                onClick={() => hasPrevious && previousPage()}
            />
            <Kbd>A</Kbd>
        </Flex>
        {children}
        <Flex
            h='100%'
            justifyContent='center'
            alignItems='center'
        >
            <Kbd>D</Kbd>
            <FaCaretRight
                style={{
                    ...icoStyle,
                    color: hasNext ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.5)"
                }}
                onClick={() => hasNext && nextPage()}
            />
        </Flex>
    </Flex>
}