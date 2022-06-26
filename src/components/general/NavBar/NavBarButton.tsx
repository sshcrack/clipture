import { Box, Tooltip } from '@chakra-ui/react';
import classNames from 'classnames';
import { motion } from "framer-motion";
import React from 'react';
import { IconType } from 'react-icons';
import "src/components/general/NavBar/btn.css";

export interface NavBarButtonProps {
    active: boolean,
    icon: IconType,
    tooltip: string,
    color: string,
    onClick?: () => void
}

export default function NavBarButton({ active, icon: Icon, tooltip, color, onClick }: NavBarButtonProps) {
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
            scale: active ? 1 : 1.1
        } as any}
        transition={{ duration: .1 }}
        className='navbar-button-outer'
        onClick={onClick}
    >
        <Tooltip label={tooltip}>
            <Box
                className={classNames('navbar-button-div', active ? 'navbar-active' : null)}
            >
                <Icon className='navbar-icon' />
            </Box>
        </Tooltip>
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