import caES from "antd/lib/locale/ca_ES";
import appLocaleData from "react-intl/react-intl.iife";
import saMessages from "../locales/es_ES.json";

const saLang = {
  messages: {
    ...saMessages
  },
  antd: caES,
  locale: "ca-ES",
  data: appLocaleData
};
export default saLang;