import { Button, Flex, Portal, Text, useToast } from '@chakra-ui/react';
import { motion } from "framer-motion";
import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider';

export default function SettingsSavePopup({ onReset }: { onReset: () => void }) {
    const { save, saving, modified, reset } = useContext(SettingsSaveContext)
    const { t } = useTranslation("settings", { keyPrefix: "popup"})
    const toast = useToast()

    const saveSettings = () => {
        if (saving)
            return

        save()
            .catch(e => {
                toast({
                    title: t("error"),
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
            <Text fontSize='xl'>{t("unsaved")}</Text>
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
                >{t("reset")}</Button>
                <Button
                    colorScheme='green'
                    isLoading={saving}
                    loadingText={t("saving")}
                    onClick={() => saveSettings()}
                >{t("save")}</Button>
            </Flex>
        </motion.div>
    </Portal>
}