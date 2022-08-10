import React, { useContext } from "react"
import { Flex } from "@chakra-ui/react"
import { EditorContext } from "../Editor";
import { MdPlace } from "react-icons/md"


export default function EditorBookmark({ time, barW }: { time: number, barW: number}) {
     const { selection, duration } = useContext(EditorContext)
     const { start, end, range, offset } = selection

     const visibleStart = offset
     const visibleEnd = offset + range
     console.log("V-Start", visibleStart, "end", visibleEnd, "time", time, "bar", barW)
     if(time < visibleStart || time > visibleEnd)
       return

     const relTime = time - visibleStart 
     const placement = relTime / range * barW
     console.log("Rel", relTime, "place", placement)
     return <Flex
           gridRow='1'
           gridColumn='1'
           w='100%'
           transform={`translateX(${placement}px)`}
     >
         <MdPlace style={{ width: "2em", height: "2em"}}/>
     </Flex>
}