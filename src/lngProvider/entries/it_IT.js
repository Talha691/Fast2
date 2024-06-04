import itIT from "antd/lib/locale/it_IT";
import appLocaleData from "react-intl/react-intl.iife";
import saMessages from "../locales/it_IT.json";

const saLang = {
  messages: {
    ...saMessages
  },
  antd: itIT,
  locale: "it-IT",
  data: appLocaleData
};
export default saLang;