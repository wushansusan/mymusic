<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll class="shortcut" :data="shortcut" ref="shortcut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click.stop="clearConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest :query="query" ref="suggest" @listScroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <confirm text="确定清空所有搜索历史" ref="confirm" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from '../../base/search-box/search-box.vue'
import {getHotKey} from '../../api/search.js'
import {ERR_OK} from '../../api/config.js'
import Suggest from '../suggest/suggest.vue'
import {mapActions} from 'vuex'
import searchList from '../../base/search-list/search-list'
import Confirm from '../../base/confirm/confirm.vue'
import Scroll from '../../base/scroll/scroll.vue'
import {playlistMixin,searchMixin} from '../../common/js/mixin.js'
export default {
    mixins:[playlistMixin,searchMixin],
    data(){
      return {
        hotKey:[]
      }
    },
    components:{
      SearchBox,
      Suggest,
      searchList,
      Confirm,
      Scroll
    },
    watch:{
      query(newQuery){
        if (!newQuery){
          setTimeout(()=>{
            this.$refs.shortcut.refresh()
          },20)
        }
      }
    },
    created() {
      this._getHotKey()
    },
    computed:{
      shortcut(){
        return this.hotKey.concat(this.searchHistory)
      }
    },
    methods:{
      handlePlaylist(playlist){
        const bottom=playlist?'60px':''
        this.$refs.shortcutWrapper.style.bottom=bottom
        this.$refs.shortcut.refresh()
        this.$refs.searchResult.style.bottom=bottom
        this.$refs.suggest.refresh()
      },
      clearConfirm(){
        this.$refs.confirm.show()
      },
      _getHotKey(){
        getHotKey().then((res)=>{
          if (res.code===ERR_OK){
            this.hotKey=res.data.hotkey.slice(0,10)
          }
        })
      },
      ...mapActions([
        'clearSearchHistory'
      ])
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable.styl'
@import '../../common/stylus/mixin.styl'

.search
  .search-box-wrapper
    margin:20px
  .shortcut-wrapper
      position:fixed
      top:178px
      bottom:0
      width:100%
      .shortcut
        height:100%
        overflow:hidden
        .hot-key
          margin:0 20px 20px 20px
          .title
            margin-bottom:20px
            font-size:$font-size-medium
            color:$color-text-l
          .item
            display:inline-block
            padding:5px 10px
            margin:0 20px 10px 0
            border-radius:6px
            background:$color-highlight-background
            color:$color-text-d
            font-size:$font-size-medium
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
  .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
  
</style>
