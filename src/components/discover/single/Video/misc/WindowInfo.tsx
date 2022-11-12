import { Flex, Text } from '@chakra-ui/react';
import { WindowInformation } from '@prisma/client';
type Props = {
    info: WindowInformation,
    imgSize?: string,
    fontSize?: string
}

export default function WindowInfo({ info, fontSize, imgSize }: Props) {
    const { title, icon } = info

    return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        <img
            src={`/api/clip/icon/${icon}`}
            alt='Game Image'
            style={{
                width: imgSize ?? "1.5rem",
                height: imgSize ?? "1.5rem",
                borderRadius: "var(--chakra-radii-md)"
            }}
        />
        <Text fontSize={fontSize}>{title}</Text>
    </Flex>
}