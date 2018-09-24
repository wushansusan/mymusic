<template>
    <transition name="slide">
        <div class="singer-detail">
            <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
        </div>
    </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail} from '../../api/singer.js'
import {ERR_OK} from '../../api/config.js'
import {createSong} from '../../common/js/song.js'
import MusicList from '../../components/music-list/music-list.vue'
export default {
    data(){
        return {
            songs:[]
        }
    },
    computed:{
        ...mapGetters([
            'singer'
        ]),
         title(){
            return this.singer.name
        },
        bgImage(){
            return this.singer.avatar
        }

    },
    created() {
        this._getSingerDetail()
    },
    methods:{
        _getSingerDetail(){
            if (!this.singer.id){
                this.$router.push({
                    path:'/singer'
                })
                return
            }
            getSingerDetail(this.singer.id).then((res)=>{
                if (res.code===ERR_OK){
                    this.songs=this._normalizeSongs(res.data.list)
                }
            })
        },
        _normalizeSongs(list){
            let ret=[]
            list.forEach((item)=>{
                let {musicData}=item
                if (musicData.songid && musicData.albummid){
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
@import '../../common/stylus/variable.styl'
.slide-enter-active,.slide-leave-active
    transition:all 0.3s
.slide-enter,.slide-leave-to
    transform:translate3d(100%,0,0)
</style>
