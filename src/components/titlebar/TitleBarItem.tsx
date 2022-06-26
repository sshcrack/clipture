import React, { useContext, useEffect } from 'react';
import { TitlebarContext } from './TitleBarProvider';

export default function TitleBarItem(p: React.PropsWithChildren) {
    const { menu, setMenu } = useContext(TitlebarContext)

    useEffect(() => {
        setMenu([
            ...menu,
            p.children
        ])

        return () => {
            setMenu(menu)
        }
    }, [])
    return <></>
}