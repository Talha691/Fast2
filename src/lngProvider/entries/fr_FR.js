import frFR from "antd/lib/locale/fr_FR";
import appLocaleData from "react-intl/react-intl.iife";
import saMessages from "../locales/fr_FR.json";

const saLang = {
  messages: {
    ...saMessages
  },
  antd: frFR,
  locale: "fr-FR",
  data: appLocaleData
};
export default saLang;