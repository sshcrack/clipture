
import React, { useContext } from "react"
import { Flex } from "@chakra-ui/react"
import { EditorContext } from "../Editor";
import { MdPlace } from "react-icons/md"


export default function EditorBookmark({ time, barW }: { time: number, barW: number }) {
  const { selection, videoRef } = useContext(EditorContext)
  const { range, offset } = selection

  const visibleStart = offset
  const visibleEnd = offset + range
  if (time < visibleStart || time > visibleEnd)
    return

  const relTime = time - visibleStart
  const placement = relTime / range * barW
  return <Flex
    gridRow='1'
    gridColumn='1'
    w='100%'
    transform={`translateX(${placement}px)`}
  >
    <MdPlace style={{ width: "2em", height: "2em" }} onClick={() => {
      if(!videoRef?.current?.currentTime)
          return

      videoRef.current.currentTime = time
    }}/>
  </Flex>
}