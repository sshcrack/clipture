import { GeneralMediaInfo } from '@backend/managers/clip/new_interfaces';
import { Box, Circle, Flex, Text } from '@chakra-ui/react';
import React from "react"
import prettyBytes from 'pretty-bytes';
import prettyMS from "pretty-ms"
import { AiFillEye, AiOutlineLink } from "react-icons/ai"
import { useTranslation } from 'react-i18next';
import FooterButtons from './buttons';

const Separator = () => (
    <Circle size='6px' bg='dashboard.item.separator' />
)

export default function MediaFooter({ media }: { media: GeneralMediaInfo }) {
    const { size, modified } = media.info
    const isPublic = media.storageLoc === "cloud" ? media.info.isPublic : null ||
        media.info.additional !== null ? media.info.additional.isPublic : null
    const { t } = useTranslation("dashboard", { keyPrefix: "item.footer" })


    const [numb, unit] = prettyBytes(size, { space: true })
        .split(" ")

    const dateTranslatable = t("creation_date")
        .replace("{{DATE}}",
            prettyMS(Date.now() - modified, { compact: true, verbose: true })
        )
    return <Flex pl='2' alignItems='center' justifyContent='space-between'>
        <Flex alignItems='center' gap='2'>
            <Text>{dateTranslatable}</Text>
            <Separator />
            <Flex gap='1' alignItems='end'>
                <Text>{numb}</Text>
                <Text fontSize='sm'>{unit}</Text>
            </Flex>
            {isPublic !== null &&
                <>
                    <Separator />
                    <Flex gap='1' alignItems='center'>
                        <Box as={isPublic ? AiFillEye : AiOutlineLink} />
                        <Text>{isPublic ? t("public") : t("private")}</Text>
                    </Flex>
                </>
            }
        </Flex>
            <FooterButtons media={media} />
    </Flex>
}