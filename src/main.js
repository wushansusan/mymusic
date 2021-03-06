import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import './common/stylus/index.styl'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueLazyLoad,{
  loading:require('./common/image/default.png')
})

/*fastclick.attach(document.body)*/

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  store,
  router
})
