import React from "react";
import Select, { GroupBase } from "react-select";
import makeAnimated from 'react-select/animated';


type SelectProps<Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>> = React.ComponentProps<typeof Select<Option, IsMulti, Group>>

const animatedComponents = makeAnimated();
export default function CustomSelect<Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>
    (props: SelectProps<Option, IsMulti, Group>) {
    return <Select
        components={animatedComponents}
        theme={theme => ({
            ...theme,
            colors: {
                danger: "var(--chakra-colors-red-500)",
                dangerLight: "var(--chakra-colors-red-200)",
                neutral0: "var(--chakra-colors-gray)",
                neutral10: "var(--chakra-colors-gray-100)",
                neutral20: "var(--chakra-colors-gray-200)",
                neutral30: "var(--chakra-colors-gray-300)",
                neutral40: "var(--chakra-colors-gray-400)",
                neutral50: "var(--chakra-colors-gray-500)",
                neutral60: "var(--chakra-colors-gray-600)",
                neutral70: "var(--chakra-colors-gray-700)",
                neutral80: "var(--chakra-colors-gray-800)",
                neutral90: "var(--chakra-colors-gray-900)",
                neutral5: "var(--chakra-colors-white-100)",
                primary: "var(--chakra-colors-white-900)",
                primary25: "var(--chakra-colors-gray-600)",
                primary50: "var(--chakra-colors-white-500)",
                primary75: "var(--chakra-colors-white-700)",
            },
        })}
        styles={{
            container: prev => ({
                ...prev,
                width: "70%"
            }),
            multiValueRemove: prev => ({
                ...prev,
                color: "var(--chakra-colors-black)"
            }),
            option: (prev, { isSelected, isFocused }) => ({
                ...prev,
                backgroundColor: isSelected || isFocused ? "var(--chakra-colors-gray-700)" : "var(--chakra-colors-gray-900)",
                transition: ".1s all ease-in-out"
            }),
            menu: (prev) => ({
                ...prev,
                backgroundColor: "var(--chakra-colors-gray-900)"
            })
        }}
        {...props}
    />
}