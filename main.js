import App from './App'
import uViewPlus from "@/uni_modules/uview-plus";
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import {
	createSSRApp
} from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.use(uViewPlus)
	return {
		app
	}
}
// #endif