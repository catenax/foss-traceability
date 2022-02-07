package de.bmw.partchain.dis.asset.model.request;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class StaticDataDto {
    private String customerContractOneID;
    private String customerOneID;
    private String manufactureContractOneID;
    private String partNameCustomer;

    @NotNull(message = "manufacturerOneID is a mandatory property therefore can not be null")
    private String manufacturerOneID;

    @NotNull(message = "partNumberCustomer is a mandatory property therefore can not be null")
    private String partNumberCustomer;

    @NotNull(message = "partNameManufacturer is a mandatory property therefore can not be null")
    private String partNameManufacturer;

    @NotNull(message = "partNumberManufacturer is a mandatory property therefore can not be null")
    private String partNumberManufacturer;
}