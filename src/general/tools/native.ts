import { RECT } from '@streamlabs/game_overlay'

export function cppHWNDToBuffer(hwnd: number) {
	const buf = Buffer.allocUnsafe(8)
	buf.writeInt32LE(hwnd)

	return buf
}

export function rectToDimension({ bottom, left, right, top}: RECT) {
	const width = right - left
	const height = bottom - top
	return {
		width,
		height,
		x: left,
		y: top
	}
}