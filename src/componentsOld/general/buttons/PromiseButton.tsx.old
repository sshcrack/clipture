import { Button, ButtonProps } from '@chakra-ui/react';
import React, { useState } from "react";

type PromiseButtonProps<T> = ButtonProps & {
    onClick: () => Promise<T>
}
export default function PromiseButton<T>(props: PromiseButtonProps<T>) {
    const [loading, setLoading] = useState(false)
    const onClick = props["onClick"]
    const handleClick = () => {
        setLoading(true)
        onClick()
            .finally(() => setLoading(false))
    }

    return <Button  {...props} onClick={handleClick} isLoading={loading}>
        {props.children}
    </Button>
}