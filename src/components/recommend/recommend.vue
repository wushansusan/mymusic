<template>
  <div class="recommend" ref="recommend">
    <scroll class="recommend-content" :data="discList" ref="scroll">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <slider>
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <img @load="loadImage" :src="item.picUrl" class="needsclick"/>
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in discList" class="item" @click="selectItem(item)">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"/>
              </div>
              <div class="text">
                <h2 class="title" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import {getRecommend,getDiscList} from '../../api/recommend.js'
import {ERR_OK} from '../../api/config.js'
import Slider from '../../base/slider/slider.vue'
import Scroll from '../../base/scroll/scroll.vue'
import Loading from '../../base/loading/loading.vue'
import {playlistMixin} from '../../common/js/mixin.js'
import {mapMutations} from 'vuex'
export default {
  mixins:[playlistMixin],
  data(){
    return {
      recommends:[],
      discList:[]
    }
  },
  created(){
    this._getRecommend()
    this._getDiscList()
  },
  methods:{
    selectItem(item){
      this.$router.push({path:`/recommend/${item.dissid}`})
      this.setDisc(item)
    },
    handlePlaylist(playlist){
      const bottom=this.playlist.length>0?'60px':''
      this.$refs.recommend.style.bottom=bottom
      this.$refs.scroll.refresh()
    },
    _getRecommend:function(){
      getRecommend().then((res)=>{
        if (res.code===ERR_OK){
          this.recommends=res.data.slider
        }
      })
    },
    _getDiscList(){
      getDiscList().then((res)=>{
        if (res.code===ERR_OK){
          this.discList=res.data.list
        }
      })
    },
    loadImage(){
      if (!this.checkLoaded){
          this.$refs.scroll.refresh()
          this.checkLoaded=true
      }
    },
    ...mapMutations({
      setDisc:'SET_DISC'
    })
  },
  components:{
    Slider,Scroll,Loading
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable"
.recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position:absolute
        left:44%
        bottom:50%
</style>