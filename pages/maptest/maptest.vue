<template>
	<my-page-container>
		<view class="map-container">
			<view class="map-info">当前选择点位{{JSON.stringify(nowDetail)}}</view>
			<map style="width: 100%; height: 300px;" id="map1" :latitude="latitude" :controls="getControls" @markertap="test"
				:longitude="longitude" :markers="markers" :show-location="true" :enable-traffic="true"></map>
			<button @click="testGo">测试导航</button>
			<button @click="togglePositionSelect">开启/关闭位置选择</button>
			<button @click="addFavoritePoint">添加收藏点</button>
			<button @click="jumpToPoint">跳转点位选择</button>
		</view>
	</my-page-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const latitude = ref(39.909)
const longitude = ref(116.39742)
const markers = ref([{
	id: 1,
	latitude: 39.909,
	longitude: 116.39742,
	width: 30,
	height: 30,
	iconPath: '/static/start.png',
	title: '收藏'
}])

const controls = ref([{
	id: 1,
	iconPath: '/static/tack.png',
	position: {
		left: (uni.getWindowInfo().windowWidth - 50) / 2,
		top: (300 - 100) / 2,
		width: 50,
		height: 50
	},
}])

const nowDetail = ref({})
const showControl = ref(true)

const getControls = computed(() => {
	return showControl.value ? controls.value : []
})

onLoad(() => {

})

const jumpToPoint = () => {
	// uni.getLocation({
	// 	type: 'gcj02',
	// 	success: (res) => {
	// 		const latitude = res.latitude
	// 		const longitude = res.longitude
	// 		uni.openLocation({
	// 			latitude: latitude,
	// 			longitude: longitude,
	// 			success: () => {
	// 				console.log('success')
	// 			}
	// 		})
	// 	}
	// })


}

const test = (e) => {
	nowDetail.value = markers.value.find((item) => {
		return item.id === e.detail.markerId
	})
}

const testGo = () => {
	uni.openLocation({
		latitude: nowDetail.value.latitude,
		longitude: nowDetail.value.longitude,
		success: () => {
			console.log('success')
		}
	})
}

const togglePositionSelect = () => {
	showControl.value = !showControl.value
}

const addFavoritePoint = () => {
	const map1 = uni.createMapContext("map1")
	map1.getCenterLocation({
		success: (res) => {
			console.log("地图中心点坐标：", res)
			console.log("纬度：", res.latitude)
			console.log("经度：", res.longitude)
			const newMarker = {
				id: Date.now(),
				latitude: res.latitude,
				longitude: res.longitude,
				width: 30,
				height: 30,
				iconPath: '/static/start.png',
				title: '新收藏点'
			}
			markers.value.push(newMarker)
			uni.showToast({
				title: '添加收藏成功'
			})
		},
		fail: (err) => {
			console.log("获取失败：", err)
		}
	})
}
</script>

<style scoped>
.map-container {
	padding: 20rpx;
}

.map-info {
	padding: 20rpx;
	font-size: 28rpx;
}
</style>