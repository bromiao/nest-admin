export function successCount(data, count, msg) {
  return {
    code: 0,
    result: data,
    message: msg,
    count,
  };
}
export function success(data, msg) {
  return {
    code: 0,
    result: data,
    // data,
    // count: data?.count || 0,
    message: msg,
  };
}

export function error(msg, code = -1) {
  return {
    code,
    message: msg,
  };
}

export function wrapperResponse(p, msg) {
  return p
    .then((data) => success(data, msg))
    .catch((err) => error(err.message));
}
export function wrapperCountResponse(dataPromise, countPromise, msg) {
  return Promise.all([dataPromise, countPromise])
    .then((res) => {
      const [data, countArr] = res;
      const [count] = countArr;
      return successCount(data, count.count, msg);
    })
    .catch((err) => error(err.message));
}
