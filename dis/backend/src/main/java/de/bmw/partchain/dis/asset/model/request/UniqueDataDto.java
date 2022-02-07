package de.bmw.partchain.dis.asset.model.request;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UniqueDataDto {
    private String customerUniqueID;

    @NotNull(message = "manufacturerUniqueID is a mandatory property therefore can not be null")
    private String manufacturerUniqueID;

    @NotNull(message = "uniqueID is a mandatory property therefore can not be null")
    private String uniqueID;
}