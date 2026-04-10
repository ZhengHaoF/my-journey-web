<template>
	<page-container>
		<view class="map-container">
			<view class="map-info">当前选择点位{{JSON.stringify(nowDetail)}}</view>
			<map style="width: 100%; height: 300px;" id="map1" :latitude="latitude" :controls="getControls" @markertap="test"
				:longitude="longitude" :markers="markers" :show-location="true" :enable-traffic="true"></map>
			<button @click="testGo">测试导航</button>
			<button @click="togglePositionSelect">开启/关闭位置选择</button>
			<button @click="addFavoritePoint">添加收藏点</button>
		</view>
	</page-container>
</template>

<script>
	export default {
		data() {
			return {
				latitude: 39.909,
				longitude: 116.39742,
				markers: [{
					id: 1,
					latitude: 39.909,
					longitude: 116.39742,
					width: 30,
					height: 30,
					iconPath: '/static/start.png',
					title: '收藏'
				}],
				controls: [{
					id: 1,
					iconPath: '/static/tack.png',
					position: {
						left: (uni.getWindowInfo().windowWidth - 50) / 2,
						top: (300 - 100) / 2,
						width: 50,
						height: 50
					},
				}],
				nowDetail: {},
				showControl: true,
			}
		},
		computed: {
			getControls() {
				return this.showControl ? this.controls : [];
			}
		},
		onLoad() {


		},
		methods: {
			test(e) {
				this.nowDetail = this.markers.find((item, index) => {
					return item.id === e.detail.markerId;
				});
			},
			testGo() {
				uni.openLocation({
					latitude: this.nowDetail.latitude,
					longitude: this.nowDetail.longitude,
					success: function() {
						console.log('success');
					}
				});

			},
			togglePositionSelect() {
				this.showControl = !this.showControl;
			},
			addFavoritePoint() {
				let map1 = uni.createMapContext("map1", this);
				map1.getCenterLocation({
					success: (res) => {
						console.log("地图中心点坐标：", res);
						console.log("纬度：", res.latitude);
						console.log("经度：", res.longitude);
						const newMarker = {
							id: Date.now(), // 唯一ID
							latitude: res.latitude,
							longitude: res.longitude,
							width: 30,
							height: 30,
							iconPath: '/static/start.png',
							title: '新收藏点'
						};
						this.markers.push(newMarker);
						uni.showToast({
							title: '添加收藏成功'
						});
					},
					fail: (err) => {
						console.log("获取失败：", err);
					}
				})
			}
		}
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