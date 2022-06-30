import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
}

const colors = {
    editor: {
        highlight: "#eeb600"
    },
    brand: {
        primary: "#b721ff",
        secondary: "#21aefd",
        bg: "#152B3F"
    },
    illustration: {
        bg: "#04294F",
        primary: "#FFB400",
        secondary: "#F04E23",
        tertiary: "#00AEE0"
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

const fonts = {
    heading: `'Varela Round', sans-serif`,
    body: `'Varela Round', sans-serif`,
}

const styles = {
    global: {
    }
}

const theme = extendTheme({ config, component, colors, fonts, styles})

console.log(theme)
export default theme