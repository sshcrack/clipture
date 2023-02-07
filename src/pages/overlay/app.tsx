import React, { useEffect } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Logo from "../../assets/renderer/logo_recording.svg"

export default function App() {
    useEffect(() => {
        setTimeout(() => {
            //Reload page
            // eslint-disable-next-line no-self-assign
            location.href = location.href;
        }, 2500)
    })
    return <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: "#111111"
        }}
    >
        <Logo style={{ width: "100%", height: "100%" }} />
    </div>
}