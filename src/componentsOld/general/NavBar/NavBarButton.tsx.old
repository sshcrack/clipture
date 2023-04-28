import { Flex, FlexProps, Tooltip } from '@chakra-ui/react';
import { getCSSVariable } from '@general/tools';
import classNames from 'classnames';
import React, { useState } from 'react';
import { IconType } from 'react-icons';

export type NavBarButtonProps = FlexProps & {
    icon: IconType,
    tooltip: string,
    color?: string,
    chakraColor?: string,
    active?: boolean,
    onClick?: () => void
}

export default function NavBarButton({ active, icon: Icon, chakraColor, tooltip, color, ...props }: NavBarButtonProps) {
    const cssColor = `--chakra-colors-${chakraColor?.split(".")?.join("-")}`
    const [isHovered, setHovered] = useState(false)

    const colorCodeHover = chakraColor ? getCSSVariable(cssColor) : color

    const transition = ".25s ease-in-out all"
    return <Tooltip label={tooltip}>
        <Flex
            bg={active ? colorCodeHover : "transparent"}
            _hover={{
                bg: active ? colorCodeHover : colorCodeHover
            }}
            className={classNames('navbar-button-div', active ? 'navbar-active' : null)}
            p='4'
            w='100%'
            justifyContent='center'
            alignItems='center'
            cursor='pointer'
            transition={transition}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            {...props}
        >
            <Icon style={{
                transition: transition,
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                width: '2em',
                height: '2em'
            }} />
        </Flex>
    </Tooltip>

}

/*

    <Button
        w='100%'
        h='100%'
        leftIcon={<Icon style={{ height: '1em', width: '1em' }} />}
        bg='transparent'
    >
    </Button>
    */