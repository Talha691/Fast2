import enUS from "antd/lib/locale/en_US";
import appLocaleData from "react-intl/react-intl.iife"
import enMessages from "../locales/en_US.json";

const EnLang = {
  messages: {
    ...enMessages
  },
  antd: enUS,
  locale: "en-US",
  data: appLocaleData
};
export default EnLang;