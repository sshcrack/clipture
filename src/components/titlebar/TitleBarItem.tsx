import React, { useContext, useEffect, useState } from 'react';
import { TitlebarContext } from './TitleBarProvider';

export default function TitleBarItem(p: React.PropsWithChildren) {
    const { menu, setMenu } = useContext(TitlebarContext)
    const [ id, _] = useState(() => Math.random())

    useEffect(() => {
        menu.set(id, p.children)
        setMenu(new Map(menu.entries()))

        return () => {
            menu.delete(id)
            setMenu(new Map(menu.entries()))
        }
    }, [ p.children ])
    return <></>
}