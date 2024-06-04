import zhCN from "antd/lib/locale/zh_CN";
import appLocaleData from "react-intl/react-intl.iife";
import zhMessages from "../locales/zh-Hans.json";

const ZhLan = {
  messages: {
    ...zhMessages
  },
  antd: zhCN,
  locale: "zh-Hans-CN",
  data: appLocaleData
};
export default ZhLan;