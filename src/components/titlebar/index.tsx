import { Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

import { useContext } from 'react';
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
    const { menu, size } = useContext(TitlebarContext)

    return <>
        <div id="electron-app-title-bar" className={`electron-app-title-bar ${className || ''}`} style={{ position: "fixed", zIndex: 1000, height: size, "--titlebar-size": size } as any}>
            <div className="resize-handle resize-handle-top" />
            <div className="resize-handle resize-handle-left" />
            {!!icon && <img className="icon" src={icon} />}
            <Flex
                className='no-drag'
                alignItems='center'
                justifyContent='center'
                w='100%'
            >
                {!!menu && Array.from(menu.values())}
            </Flex>
            {children}
            <WindowControls disableMinimize={disableMinimize} disableMaximize={disableMaximize} browserWindowId={browserWindowId} />
        </div>
        <div style={{ height: size }} />
    </>
}
