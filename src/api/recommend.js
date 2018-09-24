import {commonParams,options} from './config.js'
import jsonp from '../common/js/jsonp.js'
import axios from 'axios'

export function getRecommend(){
    const url='https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
    const data=Object.assign({},commonParams,{
        platform:'h5',
        needNewCode:1,
        uin:0
    })
    return jsonp(url,data,options)
}

export function getDiscList(){
    const url='/api/getDiscList'
    const data=Object.assign({},commonParams,{
        platform:'yqq',
        hostUin:0,
        sin:0,
        ein:29,
        sortId:5,
        needNewCode:0,
        categoryId:10000000,
        rnd:Math.random(),
        format:'json'
    })

    return axios.get(url,{
        params:data
    }).then((res)=>{
                    return Promise.resolve(res.data)
        })
}

export function getSongList(disstid) {
    const url = '/api/getSongList'
    const data = Object.assign({}, commonParams, {
      disstid:disstid,
      g_tk: 5381,
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      platform: 'h5',
      hostUin: 0,
      needNewCode: 0,
      picmid: 1,
      format: 'json',
      new_format: 1,
      song_begin: 0,
      song_num: 15,
      pic: 500,
      _: 1535613661196
    })
  
    return axios.get(url,{
        params:data
    }).then((res)=>{
                    return Promise.resolve(res.data)
        })
}