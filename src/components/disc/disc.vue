<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from '@/components/music-list/music-list.vue'
import {mapGetters} from 'vuex'
import {getSongList} from '../../api/recommend.js'
import {ERR_OK} from '../../api/config.js'
import {createSong} from '../../common/js/song.js'
export default {
    data(){
        return {
            songs:[]
        }
    },
    computed:{
        title(){
            return this.disc.dissname
        },
        bgImage(){
            return this.disc.imgurl
        },
        ...mapGetters([
            'disc'
        ])
    },
    created() {
        this._getSongList()
    },
    methods:{
        _getSongList(){
            if(!this.disc.dissid){
                this.$router.push('/recommend')
            }
            getSongList(this.disc.dissid).then((res)=>{
                if (res.code===ERR_OK){
                    this.songs=this._normalizeSong(res.cdlist[0].songlist)
                }
            })
        },
        _normalizeSong(list){
            let ret=[]
            list.forEach((musicData)=>{
                if(musicData.id &&musicData.album.id){
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
