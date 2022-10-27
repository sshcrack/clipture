import { Box, BoxProps } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import { ContextMenuContext } from "./ContextMenu";

type Props = BoxProps

export const ContextMenuTrigger = ({ children, ...props }: React.PropsWithChildren<Props>) => {
    const { openMenu, setPosition, isOpen, closeMenu } = useContext(ContextMenuContext);
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!ref.current)
            return

        const curr = ref.current
        const listener = (e: globalThis.MouseEvent) => {
            const { x, y, width, height } = curr.getBoundingClientRect()
            const insideBoundingBoxX = e.clientX >= x && e.clientX <= x + width
            const insideBoundingBoxY = e.clientY >= y && e.clientY <= y + height
            const inside = insideBoundingBoxX && insideBoundingBoxY
            if (!inside)
                if (isOpen)
                    return closeMenu()
                else
                    return

            e.preventDefault();
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isOpen)
                return openMenu();
        }

        document.addEventListener("contextmenu", listener)
        return () => {
            document.removeEventListener("contextmenu", listener)
        }
    }, [ref, openMenu, setPosition, isOpen, closeMenu])
    return (
        <Box
            {...props}
            ref={ref}
        >
            {children}
        </Box>
    );
};
