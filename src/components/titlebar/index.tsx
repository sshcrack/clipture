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
    const { menu } = useContext(TitlebarContext)

    return <>
        <div id="electron-app-title-bar" className={`electron-app-title-bar ${className || ''}`} style={{position: "fixed", zIndex: 1000}}>
            <div className="resize-handle resize-handle-top" />
            <div className="resize-handle resize-handle-left" />
            {!!icon && <img className="icon" src={icon} />}
            {!!menu && menu}
            {children}
            <WindowControls disableMinimize={disableMinimize} disableMaximize={disableMaximize} browserWindowId={browserWindowId} />
        </div>
        <div style={{height: "var(--titlebar-size)"}}/>
    </>
}
