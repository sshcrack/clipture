import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Input } from '@chakra-ui/react';
import React, { useEffect, useState, ChangeEvent } from "react"
import { useTranslation } from 'react-i18next';
import { ReactSetState } from 'src/types/reactUtils';
import { useDebounce } from 'use-debounce';

type Props = {
    texts: {
        input: {
            placeholder: string,
            label: string
        },
        helper_text: string,
        error: {
            exists: string,
            empty: string,
            invalid_characters: string
        }
    },
    isError: boolean,
    setError: ReactSetState<boolean>,
    desiredClipName: string,
    setDesiredClipName: ReactSetState<string>
}

export default function NameValidator({ texts, desiredClipName, isError, setDesiredClipName, setError }: Props) {
    const [id, _] = useState(() => Math.random().toString())

    const [clipExists, setClipExists] = useState(false)
    const [debouncedClipName] = useDebounce(desiredClipName, 100)

    const { clips } = window.api

    useEffect(() => {
        let shouldSet = true
        clips.exists(debouncedClipName)
            .then(e => {
                if (!shouldSet)
                    return

                setClipExists(e)
            })

        return () => {
            shouldSet = false
        }
    }, [debouncedClipName])

    const checkForError = (name: string) => {
        const filenameValid = /^([\w,\s-]|-|_)+$/.test(name)
        const isEmptyLocal = name === ''

        return isEmptyLocal || !filenameValid || clipExists
    }


    const isEmpty = desiredClipName === ''
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value

        setDesiredClipName(newName)
        setError(checkForError(newName))
    }

    useEffect(() => {
        setError(checkForError(desiredClipName))
    }, [ clipExists])



    return <FormControl isRequired isInvalid={isError}>
        <FormLabel htmlFor={`input-name-${id}`}>{texts.input.label}</FormLabel>
        <Input
            id={`input-name-${id}`}
            placeholder={texts.input.placeholder}
            onChange={handleInputChange}
            value={desiredClipName}
            autoFocus
        />
        {!isError && !isEmpty ? (
            <FormHelperText>
                {texts.helper_text}
            </FormHelperText>
        ) : (
            <FormErrorMessage>{
                clipExists ?
                    texts.error.exists :
                    isEmpty ?
                        texts.error.empty :
                        texts.error.invalid_characters
            }</FormErrorMessage>
        )}
    </FormControl>
}