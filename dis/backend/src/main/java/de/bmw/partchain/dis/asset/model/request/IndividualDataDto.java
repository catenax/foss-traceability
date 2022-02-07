package de.bmw.partchain.dis.asset.model.request;

import de.bmw.partchain.dis.asset.validator.IsDateGMT;
import de.bmw.partchain.dis.asset.validator.IsISO3166_1Alpha2CountryCode;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class IndividualDataDto {
    @NotNull(message = "productionCountryCode is a mandatory property therefore can not be null")
    @IsISO3166_1Alpha2CountryCode(message = "productionCountryCode must be in ISO 3166_1 Alpha2 format (i.e. DE)")
    private String productionCountryCode;

    @NotNull(message = "productionDateGMT is a mandatory property therefore can not be null")
    @IsDateGMT(message = "productionDateGMT must be in the format 'yyyy-MM-ddTHH:mm:ssZ'")
    private String productionDateGMT;
}