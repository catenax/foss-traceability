package de.bmw.partchain.dis.asset.model.request;

import lombok.Data;

import javax.validation.Valid;

@Data
public class CatenaXAssetRequestDto {
    @Valid
    private StaticDataDto staticData;

    @Valid
    private UniqueDataDto uniqueData;

    @Valid
    private IndividualDataDto individualData;

    private TreeDto supplierTree;
    private TreeDto partTree;
    private QualityAlertDto qualityAlert;
}