import React, { useContext } from 'react';
import { TitlebarContext } from './TitleBarProvider';

export default function TitlebarBalancer(p: React.PropsWithChildren) {
    const { size } = useContext(TitlebarContext)
    return <div style={{ height: `calc(100% - ${size})`, width: "100%" }
    }>
        {p.children}
    </div >
}