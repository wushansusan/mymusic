<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script>
import MusicList from '@/components/music-list/music-list.vue'
import {mapGetters} from 'vuex'
import {ERR_OK} from '../../api/config.js'
import {getMusicList} from '../../api/rank.js'
import {createSong} from '../../common/js/song.js'
export default {
    data(){
        return {
            songs:[],
            rank:true
        }
    },
    computed:{
        title(){
            return this.topList.topTitle
        },
        bgImage(){
            return this.topList.picUrl
        },
        ...mapGetters([
            'topList'
        ])
    },
    created() {
        this._getMusicList()
    },
    methods:{
        _getMusicList(){
            if (!this.topList.id){
                this.$router.push('/rank')
            }
            getMusicList(this.topList.id).then((res)=>{
                if (res.code===ERR_OK){
                    this.songs=this._normalizeSongs(res.songlist)
                }
            })
        },
        _normalizeSongs(list){
            let ret=[]
            list.forEach((item)=>{
                const musicData=item.data
                if(musicData.songid &&musicData.albumid){
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    },
    components:{
        MusicList
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.slide-enter-active,.slide-leave-active
    transition:all 0.3s
.slide-enter,.slide-leave-to
    transform:translate3d(100%,0,0)
</style>
