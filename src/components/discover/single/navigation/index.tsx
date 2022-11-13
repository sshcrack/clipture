import { Flex, FlexProps, Kbd } from '@chakra-ui/react'
import React, { CSSProperties, useEffect } from "react"
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'

export type OuterNavigationProps = {
    previousPage: () => unknown,
    nextPage: () => unknown,
    hasPrevious: boolean,
    hasNext: boolean
} & FlexProps

export default function OuterNavigation({ nextPage, previousPage, hasNext, hasPrevious, children, ...props }: OuterNavigationProps) {
    const icoStyle: CSSProperties = {
        width: "3em",
        height: "3em"
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
        {...props}
    >
        <Flex
            h='100%'
            justifyContent='center'
            alignItems='center'
            cursor="pointer"
            onClick={() => hasPrevious && previousPage()}
        >
            <FaCaretLeft
                style={{
                    ...icoStyle,
                    color: hasPrevious ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.5)"
                }}
            />
            <Kbd>A</Kbd>
        </Flex>
        {children}
        <Flex
            h='100%'
            justifyContent='center'
            alignItems='center'
            cursor="pointer"
            onClick={() => hasPrevious && previousPage()}
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