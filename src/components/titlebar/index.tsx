import { Box, Flex, Image, Text } from '@chakra-ui/react';
import React, { ReactNode, useContext } from 'react';
import '@fontsource/bungee'


import { TitlebarContext } from './TitleBarProvider';
import { WindowControls } from './window-controls';

export interface TitleBarProps {
    icon?: string;
    disableMinimize?: boolean;
    disableMaximize?: boolean;
    className?: string;
    browserWindowId?: number;
    children?: ReactNode[]
}

export const TitleBar: React.FC<TitleBarProps> = ({ children, icon, disableMinimize, disableMaximize, className, browserWindowId }) => {
    const { menu, size, sidebar } = useContext(TitlebarContext)

    return <>
        <Box
            id="electron-app-title-bar"
            className={`electron-app-title-bar ${className || ''}`}
            position="fixed"
            bg="page.bg.secondary"
            alignItems='center'
            justifyContent='center'
            zIndex={1000}
            h={size}
            style={{ "--titlebar-size": size } as any}
        >
            <Box className="resize-handle resize-handle-top" />
            <Box className="resize-handle resize-handle-left" />
            {sidebar && <Box style={{flex: `0 0 ${sidebar.clientWidth}px`}} />}
            {!!icon && !sidebar && <Image w='25px' h='25px' className="icon" src={icon} />}
            <Text fontFamily='Bungee' fontSize='lg'>Clipture</Text>
            <Flex
                className='no-drag-parent'
                alignItems='center'
                justifyContent='center'
                w='100%'
            >
                {!!menu && Array.from(menu.values())}
            </Flex>
            {children}
            <WindowControls disableMinimize={disableMinimize} disableMaximize={disableMaximize} browserWindowId={browserWindowId} />
        </Box>
        <div style={{ height: size }} />
    </>
}
