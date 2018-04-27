"use strict";

import {isV4Format} from "ip";
import {NotEmptyString, Validate, ValidationError} from "validation-api";
import INodeConfig from "../interface/nodeConfig";

const keysAllowed: Map<string, boolean> = new Map([
  ["uid", true],
  ["bindIp", true],
]);

@Validate()
export default class NodeConfig implements INodeConfig {
  @NotEmptyString()
  public uid: string;

  @NotEmptyString()
  public bindIp: string;

  constructor(text: string) {
    let config: INodeConfig;

    // Проверка на удовлетворения требования формату JSON
    try {
      config = JSON.parse(text);
    } catch (e) {
      throw new ValidationError([{
        constraint: "JSON",
        message: "ConfigParseError when trying to parse JSON of system.json",
        property: undefined,
        value: undefined,
      }]);
    }

    // Проверка на исключительно известные ключи в конфигурационном файле
    const extraKeys = Object.keys(config).filter(key => !keysAllowed.has(key));
    if (extraKeys.length) {
      throw new ValidationError([{
        constraint: "ExtraKeys",
        message: "ConfigParseError: keys " + extraKeys.join(", ") + " not allowed",
        property: undefined,
        value: undefined,
      }]);
    }

    if (config.uid) {
      this.uid = config.uid;
    }
    if (config.bindIp) {
      if (!isV4Format(config.bindIp)) {
        throw new ValidationError([{
          constraint: "KeyValueError",
          message: "ConfigParseError: bindIp is not a valid IPv4 address",
          property: undefined,
          value: undefined,
        }]);
      }
      this.bindIp = config.bindIp;
    }
  }
}
