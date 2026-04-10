import {
	http
} from "./request.js";

import { BASE_URL } from "../config.js";

//登录接口要特殊一点
export const post = (path,params,method = "POST") => {
	// let loginInfo = getLoginInfo();
	let post_params = {}
	post_params = {
		...params
	}
	let url = ""
	if(process.env.NODE_ENV === "development"){
	 url = BASE_URL + path;	
	}else{
		url = ""
	}
	return sandPost(url, post_params,method)
}

let postNum = 0;
const sandPost = (url, params,method) => {
	uni.showLoading({
		title: "加载中"
	})
	postNum++;
	return new Promise((resolve, reject) => {
		http(url, params,method).then((res) => {
			postNum--;
			if (postNum <= 0) {
				uni.hideLoading();
			}
			if (res.data.code === 200) {
				resolve(res.data);
			} else {
				uni.showToast({
					title: res.data.message || "接口请求失败",
					icon: 'none',
					duration: 2000
				})
				reject(res.data.msg)
			}
		}).catch((err) => {
			postNum--;
			uni.hideLoading();
			reject(err);
		})
	})
}