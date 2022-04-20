import { useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';

export default function ToastNotifier() {
    const toast = useToast()

    useEffect(() => {
        window.api.onToast((options) => {
            toast(options);
        })
    }, [])

    return <></>
}