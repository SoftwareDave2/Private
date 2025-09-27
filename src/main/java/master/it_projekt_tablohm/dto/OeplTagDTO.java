package master.it_projekt_tablohm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OeplTagDTO {

    private String mac;
    private String hash;
    private long lastseen;
    private long nextupdate;
    private long nextcheckin;
    private int pending;
    private String alias;
    private int contentMode;

    @JsonProperty("LQI")
    private int lqi;

    @JsonProperty("RSSI")
    private int rssi;

    private int temperature;
    private int batteryMv;
    private int hwType;
    private int wakeupReason;
    private int capabilities;
    private String modecfgjson;
    private boolean isexternal;
    private String apip;
    private int rotate;
    private int lut;
    private int invert;
    private int updatecount;
    private long updatelast;
    private int ch;
    private int ver;

    // --- getters and setters ---

    public String getMac() { return mac; }
    public void setMac(String mac) { this.mac = mac; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }

    public long getLastseen() { return lastseen; }
    public void setLastseen(long lastseen) { this.lastseen = lastseen; }

    public long getNextupdate() { return nextupdate; }
    public void setNextupdate(long nextupdate) { this.nextupdate = nextupdate; }

    public long getNextcheckin() { return nextcheckin; }
    public void setNextcheckin(long nextcheckin) { this.nextcheckin = nextcheckin; }

    public int getPending() { return pending; }
    public void setPending(int pending) { this.pending = pending; }

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }

    public int getContentMode() { return contentMode; }
    public void setContentMode(int contentMode) { this.contentMode = contentMode; }

    public int getLqi() { return lqi; }
    public void setLqi(int lqi) { this.lqi = lqi; }

    public int getRssi() { return rssi; }
    public void setRssi(int rssi) { this.rssi = rssi; }

    public int getTemperature() { return temperature; }
    public void setTemperature(int temperature) { this.temperature = temperature; }

    public int getBatteryMv() { return batteryMv; }
    public void setBatteryMv(int batteryMv) { this.batteryMv = batteryMv; }

    public int getHwType() { return hwType; }
    public void setHwType(int hwType) { this.hwType = hwType; }

    public int getWakeupReason() { return wakeupReason; }
    public void setWakeupReason(int wakeupReason) { this.wakeupReason = wakeupReason; }

    public int getCapabilities() { return capabilities; }
    public void setCapabilities(int capabilities) { this.capabilities = capabilities; }

    public String getModecfgjson() { return modecfgjson; }
    public void setModecfgjson(String modecfgjson) { this.modecfgjson = modecfgjson; }

    public boolean isIsexternal() { return isexternal; }
    public void setIsexternal(boolean isexternal) { this.isexternal = isexternal; }

    public String getApip() { return apip; }
    public void setApip(String apip) { this.apip = apip; }

    public int getRotate() { return rotate; }
    public void setRotate(int rotate) { this.rotate = rotate; }

    public int getLut() { return lut; }
    public void setLut(int lut) { this.lut = lut; }

    public int getInvert() { return invert; }
    public void setInvert(int invert) { this.invert = invert; }

    public int getUpdatecount() { return updatecount; }
    public void setUpdatecount(int updatecount) { this.updatecount = updatecount; }

    public long getUpdatelast() { return updatelast; }
    public void setUpdatelast(long updatelast) { this.updatelast = updatelast; }

    public int getCh() { return ch; }
    public void setCh(int ch) { this.ch = ch; }

    public int getVer() { return ver; }
    public void setVer(int ver) { this.ver = ver; }
}
