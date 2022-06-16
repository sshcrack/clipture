import React, { ReactNode } from 'react'

import { WindowControls } from './window-controls'
import { MenuBar, MenuT } from './menu'

export interface TitleBarProps {
    icon?: string;
    menu?: MenuT[];
    disableMinimize?: boolean;
    disableMaximize?: boolean;
    className?: string;
    browserWindowId?: number;
    children?: ReactNode[]
}

export const TitleBar: React.FC<TitleBarProps> = ({ children, icon, menu, disableMinimize, disableMaximize, className, browserWindowId }) => {
    return <>
        <div id="electron-app-title-bar" className={`electron-app-title-bar ${className || ''}`} style={{position: "fixed", zIndex: 1000}}>
            <div className="resize-handle resize-handle-top" />
            <div className="resize-handle resize-handle-left" />
            {!!icon && <img className="icon" src={icon} />}
            {!!menu && <MenuBar menu={menu} />}
            {children}
            <WindowControls disableMinimize={disableMinimize} disableMaximize={disableMaximize} browserWindowId={browserWindowId} />
        </div>
        <div style={{height: "28px"}}/>
    </>
}
