import { useState, useCallback } from 'react'
import { TouchAction } from 'node-carplay/web'
import { CarPlayWorker } from './worker/types'

export const useCarplayTouch = (
  worker: CarPlayWorker,
  width: number,
  height: number,
) => {
  const [pointerdown, setPointerDown] = useState(false)

  const sendTouchEvent: React.PointerEventHandler<HTMLDivElement> = useCallback(
    e => {
      let action = TouchAction.Up
      if (e.type === 'pointerdown') {
        action = TouchAction.Down
        setPointerDown(true)
      } else if (pointerdown) {
        switch (e.type) {
          case 'pointermove':
            action = TouchAction.Move
            break
          case 'pointerup':
          case 'pointercancel':
          case 'pointerout':
            setPointerDown(false)
            action = TouchAction.Up
            break
        }
      } else {
        return
      }

      const { offsetX: x, offsetY: y } = e.nativeEvent
      worker.postMessage({
        type: 'touch',
        payload: { x: x / width, y: y / height, action },
      })
    },
    [pointerdown, worker, width, height],
  )

  return sendTouchEvent
}
