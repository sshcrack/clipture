import React, { useContext, useEffect, useState } from 'react';
import { TitlebarContext } from './TitleBarProvider';

export default function TitleBarItem(p: React.PropsWithChildren) {
    const { menu, setUpdate } = useContext(TitlebarContext)
    const [ id ] = useState(() => Math.random())

    useEffect(() => {
        menu.set(id, p.children)
        setUpdate(Math.random())

        return () => {
            menu.delete(id)
            setUpdate(Math.random())
        }
    }, [p.children, menu])

    return <></>
}