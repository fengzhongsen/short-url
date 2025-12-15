import { createSlice } from '@reduxjs/toolkit';
import QRCode from 'qrcode';
import request from '../utils/request';
import { getOrigin } from '../utils/origin';
import { setError } from './errorReducer';

const origin = getOrigin();

const slice = createSlice({
  name: 'entity',
  initialState: null,
  reducers: {
    setEntity(state, action) {
      return action.payload;
    },
    clearEntity(state, action) {
      return null;
    },
  },
});

export const { setEntity, clearEntity } = slice.actions;

export const generateShortUrl = (originUrl) => {
  return async (dispatch) => {
    try {
      const res = await request.shortUrl(originUrl);
      const shortUrl = `${origin}/${res.code}`;
      const qrcode = await QRCode.toDataURL(shortUrl, { errorCorrectionLevel: 'H' });
      dispatch(
        setEntity({
          originUrl,
          shortUrl,
          qrcode,
          code: res.code,
        })
      );
      // 移除自动复制到剪贴板
      // copy(shortUrl);
    } catch (error) {
      dispatch(setError(error.response?.data?.error || error.message || '生成短链接失败'));
    }
  };
};

export default slice.reducer;
