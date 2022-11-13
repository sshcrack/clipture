import React from "react"
import { Text } from '@chakra-ui/react'
import prettyMS from "pretty-ms"

export type GeneralInfoModifiedProps = {
    modified: number
}

export default function GeneralInfoModified({ modified }: GeneralInfoModifiedProps) {
    return <Text ml='auto'>{prettyMS(Date.now() - modified, { compact: true })}</Text>
}