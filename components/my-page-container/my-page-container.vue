<template>
	<view class="my-page-container" :style="{ height: containerHeight + 'px' }">
		<!-- <up-status-bar></up-status-bar> -->
		<view class="page-content" :style="{ paddingBottom: bottomPaddingHeight }">
			<slot />
		</view>

		<!-- 底部插槽区域 -->
		<view class="bottom-actions" v-if="showBottomActions">
			<slot name="bottom-actions" />
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const props = defineProps({
	bottomPadding: {
		type: Number,
		default: 140
	},
	showBottomActions: {
		type: Boolean,
		default: false
	}
});

const containerHeight = ref(0);
const bottomActionsHeight = 120;

const bottomPaddingHeight = computed(() => {
	return props.showBottomActions ? bottomActionsHeight + 'rpx' : '0';
});

onLoad(() => {
	const systemInfo = uni.getSystemInfoSync();
	containerHeight.value = systemInfo.windowHeight;
});
</script>

<style lang="scss" scoped>
.my-page-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

.page-content {
	flex: 1;
	overflow-y: auto;
	position: relative;
}

.bottom-actions {
	padding: 24rpx 32rpx;
	background: #ffffff;
	padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	box-sizing: border-box;
	z-index: 100;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
