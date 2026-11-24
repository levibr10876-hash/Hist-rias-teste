import {PerspectiveCamera, Vector3} from 'three'
import {useCurrentFrame} from 'remotion'

// CPU projection keeps this optional Three.js layer usable on render hosts without WebGL.
const camera = new PerspectiveCamera(43, 1080 / 1920, 1, 2500)
camera.position.z = 850
camera.updateMatrixWorld()

export function Depth({color}: {color: string}) {
  const frame = useCurrentFrame()
  return <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    {Array.from({length:18}, (_, index) => {
      const angle = index * Math.PI / 9 + frame / 100
      const point = new Vector3(Math.cos(angle) * 205, Math.sin(angle) * 129, Math.cos(angle) * 135)
      point.project(camera)
      return <div key={index} style={{position:'absolute',left:(point.x + 1) * 540,top:1135-point.y*960,
        width:5,height:5,borderRadius:'50%',background:color,opacity:.62}}/>
    })}
  </div>
}
