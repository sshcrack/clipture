import { Button, Flex, Portal, Text, useToast } from '@chakra-ui/react';
import { motion } from "framer-motion";
import React, { useContext, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider';

export default function SettingsSavePopup({ onReset }: { onReset: () => void }) {
    const { save, saving, modified, reset } = useContext(SettingsSaveContext)
    const toast = useToast()

    const saveSettings = () => {
        if (saving)
            return

        save()
            .catch(e => {
                toast({
                    title: "Could not save",
                    description: e?.message ?? e,
                    duration: 15 * 1000,
                    status: "error"
                })
            })
    }

    const hidePercentage = "150%"
    return <Portal>
        <motion.div
            style={{
                display: "flex",
                position: 'fixed',
                width: '40vw',
                borderRadius: 'var(--chakra-radii-xl)',
                height: "4rem",
                background: 'var(--chakra-colors-gray-600)',
                bottom: "1vh",
                left: '0',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--chakra-sizes-3)'
            }}
            initial={{
                transform: `translate(calc(50vw - 50%), ${hidePercentage})`
            }}
            animate={{
                transform: `translate(calc(50vw - 50%), ${modified ? "0%" : hidePercentage})`
            }}
            transition={{
                type: "spring",
                damping: 12
            }}
        >
            <Text fontSize='xl'>You have unsaved changes.</Text>
            <Flex
                ml='auto'
                justifySelf='right'
                gap='5'
                justifyContent='center'
                alignItems='center'
            >
                <Button
                    colorScheme='red'
                    onClick={() => { reset(); onReset() }}
                >Reset</Button>
                <Button
                    colorScheme='green'
                    isLoading={saving}
                    loadingText='Saving...'
                    onClick={() => saveSettings()}
                >Save Changes</Button>
            </Flex>
        </motion.div>
    </Portal>
}