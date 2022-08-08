import { useContext, useEffect } from 'react';
import { TitlebarContext } from './TitleBarProvider';
import React from "react"

export default function TitlebarSize({ size, children }: React.PropsWithChildren<{ size: string}>) {
    const { setSize, size: oldSize } = useContext(TitlebarContext)
    useEffect(() => {
        setSize(size)
        return () => {
            setSize(oldSize)
        }
    }, [])

    return <>
        {children}
    </>
}