const ErrorCode = {
  SUCCESS: 0, // 成功
  ERROR: 1, // 通用错误
  PARAM_ERROR: 10001, // 参数错误
  USER_EXIST: 10002, // 用户已存在
  USER_NOT_FOUND: 10003, // 用户不存在
  PASSWORD_ERROR: 10004, // 密码错误
  TOKEN_INVALID: 10005, // Token 无效
  TOKEN_EXPIRED: 10006, // Token 过期
  PERMISSION_DENIED: 10007, // 无权限
  NOT_FOUND: 10008, // 资源不存在
  SERVER_ERROR: 500, // 服务器错误
};

const HttpStatus = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const success = (res, data = null, msg = 'success') => {
  res.status(HttpStatus.OK).json({
    code: ErrorCode.SUCCESS,
    msg,
    data,
  });
};

const error = (res, code = ErrorCode.ERROR, msg = 'error', httpStatus = HttpStatus.OK) => {
  res.status(httpStatus).json({
    code,
    msg,
    data: null,
  });
};

module.exports = {
  ErrorCode,
  HttpStatus,
  success,
  error,
};
