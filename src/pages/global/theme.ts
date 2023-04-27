import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
}

const colors = {
    editor: {
        highlight: "#d6d6d6"
    },
    brand: {
        primary: "#b721ff",
        secondary: "#21aefd",
    },
    page: {
        bg: {
            "0": "#302A46",
            "1": "#3E3666",
            "2": "#564263",
            secondary: "#3F3263"
        },
    },


    pg_bar: {
        disabled: {
            "0":"rgba(87, 87, 87, 0.49)",
            "1": "rgba(255, 255, 255, 0.49)"
        }
    },
    tab: {
        base: "#4E4E4E",
        highlight: "#21AEFD"
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
        colorScheme: {
            'dark-red': {
                bg: 'red.700'
            },
        }
    }
}

const fonts = {
    heading: `'Quattrocento', sans-serif`,
    body: `'Inter', sans-serif`,
}

const styles = {
    global: {
    }
}

const theme = extendTheme({ config, component, colors, fonts, styles })

export default theme