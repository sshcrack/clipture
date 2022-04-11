import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
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

const theme = extendTheme({ config, component })

export default theme