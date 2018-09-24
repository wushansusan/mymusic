<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart"
                            @touchmove.prevent="middleTouchMove"
                            @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">
              {{playingLyric}}
              </div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" :class="{'current':currentLineNum===index}"
                   v-for="(line,index) in currentLyric.lines" ref="lyricLine">{{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
          <i class="icon-playlist" @click.stop="showPlaylist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '../../common/js/dom.js'
import ProgressBar from '../../base/progress-bar/progress-bar.vue'
import ProgressCircle from '../../base/progress-circle/progress-circle.vue'
import {playMode} from '../../common/js/config.js'
import {playerMixin} from '../../common/js/mixin.js'
import Lyric from 'lyric-parser'
import Scroll from '../../base/scroll/scroll.vue'
import Playlist from '../../components/playlist/playlist.vue'

const transform=prefixStyle('transform')
const transitionDuration=prefixStyle('transitionDuration')
export default {
    mixins:[playerMixin],
    data(){
      return {
        songReady:false,
        currentTime:0,
        radius:32,
        currentLyric:{},
        currentLineNum:0,
        currentShow:'cd',
        playingLyric:''
      }
    },
    created() {
      this.touch={}
    },
    computed:{
        disableCls(){
          return this.songReady?'':'disable'
        },
        cdCls(){
          return this.playing?'play':'play pause'
        },
        playIcon(){
          return this.playing?'icon-pause':'icon-play'
        },
        percent(){
          return this.currentTime/this.currentSong.duration
        },
        miniIcon(){
          return this.playing?'icon-pause-mini':'icon-play-mini'
        },
        ...mapGetters([
            'fullScreen',
            'playing',
        ])
    },
    watch:{
      currentSong(newSong,oldSong){
        if (!newSong.id){
          return
        }
        if (newSong.id===oldSong.id){
          return
        }
        clearTimeout(this.timer)
        this.timer=setTimeout(()=>{
          this.$refs.audio.play()
          this.getLyric()
        },1000)
      },
      playing(newPlaying){
        const audio=this.$refs.audio
        this.$nextTick(()=>{
          this.playing?audio.play():audio.pause()
        })
      }
    },
    methods:{
      showPlaylist(){
        this.$refs.playlist.show()
      },
      middleTouchStart(e){
        this.touch.initiated=true
        const touch=e.touches[0]
        this.touch.startX=touch.pageX
        this.touch.startY=touch.pageY
      },
      middleTouchMove(e){
        if (!this.touch.initiated){
          return
        }
        const touch=e.touches[0]
        const deltaX=touch.pageX-this.touch.startX
        const deltaY=touch.pageY-this.touch.startY
        if (Math.abs(deltaY)>Math.abs(deltaX)){
          return
        }
        const time=300
        const left=this.currentShow==='cd'?0:-window.innerWidth
        const width=Math.min(0,Math.max(-window.innerWidth,left+deltaX))
        this.touch.percent=Math.abs(width/window.innerWidth)
        this.$refs.lyricList.$el.style[transform]=`translate3d(${width}px,0,0)`
        const opacity=1-this.touch.percent
        this.$refs.middleL.style.opacity=`${opacity}`
        this.$refs.middleL.style[transitionDuration]=`${time}ms`
      },
      middleTouchEnd(){
        let width
        let opacity
        if (this.currentShow==='cd'){
          if (this.touch.percent>0.1){
            width=-window.innerWidth
            opacity=0
            this.currentShow='lyric'
          }
          else{
            width=0
            opacity=1
          }
        }
        else{
          if (this.touch.percent<0.9){
            width=0
            opacity=1
            this.currentShow='cd'
          }
          else{
            width=-window.innerWidth
            opacity=0
          }
        }
        const time=300
        this.$refs.lyricList.$el.style[transform]=`translate3d(${width}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration]=`${time}ms`
        this.$refs.middleL.style.opacity=`${opacity}`
        this.$refs.middleL.style[transitionDuration]=`${time}ms`
      },
      getLyric(){
        this.currentSong.getLyric().then((lyric)=>{
          if (this.lyric!==lyric){
            return
          }
          this.currentLyric=new Lyric(lyric,this.handleLyric)
          if (this.playing){
            this.currentLyric.play()
          }
        }).catch(()=>{
          this.playingLyric=''
          this.currentLyric=null
          this.currentLineNum=0
        })
      },
      handleLyric({lineNum,txt}){
        this.currentLineNum=lineNum
        if (lineNum>5){
          let lineEl=this.$refs.lyricLine[lineNum-5]
          this.$refs.lyricList.scrollToElement(lineEl,1000)
        }
        else{
          this.$refs.lyricList.scrollTo(0,0,1000)
        }
        this.playingLyric = txt
      },
      end(){
        if (this.mode===playMode.loop){
          this.loop()
        }
        else{
          this.next()
        }
      },
      loop(){
        if (this.currentLyric){
          this.currentLyric.seek(0)
        }
        this.$refs.audio.currentTime=0
        this.$refs.audio.play()
      },
      back(){
        this.setFullScreen(false)
      },
      next(){
        if(!this.songReady){
          return
        }
        if (this.playlist.length===1){
          this.loop()
          return
        }
        else{
          let index=this.currentIndex+1
          if (index===this.playlist.length){
            index=0
          }
          this.setCurrentIndex(index)
          if (!this.playing){
            this.togglePlaying()
          }
          this.songReady=false
        }
      },
      prev(){
        if(!this.songReady){
          return
        }
        if (this.playlist.length===1){
          this.loop()
          return
        }
        else{
          let index=this.currentIndex-1
          if (index===-1){
            index=this.playlist.length-1
          }
          this.setCurrentIndex(index)
          if (!this.playing){
            this.togglePlaying()
          }
          this.songReady=false
        }
      },
      ready(){
        this.songReady=true
        this.savePlayHistory(this.currentSong)
      },
      error(){
        this.songReady=true
      },
      updateTime(e){
        this.currentTime=e.target.currentTime
      },
      format(interval){
        interval=interval|0
        const minute=interval/60 | 0
        const second=this._pad(interval%60)
        return `${minute}:${second}`
      },
      _pad(num,n=2){
        let len=num.toString().length
        while (len<n){
          num='0'+num
          len++
        }
        return num
      },
      onProgressBarChange(percent){
        const currentTime=this.currentSong.duration*percent
        this.$refs.audio.currentTime=currentTime
        if(this.currentLyric){
          this.currentLyric.seek(1000*currentTime)
        }
        if (!this.playing){
          this.togglePlaying()
        }
      },
      togglePlaying(){
        this.setPlayingState(!this.playing)
        if (this.currentLyric){
          this.currentLyric.togglePlay()
        }
      },
      open(){
        this.setFullScreen(true)
      },
      enter(el,done){
        const {x,y,scale}=this._getPosAndScale()
        let animation={
          0:{
            transform:`translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60:{
            transform:'translate3d(0,0,0) scale(1.1)'
          },
          100:{
            transform:'translate3d(0,0,0) scale(1)'
          }
        }
        animations.registerAnimation({
          name:'move',
          animation,
          presets:{
            duration:400,
            easing:'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper,'move',done)
      },
      afterEnter(el){
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation=''
      },
      leave(el,done){
        this.$refs.cdWrapper.style.transition='all 0.4s'
        const {x,y,scale}=this._getPosAndScale()
        this.$refs.cdWrapper.style[transform]=`translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend',done)
      },
      afterLeave(el){
        this.$refs.cdWrapper.style.transition=''
        this.$refs.cdWrapper.style[transform]=''
      },
      _getPosAndScale(){
        const targetWidth=40
        const paddingLeft=40
        const paddingBottom=30
        const paddingTop=80
        const width=window.innerWidth*0.8
        const scale=targetWidth/width
        const x=-(window.innerWidth/2-paddingLeft)
        const y=window.innerHeight-paddingTop-paddingBottom-width/2
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen:'SET_FULL_SCREEN',
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    components:{
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable.styl'
@import '../../common/stylus/mixin.styl'
.player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position:absolute
        top:0
        left:0
        bottom:0
        right:0
        width:100%
        height:100%
        z-index:-1
        opacity:0.6
        filter:blur(20px)
      .top
        position:relative
        margin-bottom:25px
        .back
          position:absolute
          left:6px
          top:0
          z-index:50
          .icon-back
            display:block
            padding:9px
            font-size:$font-size-large-x
            color:$color-theme
            transform:rotate(-90deg)
        .title
          margin:0 auto
          width:70%
          text-align:center
          line-height:40px
          font-size: $font-size-large
          color: $color-text
          no-wrap()
        .subtitle
          line-height: 20px
          width:100%
          text-align:center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position:fixed
        width:100%
        top:80px
        bottom:170px
        white-space:nowrap
        font-size:0
        .middle-l
          display:inline-block
          vertical-align:top
          position:relative
          width:100%
          padding-top:80%
          height:0
          .cd-wrapper
            position:absolute
            top:0
            left:10%
            width:80%
            height:100%
            .cd
              width:100%
              height:100%
              border-radius:50%
              box-sizing:border-box 
              border:10px solid rgba(255, 255, 255, 0.1)
              &.play
                animation:rotate 20s linear infinite
              &.pause
                animation-play-state:paused
              .image
                position:absolute
                top:0
                left:0
                width:100%
                height:100%
                border-radius:50%
          .playing-lyric-wrapper
            position:relative
            text-align:center
            top:30px
            .playing-lyric
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
        .middle-r
          display:inline-block
          vertical-align:top
          width:100%
          height:100%
          overflow:hidden
          .lyric-wrapper
            width:80%
            overflow:hidden
            margin:0 auto
            text-align:center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position:fixed
        bottom:50px
        width:100%
        .dot-wrapper
          text-align:center
          font-size:0
          .dot
            display:inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display:flex
          align-items:center
          width:80%
          margin:0px auto
          padding:10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display:flex
          align-items:center
          .icon
            flex:1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size:30px
          .i-left
            text-align:right
          .i-center
            padding:0 20px
            text-align:center
          .i-right
            text-align:left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active,&.normal-leave-active
        transition:all 0.4s
        .top,.bottom
          transition:all 0.4s cubic-bezier(0.86,0.18,0.82,1.32)
      &.normal-enter,&.normal-leave-to
        opacity:0
        .top
          transform:translate3d(0,-100px,0)
        .bottom
          transform:translate3d(0,100px,0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      align-items:center
      .icon
        flex:0 0 40px
        width:40px
        padding:0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation:rotate 20s linear infinite
          &.pause
            animation-play-state:paused
      .text
        display:flex
        flex-direction:column
        justify-content:center
        flex:1
        line-height:20px
        overflow:hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex:0 0 30px  
        width:30px
        padding:0 10px
        .icon-playlist
          position:relative
          right:0
          bottom:15px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left:0
          top: 0
      &.mini-enter-active,&.mini-leave-active
        transition:all 0.4s
      &.mini-enter,&.mini-leave-to
        opacity:0

@keyframes rotate
  0%
    transform:rotate(0)
  100%
    transform:rotate(360deg)
</style>
