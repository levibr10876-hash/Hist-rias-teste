import {useCurrentFrame} from 'remotion'
import type {Look, Plan} from './model'
import {ramp} from './motion'

const poses = {
  hero: {x: 330, y: 762, scale: .99, angle: -13},
  macro: {x: 440, y: 707, scale: 1.30, angle: 20},
  side: {x: 380, y: 770, scale: 1.02, angle: -24},
  end: {x: 382, y: 780, scale: .84, angle: -6},
}

export function Product({brand, look}: {brand: Plan['brand']; look: Look}) {
  const frame = useCurrentFrame()
  const pose = poses[look]
  return <div data-qa-bounds style={{
    position:'absolute', left:pose.x, top:pose.y, width:380,height:780,
    transform:`translateY(${(1-ramp(frame,0,23))*72 + Math.sin(frame/24)*12}px) rotate(${pose.angle + Math.sin(frame/33)*4}deg) scale(${pose.scale})`,
    filter:'drop-shadow(22px 54px 46px #0009)',
  }}>
    <div style={{position:'absolute',left:15,right:15,top:0,height:67,borderRadius:'50%',background:'linear-gradient(155deg,#eff3dc,#6d7461 55%,#c9d0b8)',border:'5px solid #a7af92',zIndex:2}}>
      <div style={{position:'absolute',width:90,height:27,left:126,top:12,border:'7px solid #484e39',borderRadius:'50%',background:'#a7af92'}}/>
    </div>
    <div style={{position:'absolute',inset:'27px 0 0',borderRadius:'10% 10% 17% 17% / 9% 9% 5% 5%',
      background:`linear-gradient(90deg,#0009,transparent 19%,#fff5 34%,transparent 51%,#0006 83%,#000b), linear-gradient(0deg,#252e13 0%,${brand.accent} 12%,${brand.accent} 85%,#536231)`,
      borderBottom:'9px solid #a1a989',color:'#151b0d',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:'86px 25px auto',borderTop:'2px solid #17220f77',paddingTop:19,fontSize:17,letterSpacing:4}}>EXTRAÇÃO LENTA</div>
      <div data-qa-text style={{position:'absolute',top:194,left:25,right:25,whiteSpace:'nowrap',fontWeight:900,fontSize:66,letterSpacing:-4}}>{brand.name}</div>
      <div style={{position:'absolute',left:29,right:29,top:285,borderTop:'5px solid',paddingTop:20,fontWeight:800,fontSize:26,letterSpacing:3}}>COLD<br/>BREW</div>
      <div style={{position:'absolute',bottom:71,left:27,fontWeight:900,fontSize:184,lineHeight:.8,letterSpacing:-23}}>01</div>
      <div style={{position:'absolute',bottom:64,right:27,fontSize:16,fontWeight:800,writingMode:'vertical-rl',letterSpacing:4}}>250 ML</div>
    </div>
  </div>
}
