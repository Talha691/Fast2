export function addWebpackModuleRule(rule) {
    return config => {
      config.module.rules.push(rule);
      return config;
    };
  }