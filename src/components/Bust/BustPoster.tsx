import poster from '../../assets/bust-poster.png'
import s from './Bust.module.css'

/** Static fallback shown when WebGL is unavailable. */
export default function BustPoster() {
  return (
    <div className={s.poster} aria-hidden="true">
      <img src={poster} alt="" className={s.posterImg} />
    </div>
  )
}
