import {post} from "../utils/post.js";
import { BASE_URL, WX_BASE_URL } from "../config.js";

const getBaseUrl = () => {
	return process.env.NODE_ENV === "development" ? BASE_URL : WX_BASE_URL;
};

/**
 * 图片上传接口
 * @param filePath 文件临时路径
 * @returns {Promise}
 */
export const uploadImage = (filePath) => {
	return new Promise((resolve, reject) => {
		const baseUrl = getBaseUrl();
		const url = baseUrl + "/file/upload";
		
		const userInfo = uni.getStorageSync('userInfo');
		const token = userInfo ? userInfo.token : '';
		
		uni.uploadFile({
			url: url,
			filePath: filePath,
			name: 'file',
			header: {
				'Authorization': `Bearer ${token}`
			},
			success: (res) => {
				try {
					const data = JSON.parse(res.data);
					if (data.code === 200) {
						data.data.url = baseUrl + data.data.url;
						resolve(data);
					} else {
						uni.showToast({
							title: data.message || '上传失败',
							icon: 'none'
						});
						reject(data);
					}
				} catch (e) {
					console.error('解析上传响应失败:', e);
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					});
					reject(e);
				}
			},
			fail: (error) => {
				console.error('上传失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
				reject(error);
			}
		});
	});
};

/**
 * APP登录
 * @param params {username, password}
 * @returns {*|Promise<unknown>}
 */
export const loginAPP = (params) => {
  return post("/user/login",params,"POST");
};

/**
 * 用户注册
 * @param params {username, password}
 * @returns {*|Promise<unknown>}
 */
export const registerAPP = (params) => {
  return post("/user/register",params,"POST");
};

/**
 * 获取行程列表
 * @returns {*|Promise<unknown>}
 */
export const getTripList = () => {
  return post("/trip/list",{}, "GET");
};

/**
 * 获取行程详情
 * @param uuid 行程唯一标识
 * @returns {*|Promise<unknown>}
 */
export const getTripDetail = (uuid) => {
  return post(`/trip/detail/${uuid}`, {}, "GET");
};

/**
 * 创建行程
 * @param params {title, text, startDate, endDate, cover}
 * @returns {*|Promise<unknown>}
 */
export const createTrip = (params) => {
  return post("/trip/create", params, "POST");
};

/**
 * 修改行程
 * @param uuid 行程唯一标识
 * @param params {title, text, startDate, endDate, cover}
 * @returns {*|Promise<unknown>}
 */
export const updateTrip = (uuid, params) => {
  return post(`/trip/update/${uuid}`, params, "PUT");
};

/**
 * 删除行程
 * @param uuid 行程唯一标识
 * @returns {*|Promise<unknown>}
 */
export const deleteTrip = (uuid) => {
  return post(`/trip/delete/${uuid}`, {}, "DELETE");
};

/**
 * 获取收藏点位列表
 * @returns {*|Promise<unknown>}
 */
export const getCollectList = () => {
  return post("/user-collect/list", {}, "GET");
};

/**
 * 获取收藏点位详情
 * @param uuid 收藏点位唯一标识
 * @returns {*|Promise<unknown>}
 */
export const getCollectDetail = (uuid) => {
  return post(`/user-collect/detail/${uuid}`, {}, "GET");
};

/**
 * 新增收藏点位
 * @param params {title, latitude, longitude, address, remark}
 * @returns {*|Promise<unknown>}
 */
export const createCollect = (params) => {
  return post("/user-collect/create", params, "POST");
};

/**
 * 修改收藏点位
 * @param uuid 收藏点位唯一标识
 * @param params {title, address, remark}
 * @returns {*|Promise<unknown>}
 */
export const updateCollect = (uuid, params) => {
  return post(`/user-collect/update/${uuid}`, params, "PUT");
};

/**
 * 删除收藏点位
 * @param uuid 收藏点位唯一标识
 * @returns {*|Promise<unknown>}
 */
export const deleteCollect = (uuid) => {
  return post(`/user-collect/delete/${uuid}`, {}, "DELETE");
};

/**
 * 批量查询收藏点位
 * @param params {uuids: array}
 * @returns {*|Promise<unknown>}
 */
export const batchGetCollect = (params) => {
  return post("/user-collect/batch", params, "POST");
};

/**
 * 逆地址解析
 * @param params {address}
 * @returns {*|Promise<unknown>}
 */
export const getGeocoder = (params) => {
  return post("/proxy/geocoder", params, "GET");
};


/**
 * 地点关键词输入提示
 * @param params {address}
 * @returns {*|Promise<unknown>}
 */
export const getSuggestion = (params) => {
  return post("/proxy/suggestion", params, "GET");
};

/**
 * 获取用户信息
 * @returns {*|Promise<unknown>}
 */
export const getUserInfo = () => {
  return post("/user/info", {}, "GET");
};

/**
 * 更新用户信息
 * @param params {avatar, gender, birthday}
 * @returns {*|Promise<unknown>}
 */
export const updateUserInfo = (params) => {
  return post("/user/info", params, "PUT");
};

/**
 * 修改密码
 * @param params {oldPassword, newPassword}
 * @returns {*|Promise<unknown>}
 */
export const updatePassword = (params) => {
  return post("/user/password", params, "PUT");
};
