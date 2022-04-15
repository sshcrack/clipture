import React, { useState, useEffect, useCallback, useRef } from 'react'

export interface WindowControlsProps {
    disableMinimize?: boolean;
    disableMaximize?: boolean;
    browserWindowId?: number;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ disableMaximize, disableMinimize, browserWindowId }) => {
    const [isMaximized, setIsMaximized] = useState(false)
    const remoteBrowserWindowId = useRef(browserWindowId)
    const { titlebar } = window.api;

    useEffect(() => {
        const onMaximizeStateChange = (_: any, isWindowMaximized: boolean, targetBrowserWindowId: number) => {
            if (targetBrowserWindowId === remoteBrowserWindowId.current) {
                setIsMaximized(isWindowMaximized)
            }
        }

        titlebar.addMaximizeChange(onMaximizeStateChange)

        const updateRemoteBrowserWindowId = async () => {
            remoteBrowserWindowId.current = await titlebar.initialize(browserWindowId)
        }
        updateRemoteBrowserWindowId().finally(() => null)

        return () => {
            titlebar.removeMaximizeChange(onMaximizeStateChange)
        }
    }, [browserWindowId])


    const setMaximize = useCallback(() => titlebar.setMaximized(browserWindowId), [browserWindowId])
    const setMinimize = useCallback(() => titlebar.setMinimized(browserWindowId), [browserWindowId])
    const setClose = useCallback(() => titlebar.setClose(browserWindowId), [browserWindowId])

    return (
        <div className="window-controls">
            <button aria-label="minimize" tabIndex={-1} className="window-control window-minimize" disabled={disableMinimize}
                onClick={setMinimize}>
                <svg aria-hidden="true" version="1.1" width="10" height="10">
                    <path d="M 0,5 10,5 10,6 0,6 Z" />
                </svg>
            </button>
            <button aria-label="maximize" tabIndex={-1} className="window-control window-maximize" disabled={disableMaximize}
                onClick={setMaximize}>
                <svg aria-hidden="true" version="1.1" width="10" height="10">
                    <path d={isMaximized ? "m 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z" : "M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z"} />
                </svg>
            </button>
            <button aria-label="close" tabIndex={-1} className="window-control window-close"
                onClick={setClose}>
                <svg aria-hidden="true" version="1.1" width="10" height="10">
                    <path d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z" />
                </svg>
            </button>
        </div>
    )
}
