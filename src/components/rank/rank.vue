<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" :data="topList" ref="toplist">
      <ul>
        <li class="item" v-for="item in topList" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl"/>
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.songList">
              <span>{{index+1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import {getTopList} from '../../api/rank.js'
import {ERR_OK} from '../../api/config.js'
import Scroll from '../../base/scroll/scroll.vue'
import {playlistMixin} from '../../common/js/mixin.js'
import {mapMutations} from 'vuex'
export default {
    mixins:[playlistMixin],
    created() {
      this._getTopList()
    },
    data(){
      return {
        topList:[]
      }
    },
    components:{
      Scroll
    },
    methods:{
      selectItem(item){
        this.$router.push({path:`/rank/${item.id}`})
        this.setTopList(item)
      },
      handlePlaylist(playlist){
        const bottom=playlist.length>0?'60px':''
        this.$refs.rank.style.bottom=bottom
        this.$refs.toplist.refresh()
      },
      _getTopList(){
        getTopList().then((res)=>{
          if (res.code===ERR_OK){
            this.topList=res.data.topList
          }
        })
      },
      ...mapMutations({
        setTopList:'SET_TOP_LIST'
      })
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable.styl'
@import '../../common/stylus/mixin.styl'

.rank
  position:fixed
  top:88px
  width:100%
  bottom:0
  .toplist
    height:100%
    overflow:hidden
    .item
      display:flex
      margin:0 20px
      padding-top:20px
      height:100px
      &:last-child
        padding-bottom:20px
      .icon
        flex:0 0 100px
        width:100px
        height:100px
      .songlist
        flex:1
        display:flex
        flex-direction:column
        justify-content:center
        padding: 0 20px
        height: 100px
        overflow: hidden
        background: $color-highlight-background
        color: $color-text-d
        font-size: $font-size-small
        .song
          no-wrap()
          line-height: 26px
</style>
