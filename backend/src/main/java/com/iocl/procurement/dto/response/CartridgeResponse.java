package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.Cartridge;

public class CartridgeResponse {

    private Long id;
    private String printerName;
    private Integer numberOfPrinters;
    private String cartridgeName;
    private String partNumber;
    private Boolean active;

    public CartridgeResponse() {
    }

    public CartridgeResponse(Cartridge cartridge) {
        if (cartridge != null) {
            this.id = cartridge.getId();
            this.printerName = cartridge.getPrinterName();
            this.numberOfPrinters = cartridge.getNumberOfPrinters();
            this.cartridgeName = cartridge.getCartridgeName();
            this.partNumber = cartridge.getPartNumber();
            this.active = cartridge.getActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public Integer getNumberOfPrinters() {
        return numberOfPrinters;
    }

    public void setNumberOfPrinters(Integer numberOfPrinters) {
        this.numberOfPrinters = numberOfPrinters;
    }

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
