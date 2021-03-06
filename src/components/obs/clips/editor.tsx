import { clamp } from '@backend/tools/math'
import { Box, Button, Flex, Grid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react'
import prettyMS from "pretty-ms"
import React, { useEffect, useRef, useState } from 'react'
import { BsFillCaretLeftFill, BsArrowCounterclockwise } from "react-icons/bs"
import { FaPlay, FaPause } from 'react-icons/fa'
import { IoMdCut } from 'react-icons/io'
import { motion } from "framer-motion"
import { CSSProperties } from '@emotion/serialize'

type ReactMouseEvent = React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent
export default function Editor({ clipName, onBack }: { clipName: string, onBack: () => void }) {
    const barWidth = 5
    const getEndStartBuffer = (_offset: number, range: number) => Math.max(range * 0.1, 2)

    const videoRef = useRef<HTMLVideoElement>()
    const seekBar = useRef<HTMLDivElement>()
    const startBar = useRef<HTMLDivElement>()
    const endBar = useRef<HTMLDivElement>()
    const outerBar = useRef<HTMLDivElement>()

    const [seekDragging, setSeekDragging] = useState(false)
    const [startDragging, setStartDragging] = useState(false)
    const [endDragging, setEndDragging] = useState(false)

    const [update, setUpdate] = useState(0)
    const [duration, setDuration] = useState<number | null>(null)
    const [paused, setPaused] = useState(true)
    const [currRange, setRange] = useState<number | null>(null)
    const [currOffset, setOffset] = useState<number>(0)
    const [selectStart, setSelectStart] = useState<number>(0)
    const [selectEnd, setSelectEnd] = useState<number | null>(null)

    const [canvasBackgrounds, setCanvasBackgrounds] = useState(new Map<number, string>())
    const [lastMouseX, setLastMouseX] = useState<number | null>(null)
    const [isCuttingClips, setClipsCutting] = useState(false)
    const [isVideoHovered, setVideoHovered] = useState(false)

    const startSeekDrag = () => {
        document.body.style.userSelect = "none"
        setSeekDragging(true)
    }

    const startDrag = (type: "start" | "end") => {
        document.body.style.userSelect = "none"
        if (type === "start")
            setStartDragging(true)
        else
            setEndDragging(true)
    }

    const isInTimeFrame = (time: number) => {
        if (!currRange || currOffset === null)
            return false

        return time >= currOffset && time <= currRange + currOffset
    }


    const updateElements = () => {
        if (!seekBar?.current || !endBar?.current || !startBar?.current || !videoRef?.current || !outerBar?.current)
            return

        const seek = seekBar.current
        const start = startBar.current
        const end = endBar.current

        const clientBarWidth = outerBar.current.clientWidth
        const width = clientBarWidth - barWidth

        const setBar = (currTime: number, ref: HTMLDivElement) => {
            const percentage = (currTime - currOffset) / currRange

            const position = percentage * width
            const currDisplay = isInTimeFrame(currTime) ? "block" : "none"
            ref.setAttribute("style", `display: ${currDisplay};transform: translateX(${position}px)`)
        }


        const currRangePercentage = currRange / duration
        const colors = ["#3B4863", "#5A6E96"]
        const additionalSegments = Math.round(20 * currRangePercentage)
        const segments = 10 + additionalSegments + additionalSegments % colors.length

        //TODO: Implement middle mouse button move
        //outerBar.current.style.backgroundPositionX = -(clientBarWidth / duration * currOffset * .75) + "%"
        outerBar.current.style.backgroundRepeat = "repeat"
        outerBar.current.style.backgroundAttachment = "fixed"
        setBar(videoRef.current.currentTime, seek)
        setBar(selectEnd, end)
        setBar(selectStart, start)

        const generateBg = () => {
            // Grid Background
            const stepPercentage = 1 / segments

            const size = [outerBar.current.clientWidth, outerBar.current.clientHeight]
            let canvas = document.createElement("canvas")
            canvas = document.body.appendChild(canvas)

            canvas.width = size[0]
            canvas.height = size[1]
            const ctx = canvas.getContext("2d")

            for (let i = 0; i < segments; i++) {
                const color = colors[i % 2]
                const percentage = stepPercentage * i

                const startX = percentage * size[0]
                const endX = stepPercentage * (i + 1) * size[0]

                ctx.fillStyle = color
                ctx.fillRect(startX, 0, endX - startX, size[1])
            }

            const data = canvas.toDataURL()
            canvas.remove()

            setCanvasBackgrounds(canvasBackgrounds.set(currRange, data))
            return data
        }


        const bg = canvasBackgrounds.get(currRange) ?? generateBg()
        outerBar.current.style.backgroundImage = `url(${bg})`
    }

    const onMiddleMouseMove = (e: ReactMouseEvent) => {
        if (!videoRef?.current || !lastMouseX || !outerBar?.current)
            return

        const dragMultiplier = 0.5
        const clientWidth = outerBar.current.clientWidth

        const diff = (lastMouseX - e.clientX) / clientWidth * currRange * dragMultiplier
        const newOffset = currOffset + diff
        const aboveDuration = newOffset + currRange > duration
        const isBelowStart = newOffset < 0
        const finalOffset = aboveDuration ? duration - currRange : isBelowStart ? 0 : newOffset

        setOffset(finalOffset)
        setLastMouseX(e.clientX)

        updateElements()
    }

    const onMoveToTime = (e: ReactMouseEvent) => {
        if (!outerBar?.current || !videoRef?.current)
            return null

        let rect = outerBar.current.getBoundingClientRect();

        let x = e.clientX - rect.left;
        const full = outerBar.current.clientWidth

        const percentage = clamp(x / full, 0, 1)
        const calculatedTime = currRange * percentage + currOffset

        // Snap to start and end if shift is not pressed

        const isAtEnd = currOffset + currRange >= duration
        const isAtStart = Math.floor(currOffset * 100) === 0

        const endTwoPixelTime = (full - 2) / full * currRange + currOffset
        const startTwoPixelTime = 2 / full * currRange + currOffset

        if (calculatedTime <= startTwoPixelTime && isAtStart && !e.shiftKey && e.movementX < 0)
            return 0

        if (calculatedTime >= endTwoPixelTime && isAtEnd && !e.shiftKey && e.movementX > 0)
            return duration

        return calculatedTime
    }

    const processMouseMove = (e: ReactMouseEvent) => {
        if (!videoRef?.current || !outerBar?.current)
            return

        //TODO: Implement middle mouse button move
        if (lastMouseX !== null && false as any)
            return onMiddleMouseMove(e)

        const time = onMoveToTime(e)
        if (seekDragging && time !== null)
            videoRef.current.currentTime = time

        const shouldSetStart = startDragging && time !== null && time < selectEnd
        const shouldSetEnd = endDragging && time !== null && time > selectStart

        if (shouldSetStart)
            setSelectStart(time)

        if (shouldSetEnd)
            setSelectEnd(time)

        const currTime = videoRef.current.currentTime
        const inTimeFrame = selectStart < currTime && currTime < selectEnd
        if ((shouldSetStart || shouldSetEnd) && !inTimeFrame)
            videoRef.current.currentTime = (selectStart + selectEnd) / 2

        updateElements()
    }

    const playClip = () => {
        if (!videoRef?.current)
            return

        const video = videoRef.current
        function checkTime() {
            if (video.currentTime >= selectEnd) {
                video.pause();
                return setPaused(video.paused)
            }

            setTimeout(checkTime, selectEnd - video.currentTime);
        }

        video.currentTime = selectStart
        video.play()
        setPaused(false)
        checkTime()
    }

    const generateClip = () => {
        if (isCuttingClips)
            return

        setClipsCutting(true)
        window.api.clips.cut(clipName, selectStart, selectEnd, () => {})
            .then(() => setClipsCutting(false))
    }

    useEffect(() => {
        updateElements()
    }, [update])

    useEffect(() => {
        if (!videoRef?.current)
            return

        const video = videoRef.current
        video.onloadeddata = () => {
            const duration = video.duration
            setDuration(duration)
            setRange(duration)
            setSelectEnd(duration)
        }
    }, [videoRef])


    useEffect(() => {
        console.log("Effect", outerBar, "End", endBar)
        if (!outerBar?.current || !endBar?.current)
            return

        const clientWidth = outerBar.current.clientWidth
        endBar.current.setAttribute("style", `transform: translateX(${clientWidth}px)`)
    }, [outerBar, endBar])

    useEffect(() => {
        const intervalId = setInterval(() => setUpdate(Math.random()), 40)


        const endMouseDrag = () => {
            document.body.style.userSelect = ""
            const wasDraggingTimeline = lastMouseX !== null
            setSeekDragging(false)
            setStartDragging(false)
            setEndDragging(false)
            setLastMouseX(null)
            const endStartBuffer = getEndStartBuffer(currOffset, currRange)

            const newOffset = Math.max(selectStart - endStartBuffer, 0)
            const diff = Math.min(selectEnd - newOffset + endStartBuffer, duration - newOffset)


            console.log("NewOffset", newOffset, "Range", diff)
            if ((currOffset !== newOffset || currRange !== diff) && (!wasDraggingTimeline || currOffset + currRange < endStartBuffer)) {
                setOffset(newOffset)
                setRange(diff)
            }
        }

        document.addEventListener("mouseup", endMouseDrag)
        return () => {
            clearInterval(intervalId)
            document.removeEventListener("mouseup", endMouseDrag)
        };
    }, [currRange, selectStart, selectEnd, duration, currOffset])

    const transition = 'all .2s ease-in-out'
    const iconStyle = { width: "1.5em", height: "1.5em" }

    const pauseVideo = (newPaused: boolean) => {
        const video = videoRef?.current
        if (!video)
            return

        !newPaused ? video.play() : video.pause()
        setPaused(video.paused)
    }

    const resetSettings = () => {
        setOffset(0);
        setRange(duration);
        setSelectStart(0);
        setSelectEnd(duration);
        updateElements()
    }
    return <>
        <Box w='100%'>
            <Button
                aria-label='Back'
                leftIcon={<BsFillCaretLeftFill />}
                onClick={onBack}
            >Back</Button>
        </Box>

        <Grid
            h='32.5em'
            rounded='xl'
            style={{ aspectRatio: "16/9" } as any}
            overflow='hidden'
            mb='6'
            onMouseEnter={() => setVideoHovered(true)}
            onMouseLeave={() => setVideoHovered(false)}
        >
            <Box
                w='100%'
                h='100%'
                gridColumn='1'
                gridRow='1'
            >
                <video ref={videoRef} style={{ zIndex: -10 }}>
                    <source src={`clip-video-file:///${encodeURIComponent(clipName)}`}></source>
                </video>
            </Box>
            <Flex
                gridColumn='1'
                gridRow='1'
                w='100%'
                h='100%'
                zIndex='1'
                flexDir='column'
            >
                <Flex
                    flex='1'
                    w='100%'
                    h='100%'
                    justifyContent='center'
                    alignItems='center'
                    opacity={paused ? 1 : 0}
                    transition={transition}
                    bg={paused ? "rgba(0,0,0,.4)" : "rgba(0,0,0,0)"}
                    onClick={() => pauseVideo(!paused)}
                >
                    <motion.div
                        animate={{
                            "--play-size": paused ? "2.5em" : "0em",
                        } as any}
                    >
                        <FaPlay style={{ width: 'var(--play-size)', height: 'var(--play-size)', cursor: "pointer" }} />
                    </motion.div>
                </Flex>
                <Flex
                    w='100%'
                    h='10%'
                    pl='3'
                    pr='3'
                    bg='rgba(0,0,0,0.6)'
                    transition={transition}
                    opacity={paused || isVideoHovered ? "1" : 0}
                >
                    <Flex
                        w='100%'
                        h='100%'
                        display='none'
                    >
                        <Slider
                            aria-label='time-slider'
                            value={videoRef?.current?.currentTime}
                            defaultValue={0}
                            max={duration}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Flex>
                    <Flex
                        w='100%'
                        h='100%'
                        justifyContent='space-around'
                        alignItems='center'
                    >
                        {([
                            [
                                s => !paused ?
                                    <FaPause style={{ ...iconStyle, ...s as any }} /> :
                                    <FaPlay style={{ ...iconStyle, ...s as any }} />,
                                !paused ? () => pauseVideo(true) : () => pauseVideo(false)
                            ],
                            [
                                s => <IoMdCut style={{ ...iconStyle, ...s as any }} />,
                                generateClip
                            ],
                            [
                                s => <BsArrowCounterclockwise style={{ ...iconStyle, ...s as any }} />,
                                resetSettings
                            ]
                        ] as [(additionalStyle: CSSProperties) => JSX.Element, () => void][])
                            .map(([element, onClick]) => <Flex
                                onClick={onClick}
                                w='100%'
                                h='100%'
                                justifyContent='center'
                                alignItems='center'
                                cursor='pointer'
                                _hover={{ "--scaleHover": "1.2" } as any}
                            >
                                {element({
                                    transform: "scale(var(--scaleHover, 1))",
                                    transition: transition
                                })}
                            </Flex>)
                        }
                    </Flex>
                </Flex>
            </Flex>
        </Grid>
        <Flex
            w='100%'
            justifyContent='space-around'
            alignItems='center'
        >
            <Button onClick={generateClip} isLoading={isCuttingClips} loadingText='Generating clip...'>Generate Clip</Button>
            <Button onClick={() => {
                setOffset(0);
                setRange(duration);
                setSelectStart(0);
                setSelectEnd(duration);
                updateElements()
            }}>Reset Selection</Button>
            <Button onClick={playClip}>Play Clip</Button>
            <Text>{duration ? prettyMS(duration * 1000) : "Loading..."}</Text>
        </Flex>
        <Grid
            w='80%'
            h='10em'
            backgroundRepeat='repeat'
            bg='gray'
            ref={outerBar}
            onMouseMove={e => processMouseMove(e)}
            onContextMenu={e => (e.button === 2 /*|| e.button === 1*/) && processMouseMove(e)}
            onMouseDown={e => {
                if (e.button === 2)
                    startSeekDrag()

                //TODO: Implement middle mouse button move
                if (e.button === 1 && false as any) {
                    setLastMouseX(e.clientX);
                }
            }}
        >
            <Box
                gridRow='1'
                gridColumn='1'
                h='100%'
                w='3px'
                bg='red'
                ref={seekBar}
                cursor='pointer'
                onMouseDown={() => startSeekDrag()}
                zIndex='2'
            />
            <Box
                gridRow='1'
                gridColumn='1'
                h='100%'
                w={`${barWidth}px`}
                bg='blue'
                ref={startBar}
                cursor='pointer'
                onMouseDown={() => startDrag("start")}
            />
            <Box
                gridRow='1'
                gridColumn='1'
                h='100%'
                w={`${barWidth}px`}
                bg='blue'
                ref={endBar}
                cursor='pointer'
                onMouseDown={() => startDrag("end")}
            />
        </Grid>
        <Flex w='80%'>
            <Text alignSelf='start' whiteSpace='nowrap'>{prettyMS(selectStart * 1000)}</Text>
            <Box w='100%' />
            <Text alignSelf='end' whiteSpace='nowrap'>{selectEnd === null ? "Loading..." : prettyMS(selectEnd * 1000)}</Text>
        </Flex>
    </>
}