<template>
    <div class="music-list">
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div class="play" ref="playBtn" v-show="songs.length>0" @click="random">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref="filter"></div>
        </div>
        <div class="bg-layer" ref="layer"></div>
        <scroll :data="songs" class="list" ref="list"
                :probeType="probeType"
                :listScroll="listScroll"
                @scroll="scroll">
            <div class="song-list-wrapper">
                <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
            </div>
        </scroll>
        <div class="loading-container">
            <loading></loading>
        </div>
    </div>
</template>

<script>
import Scroll from '../../base/scroll/scroll.vue'
import SongList from '../../base/song-list/song-list.vue'
import {prefixStyle} from '../../common/js/dom.js'
import Loading from '../../base/loading/loading.vue' 
import {mapActions} from 'vuex'
import {playlistMixin} from '../../common/js/mixin.js'

const transform=prefixStyle('transform')
const backdrop=prefixStyle('backdrop-filter')

const RESERVED_HEIGHT=40
    export default{
        mixins:[playlistMixin],
        props:{
            songs:{
                type:Array,
                default:[]
            },
            title:{
                type:String,
                default:""
            },
            bgImage:{
                type:String,
                default:""
            },
            rank:{
                type:Boolean,
                default:false
            }
        },
        data(){
            return {
                scrollY:0
            }
        },
        computed:{
            bgStyle(){
                return `background-image:url(${this.bgImage})`
            }
        },
        methods:{
            handlePlaylist(playlist){
                const bottom=this.playlist.length>0?'60px':''
                this.$refs.list.$el.style.bottom=bottom
                this.$refs.list.refresh()
            },
            random(){
                this.randomPlay({
                    list:this.songs
                })
            },
            scroll(pos){
                this.scrollY=pos.y
            },
            back(){
                this.$router.back()
            },
            selectItem(song,index){
                this.selectPlay({
                    list:this.songs,
                    index
                })
            },
            ...mapActions([
                'selectPlay',
                'randomPlay'
            ])
        },
        watch:{
            scrollY(newY){
                let translateY=Math.max(this.minHeight,newY)
                this.$refs.layer.style[transform]=`translate3d(0,${translateY}px,0)`
                let zIndex=10
                let scale=0
                const percent=Math.abs(newY/this.imageHeight)
                let blur=0
                if (newY>0){
                    scale=1+percent
                    this.$refs.bgImage.style[transform]=`scale(${scale})`
                    this.$refs.bgImage.style.zIndex=zIndex
                }
                else{
                    this.$refs.bgImage.style.zIndex=0
                    let blur=Math.min(20*percent,20)
                    this.$refs.filter.style[backdrop]=`blur(${blur})`
                }
                if (newY<this.minHeight){
                    this.$refs.bgImage.style.paddingTop=0
                    this.$refs.bgImage.style.height=`${RESERVED_HEIGHT}px`
                    this.$refs.bgImage.style.zIndex=zIndex
                    this.$refs.playBtn.style.display='none'
                }
                else{
                    this.$refs.bgImage.style.paddingTop='70%'
                    this.$refs.bgImage.style.height=0
                    this.$refs.playBtn.style.display=''
                    if (newY<0){
                         this.$refs.bgImage.style.zIndex=0
                    }  
                }
            }
        },
        created() {
            this.probeType=3,
            this.listScroll=true
        },
        mounted() {
            this.imageHeight=this.$refs.bgImage.clientHeight
            this.minHeight=-this.imageHeight+RESERVED_HEIGHT
            this.$refs.list.$el.style.top=`${this.imageHeight}px`
        },
        components:{
            Scroll,
            SongList,
            Loading
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable.styl'
.music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
    .bg-layer
      overflow:hidden
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>