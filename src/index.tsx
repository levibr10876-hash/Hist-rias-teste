import {useLayoutEffect, useRef} from 'react'
import {AbsoluteFill, Audio, cancelRender, Composition, Img, Sequence, registerRoot, staticFile, useCurrentFrame} from 'remotion'
import demo from '../projects/demo.json'
import type {Plan, Scene} from './model'
import {KineticText, SceneTransition, ramp} from './motion'
import {Product} from './product'
import {Depth} from './depth'

function SceneView({scene, plan}: {scene: Scene; plan: Plan}) {
  const {brand, depth} = plan
  const frame = useCurrentFrame()
  const light = scene.look === 'side'
  return <AbsoluteFill style={{color:light ? '#162110' : brand.ink,fontFamily:brand.font,
    background:light ? '#d7e766' : brand.background}}>
    <div style={{position:'absolute',inset:0,background:light
      ? 'radial-gradient(ellipse at 65% 61%,#fbffbc,transparent 64%)'
      : `radial-gradient(ellipse at ${57+Math.sin(frame/55)*8}% 62%,#485a27,transparent 63%)`}}/>
    <div style={{position:'absolute',inset:'680px -130px auto',height:850,borderRadius:'50%',border:'1px solid #a2af5966',transform:`rotate(${-22+frame/20}deg)`}}/>
    <div style={{position:'absolute',left:74,right:74,top:94,borderBottom:'1px solid #98a371',paddingBottom:22,
      display:'flex',justifyContent:'space-between',fontSize:23,letterSpacing:5,fontWeight:800}}>
      <span data-qa-text>{brand.name}</span><span data-qa-text>{brand.label}</span>
    </div>
    {depth && <Depth color={brand.accent}/>}
    {scene.artwork
      ? <Img data-qa-bounds src={staticFile(plan.assets[scene.artwork].path)} style={{
        position:'absolute',left:150,top:720,width:780,height:860,objectFit:'contain',
        transform:`translateY(${(1-ramp(frame,0,22))*60 + Math.sin(frame/24)*12}px)`,
        filter:'drop-shadow(10px 24px 30px #0007)',
      }}/>
      : <Product brand={brand} look={scene.look}/>}
    <div style={{position:'absolute',left:74,right:74,top:260}}>
      <KineticText lines={scene.lines} color={light ? '#3d5013' : brand.accent}/>
    </div>
    <div data-qa-text style={{position:'absolute',left:74,bottom:132,opacity:ramp(frame,17,37),
      border:scene.look === 'end' ? 'none' : '1px solid #98a371',padding:'24px 32px',
      borderRadius:60,fontWeight:900,fontSize:25,letterSpacing:3,
      background:scene.look === 'end' ? brand.accent : undefined,color:scene.look === 'end' ? '#17210d' : undefined}}>
      {scene.detail}{scene.look === 'end' && '  ↗'}
    </div>
    <SceneTransition kind={scene.transition} color={brand.accent}/>
  </AbsoluteFill>
}

function Caption({text}: {text: string}) {
  const frame = useCurrentFrame()
  return <div data-qa-text style={{position:'absolute',bottom:290,left:'10%',right:'10%',textAlign:'center',
    color:'white',background:'#101710e8',padding:18,borderRadius:22,font:'800 43px Arial',
    opacity:ramp(frame,-1,5)}}>{text}</div>
}

function Film({plan, audit}: {plan: Plan; audit?: boolean}) {
  const stage = useRef<HTMLDivElement>(null)
  const frame = useCurrentFrame()
  useLayoutEffect(() => {
    if (!audit || !stage.current) return
    const bounds = stage.current.getBoundingClientRect()
    for (const element of stage.current.querySelectorAll('[data-qa-text], [data-qa-bounds]')) {
      if (element.hasAttribute('data-qa-text') && element.clientWidth > 0 &&
          element.scrollWidth > element.clientWidth + 3) {
        cancelRender(Error(`Frame ${frame}: texto excede a largura: ${element.textContent}`))
        return
      }
      const range = document.createRange()
      range.selectNodeContents(element)
      const boxes = element.hasAttribute('data-qa-bounds')
        ? [element.getBoundingClientRect()] : Array.from(range.getClientRects())
      for (const box of boxes) {
        const tolerance = 3
        if (box.left < bounds.left - tolerance || box.right > bounds.right + tolerance ||
            box.top < bounds.top - tolerance || box.bottom > bounds.bottom + tolerance) {
          cancelRender(Error(`Frame ${frame}: elemento fora da área: ${element.textContent}`))
          return
        }
      }
    }
  }, [audit, frame])
  return <AbsoluteFill style={{overflow:'hidden',width:plan.width,height:plan.height}} ref={stage}>
    <AbsoluteFill style={{width:1080,height:1920,transformOrigin:'top left',transform:`scale(${plan.width / 1080})`}}>
      {plan.scenes.map(scene => <Sequence layout="none" key={scene.id} from={scene.from} durationInFrames={scene.frames}>
        <SceneView scene={scene} plan={plan}/>
      </Sequence>)}
      {plan.tracks.map((track,i) => <Sequence layout="none" key={i} from={track.from} durationInFrames={track.frames}>
        <Audio src={staticFile(plan.assets[track.asset].path)} volume={track.volume}/>
      </Sequence>)}
      {plan.captions.map((cue,i) => <Sequence layout="none" key={i} from={cue.from} durationInFrames={cue.frames}>
        <Caption text={cue.text}/>
      </Sequence>)}
    </AbsoluteFill>
  </AbsoluteFill>
}

registerRoot(() => <Composition id="Promo" component={Film} width={demo.width} height={demo.height}
  durationInFrames={demo.frames} fps={demo.fps} defaultProps={{plan: demo as Plan, audit:false}}
  calculateMetadata={({props}) => ({width:props.plan.width,height:props.plan.height,
    fps:props.plan.fps,durationInFrames:props.plan.frames})}/>)
