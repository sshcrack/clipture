import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
}

const colors = {
    editor: {
        highlight: "#d6d6d6"
    },
    brandPrimary: {
        100: "hsl(281, 100%, 88%)",
        200: "hsl(281, 100%, 84%)",
        300: "hsl(281, 100%, 80%)",
        400: "hsl(281, 100%, 76%)",
        500: "hsl(281, 100%, 72%)",
        600: "hsl(281, 100%, 68%)",
        700: "hsl(281, 100%, 64%)",
        800: "hsl(281, 100%, 60%)",
        900: "hsl(281, 100%, 56%)",
    },
    brandSecondary: {
        100: "hsl(202, 98%, 88%)",
        200: "hsl(202, 98%, 84%)",
        300: "hsl(202, 98%, 80%)",
        400: "hsl(202, 98%, 76%)",
        500: "hsl(202, 98%, 72%)",
        600: "hsl(202, 98%, 68%)",
        700: "hsl(202, 98%, 64%)",
        800: "hsl(202, 98%, 60%)",
        900: "hsl(202, 98%, 56%)",
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
        colorScheme: {
            'dark-red': {
                bg: 'red.700'
            },
        }
    }
}

const fonts = {
    heading: `'Coolvetica', sans-serif`,
    body: `'Coolvetica', sans-serif`,
}

const styles = {
    global: {
    }
}

const theme = extendTheme({ config, component, colors, fonts, styles })

console.log(theme)
export default theme