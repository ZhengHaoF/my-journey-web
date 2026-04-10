<template>
	<view class="page-container" :style="{ height: containerHeight + 'px' }">
		<up-status-bar></up-status-bar>
		<view class="page-content">
			<slot />
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
	bottomPadding: {
		type: Number,
		default: 140
	}
});

const containerHeight = ref(0);

onMounted(() => {
	const systemInfo = uni.getSystemInfoSync();
	containerHeight.value = systemInfo.windowHeight;
});
</script>

<style lang="scss" scoped>
.page-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

.page-content {
	flex: 1;
	overflow-y: auto;
}
</style>
