import { Button, Flex, Input, InputGroup, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'


export default function OBSClipPath() {
    const [clipPath, setClipPath] = useState(undefined as string)
    const [ originalClipPath, setOriginalClipPath] = useState(undefined as string)
    const { addSaveListener, addModified, removeModified } = useContext(SettingsSaveContext)
    const { settings } = window.api

    const openFolder = (p: string) => settings.openFolder(p)
    const handleClick = () => {
        settings.selectFolder(clipPath)
            .then(e => {
                if(e.canceled)
                    return
                const newClipPath = e.filePaths.shift()
                if(originalClipPath !== newClipPath)
                    addModified("clip_path")
                else
                    removeModified("clip_path")

                setClipPath(newClipPath)
            })
    }

    useEffect(() => {
        return addSaveListener(() => {
            return settings.set.clipPath(clipPath)
        })
    }, [ clipPath])

    useEffect(() => {
        settings.get.clipPath().then(e => {
            setClipPath(e)
            setOriginalClipPath(e)
        })
    }, [])

    return <Flex w='70%' flexDir='column'>
        <Text mb='8px'>Clip Path</Text>
        <InputGroup size='md'>
            <Input
                value={clipPath ?? ""}
                type={"text"}
                cursor='pointer'
                style={{opacity: 1}}
                placeholder='Loading path...'
                onClick={e => {
                    e.preventDefault()
                    clipPath && openFolder(clipPath)
                }}
            />
            <Button
                ml='4'
                h='100%'
                colorScheme='blue'
                size='sm'
                onClick={handleClick}
                >
                    Browse
                </Button>
        </InputGroup>
    </Flex>
}