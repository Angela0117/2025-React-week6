import { Modal as BsModal } from 'bootstrap';

/**
 * 建立 Bootstrap 實例
 * @param { HTMLElement } dom - DOM 元素
 * @param { Boolean } backdrop - 靜態背景
 * @returns { BsModal }
 */
export const newBsModel = (dom, backdrop) => new BsModal(dom, { backdrop });