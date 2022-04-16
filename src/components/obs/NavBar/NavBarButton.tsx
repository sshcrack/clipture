import {  Flex, Text } from '@chakra-ui/react';
import classNames from 'classnames';
import React from 'react';
import { IconType } from 'react-icons';
import "src/components/obs/NavBar/styles.css"

export interface NavBarButtonProps {
    active: boolean,
    icon: IconType,
    text: string,
    color: string
}

export default function NavBarButton({ active, icon: Icon, text, color }: NavBarButtonProps) {
    const cssColor = `--chakra-colors-${color.split(".").join("-")}`
    return <Flex
        justifyContent='start'
        alignItems='center'
        style={{
            cursor: "pointer",
        }}
        _hover={{
            bg: "gray.400"
        }}
        p='2'
        w='100%'
        className={classNames('navbar-div', active ? 'navbar-active' : null)}
    >
        <Icon className='navbar-icon' style={{
            "--hover-color": `var(${cssColor})`
        } as any} />
        <Text fontSize='1.5em'>{text}</Text>
    </Flex>

}

/*

    <Button
        w='100%'
        h='100%'
        leftIcon={<Icon style={{ height: '1em', width: '1em' }} />}
        bg='transparent'
    >
    </Button>
    */