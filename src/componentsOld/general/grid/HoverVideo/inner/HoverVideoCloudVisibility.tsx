import { ClipCloudInfo } from '@backend/managers/clip/interface';
import { Flex, Text } from '@chakra-ui/react';
import React from "react";
import { useTranslation } from 'react-i18next';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

type HoverVideoCloudVisibilityProps = {
    cloud: ClipCloudInfo
}

export default function HoverVideoCloudVisibility({ cloud }: HoverVideoCloudVisibilityProps) {
    const { isPublic } = cloud ?? {}
    const { t } = useTranslation("dashboard", { keyPrefix: "clips.general_info" })
    const style = { height: "1.5rem", width: "1.5rem" } as React.CSSProperties

    return <Flex
        bg='rgba(0,0,0,0.75)'
        borderTopRightRadius='xl'
        justifyContent='center'
        alignItems='center'
        gap='2'
        p='2'
    >
        {isPublic ? <AiFillEye style={style} /> :
            <AiFillEyeInvisible style={style} />}
        <Text>{isPublic ? t("public") : t("private")}</Text>
    </Flex>
}