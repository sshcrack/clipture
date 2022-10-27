import React, { useContext, useEffect } from 'react';
import { TitlebarContext } from './TitleBarProvider';


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