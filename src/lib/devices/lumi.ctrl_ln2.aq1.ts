import Device from "../device-aqara";

export default class extends Device {
  static model = "lumi.ctrl_ln1.aq1";
  static name = "Aqara Wall Switch (With Neutral, Single Rocker)";
  static image =
    "http://static.home.mi.com/app/image/get/file/developer_1551947119hpbe1ocz.pnghttp://static.home.mi.com/app/image/get/file/developer_1551947140bbugrsl6.png";

  getPower(channel = 0) {
    const power = this.properties[`channel_${channel}`];
    if (power === "on") return true;
    if (power === "off") return false;
    return undefined;
  }

  getPowerCapacity() {
    const powerCapacity = parseInt(this.properties.load_power, 10);
    if (powerCapacity > 0) return powerCapacity;
    return undefined;
  }

  getPowerConsumed() {
    const powerConsumed = parseInt(this.properties.power_consumed, 10);
    if (powerConsumed > 0) return powerConsumed;
    return undefined;
  }

  setPower(v, channel = 0) {
    return this.write({ [`channel_${channel}`]: v ? "on" : "off" });
  }
}
