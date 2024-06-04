// import arSA from "antd/lib/locale/ar_SA";
import arSA from "antd/lib/locale/ar_EG";
import appLocaleData from "react-intl/react-intl.iife";
import saMessages from "../locales/ar_SA.json";

const saLang = {
  messages: {
    ...saMessages
  },
  antd: arSA,
  locale: "ar-SA",
  data: appLocaleData
};
export default saLang;
