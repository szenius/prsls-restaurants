const APP_ROOT = "../../";
const _ = require("lodash");
const aws4 = require("aws4");
const URL = require("url");
const http = require("axios");

const mode = process.env.TEST_MODE;

const viaHandler = async (event, functionName) => {
  const handler = require(`${APP_ROOT}/functions/${functionName}`).handler;

  const context = {};
  const response = await handler(event, context);
  const contentType = _.get(
    response,
    "headers.content-type",
    "application/json"
  );
  if (response.body && contentType === "application/json") {
    response.body = JSON.parse(response.body);
  }
  return response;
};

const respondFrom = async (httpRes) => ({
  statusCode: httpRes.status,
  body: httpRes.data,
  headers: httpRes.headers,
});

const signHttpRequest = (url) => {
  const urlData = URL.parse(url);
  const opts = {
    host: urlData.hostname,
    path: urlData.pathname,
  };

  aws4.sign(opts);
  return opts.headers;
};

const viaHttp = async (relPath, method, opts) => {
  const url = `${process.env.REST_API_URL}/${relPath}`;
  console.info(`invoking via HTTP ${method} ${url}`);

  try {
    const data = _.get(opts, "body");
    let headers = {};
    if (_.get(opts, "iam_auth", false) === true) {
      headers = signHttpRequest(url);
    }

    const authHeader = _.get(opts, "auth");
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const httpReq = http.request({
      method,
      url,
      headers,
      data,
    });

    const res = await httpReq;
    return respondFrom(res);
  } catch (err) {
    if (err.status) {
      return {
        statusCode: err.status,
        headers: err.response.headers,
      };
    } else {
      throw err;
    }
  }
};

const weInvokeGetIndex = async () => {
  switch (mode) {
    case "handler":
      return await viaHandler({}, "getIndex");
    case "http":
      return await viaHttp("", "GET");
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};
const weInvokeGetRestaurants = async () => {
  switch (mode) {
    case "handler":
      return await viaHandler({}, "getRestaurants");
    case "http":
      return await viaHttp("restaurants", "GET", { iam_auth: true });
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};

const weInvokeSearchRestaurants = async (theme, user) => {
  const body = JSON.stringify({ theme });

  switch (mode) {
    case "handler":
      return await viaHandler({ body }, "searchRestaurants");
    case "http":
      const auth = user.idToken;
      return await viaHttp("restaurants/search", "POST", { body, auth });
    default:
      throw new Error(`unsupported mode: ${mode}`);
  }
};

module.exports = {
  weInvokeGetIndex,
  weInvokeGetRestaurants,
  weInvokeSearchRestaurants,
};