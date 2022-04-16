import { Flex, Text } from '@chakra-ui/react';
import classNames from 'classnames';
import React from 'react';
import { motion } from "framer-motion"
import { IconType } from 'react-icons';
import "src/components/obs/NavBar/btn.css"

export interface NavBarButtonProps {
    active: boolean,
    icon: IconType,
    text: string,
    color: string
}

export default function NavBarButton({ active, icon: Icon, text, color }: NavBarButtonProps) {
    const cssColor = `--chakra-colors-${color.split(".").join("-")}`
    const colorCodeHover = getComputedStyle(document.body)
        .getPropertyValue(cssColor)

    return <motion.div
        style={{
            cursor: "pointer",
            "--hover-color": `var(${cssColor})`
        } as any}
        initial={{ "--gradient-color": "rgba(0,0,0,0)" } as any}
        whileHover={{
            "--gradient-color": colorCodeHover,
            scale: 1.1
        } as any}
        transition={{ duration: .1 }}
        className={classNames('navbar-button-div', active ? 'navbar-active' : null)}
    >
        <Icon className='navbar-icon' />
        <Text fontSize='1.5em'>{text}</Text>
    </motion.div>

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