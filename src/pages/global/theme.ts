import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
}

const colors = {
    brand: {
        primary: "#b721ff",
        secondary: "#21aefd",
        bg: "#152B3F"
    }
}

const component = {
    Button: {
        variants: {
            'dark-red': {
                bg: 'red.700'
            }
        }
    }
}

const theme = extendTheme({ config, component, colors })

console.log(theme)
export default theme