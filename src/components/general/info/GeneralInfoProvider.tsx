import { Checkbox, Flex, FlexProps } from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from "react";
import "./GeneralInfo.css";
import { SelectionContext } from './SelectionProvider';


type Props = FlexProps & {
    onEditor: React.MouseEventHandler<HTMLDivElement>,
    baseName: string
}
export default function GeneralInfoProvider({ baseName, onEditor, children, ...props }: Props) {
    const { selection, setSelection } = useContext(SelectionContext)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (!setSelection)
            return

        setChecked(selection.includes(baseName))
    }, [selection])

    return <Flex
        flex='0'
        justifyContent='center'
        alignItems='center'
        flexDir='row'
        bg='brand.bg'
        borderRadius="xl"
        borderTopLeftRadius='0'
        borderTopRightRadius='0'
        gridRow='1'
        gridColumn='1'
        p='1'
        {...props}
    >
        <Flex
            flex='0'
            pl='5'
            pr='5'
        >
            <Checkbox
                className='checkbox_larger'
                isChecked={checked}
                onChange={e => {
                    const c = e.target.checked
                    const base = selection.filter(e => e !== baseName)
                    if (c)
                        base.push(baseName)

                    setChecked(c)
                    setSelection(base)
                }}
            />
        </Flex>
        {children}
    </Flex>
}