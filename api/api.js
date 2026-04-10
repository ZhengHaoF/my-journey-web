import {post} from "../utils/post.js";

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