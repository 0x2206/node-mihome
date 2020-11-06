import crypto from "crypto";
import { debug as d } from "debug";
import fetch, { RequestInfo } from "node-fetch";
import querystring from "querystring";
import randomstring from "randomstring";
import AqaraDevice from "./device-aqara";

const debug = d("mihome:micloud");

type Options = {
  country: "ru" | "us" | "tw" | "sg" | "cn" | "de";
};

const DEFAULT_OPTIONS: Options = {
  country: "cn",
};

class MiCloudProtocol {
  private username: string | null = null;
  // private password = null;
  private ssecurity: string | null = null;
  private userId: string | null = null;
  private serviceToken: string | null = null;

  private REQUEST_TIMEOUT = 5000;
  private AGENT_ID: string = randomstring.generate({
    length: 13,
    charset: "ABCDEF",
  });

  private USERAGENT = `Android-7.1.1-1.0.0-ONEPLUS A3010-136-${this.AGENT_ID} APP/xiaomi.smarthome APPV/62830`;
  private CLIENT_ID: string = randomstring.generate({
    length: 6,
    charset: "alphabetic",
    capitalization: "uppercase",
  });

  private countries: Options["country"][] = ["ru", "us", "tw", "sg", "cn", "de"];
  private locale = "en";

  get isLoggedIn(): boolean {
    return !!this.serviceToken;
  }

  async login(username: string, password: string): Promise<void> {
    debug(`Login with username ${username}`);
    if (this.isLoggedIn) {
      throw new Error(`You're logged in with username ${this.username}. Pls logout first`);
    }
    const { sign } = await this._loginStep1();
    const { ssecurity, userId, location } = await this._loginStep2(username, password, sign);
    const { serviceToken } = await this._loginStep3(sign.indexOf("http") === -1 ? location : sign);
    this.username = username;
    // this.password = password;
    this.ssecurity = ssecurity;
    this.userId = userId;
    this.serviceToken = serviceToken;
  }

  logout(): void {
    if (!this.isLoggedIn) {
      throw new Error("You aren't logged in");
    }
    debug(`Logout username ${this.username}`);
    this.username = null;
    // this.password = null;
    this.ssecurity = null;
    this.userId = null;
    this.serviceToken = null;
  }

  private async request(path: string, data, country: Options["country"] = "cn") {
    if (!this.isLoggedIn) {
      throw new Error("Pls login before make any request");
    }
    if (!this.countries.includes(country)) {
      throw new Error(
        `The country ${country} is not support, list supported countries is ${this.countries.join(", ")}`
      );
    }
    const url = this._getApiUrl(country) + path;
    const params = {
      data: JSON.stringify(data),
    };
    const nonce = this._generateNonce();
    const signedNonce = this._signedNonce(this.ssecurity, nonce);
    const signature = this._generateSignature(path, signedNonce, nonce, params);
    const body = {
      _nonce: nonce,
      data: params.data,
      signature,
    };

    debug(`Request ${url} - ${JSON.stringify(body)}`);
    const res = await fetch(url, {
      method: "POST",
      timeout: this.REQUEST_TIMEOUT,
      headers: {
        "User-Agent": this.USERAGENT,
        "x-xiaomi-protocal-flag-cli": "PROTOCAL-HTTP2",
        "mishop-client-id": "180100041079",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: [
          "sdkVersion=accountsdk-18.8.15",
          `deviceId=${this.CLIENT_ID}`,
          `userId=${this.userId}`,
          `yetAnotherServiceToken=${this.serviceToken}`,
          `serviceToken=${this.serviceToken}`,
          `locale=${this.locale}`,
          "channel=MI_APP_STORE",
        ].join("; "),
      },
      body: querystring.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Request error with status ${res.statusText}`);
    }

    const json = await res.json();
    return json;
  }

  async getDevices(deviceIds: string[], options: Options = DEFAULT_OPTIONS): Promise<AqaraDevice> {
    const req = deviceIds
      ? {
          dids: deviceIds,
        }
      : {
          getVirtualModel: false,
          getHuamiDevices: 0,
        };
    const data = await this.request("/home/device_list", req, options.country);

    return data.result.list;
  }

  async getDevice(deviceId: string, options: Options = DEFAULT_OPTIONS) {
    const req = {
      dids: [String(deviceId)],
    };
    const data = await this.request("/home/device_list", req, options.country);

    return data.result.list[0];
  }

  async miioCall(deviceId: string, method, params: Record<string, any>, options: Options = DEFAULT_OPTIONS) {
    const req = { method, params };
    const data = await this.request(`/home/rpc/${deviceId}`, req, options.country);
    return data.result;
  }

  _getApiUrl(country: Options["country"]): string {
    country = country.trim().toLowerCase() as Options["country"]; // @TODO: is it needed?
    return `https://${country === "cn" ? "" : `${country}.`}api.io.mi.com/app`;
  }

  _parseJson(str: string) {
    if (str.indexOf("&&&START&&&") === 0) {
      str = str.replace("&&&START&&&", "");
    }
    return JSON.parse(str);
  }

  _generateSignature(path: string, _signedNonce: string, nonce: string, params: Record<string, any>) {
    const exps = [];
    exps.push(path);
    exps.push(_signedNonce);
    exps.push(nonce);

    const paramKeys = Object.keys(params);
    paramKeys.sort();
    for (let i = 0, { length } = paramKeys; i < length; i++) {
      const key = paramKeys[i];
      exps.push(`${key}=${params[key]}`);
    }

    return crypto.createHmac("sha256", Buffer.from(_signedNonce, "base64")).update(exps.join("&")).digest("base64");
  }

  _generateNonce() {
    const buf = Buffer.allocUnsafe(12);
    buf.write(crypto.randomBytes(8).toString("hex"), 0, undefined, "hex");
    buf.writeInt32BE(Date.now() / 60000, 8);
    return buf.toString("base64");
  }

  _signedNonce(ssecret: string, nonce: string) {
    const s = Buffer.from(ssecret, "base64");
    const n = Buffer.from(nonce, "base64");
    return crypto.createHash("sha256").update(s).update(n).digest("base64");
  }

  async _loginStep1() {
    const url = "https://account.xiaomi.com/pass/serviceLogin?sid=xiaomiio&_json=true";
    const res = await fetch(url);

    const content = await res.text();
    const { statusText } = res;
    debug(`Login step 1: ${statusText} - ${content}`);

    if (!res.ok) {
      throw new Error(`Response step 1 error with status ${statusText}`);
    }

    const data = this._parseJson(content);

    if (!data._sign) {
      throw new Error("Login step 1 failed");
    }

    return {
      sign: data._sign,
    };
  }

  async _loginStep2(username: string, password: string, sign) {
    const formData = querystring.stringify({
      hash: crypto.createHash("md5").update(password).digest("hex").toUpperCase(),
      _json: "true",
      sid: "xiaomiio",
      callback: "https://sts.api.io.mi.com/sts",
      qs: "%3Fsid%3Dxiaomiio%26_json%3Dtrue",
      _sign: sign,
      user: username,
    });

    const url = "https://account.xiaomi.com/pass/serviceLoginAuth2";
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": this.USERAGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: ["sdkVersion=accountsdk-18.8.15", `deviceId=${this.CLIENT_ID};`].join("; "),
      },
    });

    const content = await res.text();
    const { statusText } = res;
    debug(`Login step 2: ${statusText} - ${content}`);

    if (!res.ok) {
      throw new Error(`Response step 2 error with status ${statusText}`);
    }

    const { ssecurity, userId, location } = this._parseJson(content);

    if (!ssecurity || !userId || !location) {
      throw new Error("Login step 2 failed");
    }

    this.ssecurity = ssecurity; // Buffer.from(data.ssecurity, 'base64').toString('hex');
    this.userId = userId;
    return {
      ssecurity,
      userId,
      location,
    };
  }

  async _loginStep3(location: RequestInfo) {
    const url = location;
    const res = await fetch(url);

    const content = await res.text();
    const { statusText } = res;
    debug(`Login step 3: ${statusText} - ${content}`);

    if (!res.ok) {
      throw new Error(`Response step 3 error with status ${statusText}`);
    }

    const headers = res.headers.raw();
    const cookies = headers["set-cookie"];
    let serviceToken: string | null = null;
    cookies.forEach((cookieStr) => {
      const cookie = cookieStr.split("; ")[0];
      const idx = cookie.indexOf("=");
      const key = cookie.substr(0, idx);
      const value = cookie.substr(idx + 1, cookie.length).trim();
      if (key === "serviceToken") {
        serviceToken = value;
      }
    });
    if (!serviceToken) {
      throw new Error("Login step 3 failed");
    }
    return {
      serviceToken,
    };
  }
}

export default new MiCloudProtocol();
