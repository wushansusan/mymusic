<template>
    <transition>
        <div class="user-center">
            <div class="back" @click="back">
                <i class="icon-back"></i>
            </div>
            <div class="switches-wrapper">
                <switches @switch="switchItem" :switches="switches" :currentIndex="currentIndex"></switches>
            </div>
            <div class="play-btn" ref="playBtn" @click="random">
                <i class="icon-play"></i>
                <span class="text">随机播放全部</span>
            </div>
            <div class="list-wrapper" ref="listWrapper">
                <scroll v-if="currentIndex===0" :data="favoriteList" class="list-scroll" ref="favoriteList">
                    <div class="list-inner">
                        <song-list :songs="favoriteList" @select="selectSong"></song-list>
                    </div>
                </scroll>
                <scroll :data="playHistory" class="list-scroll" ref="playList" v-if="currentIndex===1">
                    <div class="list-inner">
                        <song-list :songs="playHistory" @select="selectSong"></song-list>
                    </div>
                </scroll>
            </div>
            <div class="no-result-wrapper" v-show="noResult">
                <no-result :title="noResultDesc"></no-result>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript">
import Switches from '../../base/switches/switches.vue'
import Scroll from '../../base/scroll/scroll.vue'
import SongList from '../../base/song-list/song-list.vue'
import {mapGetters,mapActions} from 'vuex'
import Song from '../../common/js/song.js'
import {playlistMixin} from '../../common/js/mixin.js'
import NoResult from '../../base/no-result/no-result.vue'
export default{
    mixins:[playlistMixin],
    data(){
        return {
            switches:[
                {name:'我喜欢的'},
                {name:'最近听的'}
            ],
            currentIndex:0
        }
    },
    computed:{
        noResultDesc(){
            return this.currentIndex===0?'暂无收藏歌曲':'你还没听任何歌曲'
        },
        noResult(){
            if (this.currentIndex===0){
                return !this.favoriteList.length
            }
            else{
                return !this.playHistory.length
            }
        },
        ...mapGetters([
            'playHistory',
            'favoriteList'
        ])
    },
    methods:{
        handlePlaylist(playlist){
            const bottom=playlist.length?'60px':''
            this.$refs.listWrapper.style.bottom=bottom
            this.$refs.favoriteList&&this.$refs.favoriteList.refresh()
            this.$refs.playList&&this.$refs.playList.refresh()
        },
        random(){
            let list=this.currentIndex===0?this.favoriteList:this.playHistory
            if (list.length===0){
                return
            }
            list.map((song)=>{
                return new Song(song)
            })
            this.randomPlay({
                list
            })
        },
        back(){
            this.$router.back()
        },
        selectSong(song){
            this.insertSong(new Song(song))
        },
        switchItem(index){
            this.currentIndex=index
        },
        ...mapActions([
            'insertSong',
            'randomPlay'
        ])
    },
    components:{
        Switches,
        Scroll,
        SongList,
        NoResult
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable.styl'
.user-center
    position:fixed
    top:0
    bottom:0
    z-index:100
    width:100%
    background: $color-background
    &.slide-enter-active,&.slide-leave-active
        transition:all 0.3s
    &.slide-enter,&.slide-leave-to
        transform:translate3d(100%,0,0)
    .back
        position:absolute
        top:0
        left:6px
        z-index:50
        .icon-back
            display: block
            padding: 10px
            font-size: $font-size-large-x
            color: $color-theme
    .switches-wrapper
        margin: 10px 0 30px 0
    .play-btn
        position:absolute
        left:30%
        box-sizing:border-box
        width:135px
        padding:7px 0
        text-align:center
        border: 1px solid  $color-text-l
        color: $color-text-l
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
    .list-wrapper
        position:absolute
        top:110px
        bottom:0
        width:100%
        .list-scroll
            height:100%
            overflow:hidden
            .list-inner
                padding: 20px 30px
    .no-result-wrapper
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>