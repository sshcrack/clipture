import { useOutsideClick } from "@chakra-ui/react";
import { Variants } from "framer-motion";
import React, { RefObject, useContext, useEffect, useState } from "react";
import { ContextMenuContext } from "./ContextMenu";
import { MotionBox } from "./MotionBox";

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const motionVariants: Variants = {
    enter: {
        visibility: "visible",
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    exit: {
        transitionEnd: {
            visibility: "hidden",
        },
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.1,
            easings: "easeOut",
        },
    },
};

type Position = {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
};

export const ContextMenuList = ({ children }: React.PropsWithChildren<Props>) => {
    const {
        closeMenu,
        isOpen,
        menuRef,
        position: { x, y },
    } = useContext(ContextMenuContext);

    const [position, setPosition] = useState<Position>({});

    // TODO: Any less manual way to do this
    useEffect(() => {
        let left: number | undefined;
        let right: number | undefined;
        let top: number | undefined;
        let bottom: number | undefined;
        const menuHeight = menuRef?.current?.clientHeight;
        const menuWidth = menuRef?.current?.clientWidth;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        if (!menuHeight || !menuWidth) {
            return;
        }
        if (x + menuWidth > windowWidth) {
            right = windowWidth - x;
        } else {
            left = x;
        }
        if (y + menuHeight > windowHeight) {
            bottom = windowHeight - y;
        } else {
            top = y;
        }
        setPosition({
            top: `${top}px`,
            bottom: `${bottom}px`,
            left: `${left}px`,
            right: `${right}px`,
        });
    }, [menuRef, x, y]);

    useOutsideClick({
        ref: menuRef as RefObject<HTMLDivElement>,
        handler: () => {
            if (isOpen) {
                closeMenu();
            }
        },
    });

    return (
        <MotionBox
            variants={motionVariants}
            animate={isOpen ? "enter" : "exit"}
            ref={menuRef}
            borderWidth={2}
            position="fixed"
            bg="brand.bg"
            py={1}
            minW={40}
            maxW={96}
            borderRadius={5}
            display="flex"
            flexDirection="column"
            zIndex={1000}
            {...position}
        >
            {children}
        </MotionBox>
    );
};
