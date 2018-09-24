import {mapMutations,mapGetters,mapActions} from 'vuex'
import {playMode} from './config.js'
import {shuffle} from './util.js'

export const playlistMixin={
    computed:{
        ...mapGetters([
            'playlist'
        ])
    },
    mounted() {
        this.handlePlaylist(this.playlist)
    },
    activated() {
        this.handlePlaylist(this.playlist)
    },
    watch:{
        playlist(newVal){
            this.handlePlaylist(newVal)
        }
    },
    methods:{
        handlePlaylist(){
            throw new Error('Component must implement handlePlaylist method')
        }
    }
}

export const playerMixin={
    computed:{
        iconMode(){
            return this.mode===playMode.sequence?'icon-sequence':this.mode===playMode.loop?'icon-loop':'icon-random'
        },
        ...mapGetters([
            'playlist',
            'currentSong',
            'currentIndex',
            'mode',
            'sequenceList',
            'favoriteList'
        ])
    },
    methods:{
        toggleFavorite(song){
            if(this.isFavorite(song)){
                this.deleteFavoriteList(song)
            }
            else{
                this.saveFavoriteList(song)
            }
        },
        getFavoriteIcon(song){
            if (this.isFavorite(song)){
                return 'icon-favorite'
            }
            else{
                return 'icon-not-favorite'
            }
        },
        isFavorite(song){
            const index=this.favoriteList.findIndex((item)=>{
                return item.id===song.id
            })
            return index>-1
        },
        changeMode(){
            let mode=(this.mode+1)%3
            this.setPlayMode(mode)
            let list=null
            if (mode===playMode.random){
              list=shuffle(this.sequenceList)
            }
            else{
              list=this.sequenceList
            }
            this.setPlaylist(list)
            this.resetCurrentIndex(list)
          },
        resetCurrentIndex(list){
            let index=list.findIndex((item)=>{
              return item.id===this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        ...mapMutations({
            setPlayingState:'SET_PLAYING_STATE',
            setCurrentIndex:'SET_CURRENT_INDEX',
            setPlayMode:'SET_PLAY_MODE',
            setPlaylist:'SET_PLAYLIST'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ])
    }
}

export const searchMixin={
    data(){
        return {
            query:'',
            refreshDelay:100
        }
    },
    computed:{
        ...mapGetters([
            'searchHistory',
        ])
    },
    methods:{
        saveSearch(){
            this.saveSearchHistory(this.query)
        },
        blurInput(){
            this.$refs.searchBox.blur()
        },
        onQueryChange(query){
            this.query=query
        },
        addQuery(query){
            this.$refs.searchBox.setQuery(query)
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}