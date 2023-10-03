import { useEffect, useState } from "react";


export function KeyBindings () {
  const [key, setKey] = useState('')

  useEffect(() => {

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, []);

  const onKeyDown = (event) => {
    console.log(event)
  }

  return(
    <div>

    </div>
  )
}
