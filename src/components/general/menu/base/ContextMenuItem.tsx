import { Button, ButtonProps } from "@chakra-ui/react";
import React, { MouseEventHandler, useContext, useState } from "react";
import { ContextMenuContext } from "./ContextMenu";
import { ContextMenuCategoryContext } from './ContextMenuCategory';

type Props = ButtonProps & {
    onClick: MouseEventHandler;
    colorScheme?: string;
};

export const ContextMenuItem = ({
    children,
    onClick,
    colorScheme,
    ...rest
}: React.PropsWithChildren<Props>) => {
    const [variant, setVariant] = useState("ghost");
    const { closeMenu } = useContext(ContextMenuContext);
    const { disabled }= useContext(ContextMenuCategoryContext)
    return (
        <Button
            {...rest}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
                closeMenu();
            }}
            variant={variant}
            onMouseOver={() => setVariant("solid")}
            onMouseOut={() => setVariant("ghost")}
            borderRadius={0}
            w="100%"
            justifyContent="left"
            size="sm"
            overflow="hidden"
            textOverflow="ellipsis"
            colorScheme={colorScheme}
            isDisabled={rest?.isDisabled || disabled}
        >
            {children}
        </Button>
    );
};
