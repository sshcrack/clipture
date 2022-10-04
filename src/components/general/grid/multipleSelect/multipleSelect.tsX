import { Checkbox, Flex } from "@chakra-ui/react"
import React, { useContext } from "react"
import { MultipleSelectContext } from './provider'

export default function MultipleSelect({ fileName }: { fileName: string }) {
    const { selected, addSelect, removeSelect } = useContext(MultipleSelectContext)

    return <Flex
        w='100%'
        gridRow='1'
        gridColumn='1'
        zIndex='1000'
        h='100%'
    >
        <Checkbox
            zIndex='1000'
            isChecked={selected.includes(fileName)}
            onChange={e => {
                const checked = e.currentTarget.checked
                if (!checked)
                    return removeSelect(fileName)

                if (selected.includes(fileName))
                    return

                addSelect(fileName)
            }} />
    </Flex>
}