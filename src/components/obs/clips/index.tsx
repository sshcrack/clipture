import type { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import { Button, Flex } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import Preview from './preview';

const log = RenderLogger.get("obs", "clips")
export default function Clips() {
    return <Flex
        justifyContent='start'
        alignItems='center'
        w='100%'
        h='100%'
    >
        <Preview />
    </Flex>
}