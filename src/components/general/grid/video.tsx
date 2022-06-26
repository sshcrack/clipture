import "./video.css"
import { Grid, GridItem, GridItemProps } from '@chakra-ui/react'
import React from 'react'

type VideoGridItem = GridItemProps & {
    background: string,
    children: React.ReactElement[] | React.ReactElement
    onClick?: (React.MouseEventHandler<HTMLDivElement>),
    key?: string
}
type InputProps = {
    children: React.ReactNode
}

export function VideoGridItem({ key, background, onClick, children, ...rest }: VideoGridItem) {
    return <GridItem
        key={key}
        display='flex'
        h='100%'
        w='100%'
        background={background}
        backgroundSize='cover'
        borderRadius="xl"
        flexDir='column'
        cursor='pointer'
        className='videoGridItem'
        _hover={{
            filter: " drop-shadow(10px 2px 45px black)",
            transform: "scale(1.0125)"
        }}
        style={{
            transition: "all .2s ease-out"
        }}
        onClick={onClick ?? undefined}
        {...rest}
    >
        {children}
    </GridItem>
}

export function VideoGrid({ children }: InputProps) {
    return <Grid
        justifyContent='start'
        alignItems='start'
        w='100%'
        h='100%'
        gap='1em'
        templateColumns='repeat(auto-fill, minmax(21.5em,1fr))'
        className='sc2 videoGrid'
        overflowY='auto'
        p='5'
        pr='2'
        mr='4'
    >
        {children}
    </Grid>
}