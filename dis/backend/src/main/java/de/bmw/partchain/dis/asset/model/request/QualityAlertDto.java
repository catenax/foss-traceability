package de.bmw.partchain.dis.asset.model.request;

import lombok.Data;

@Data
public class QualityAlertDto {
    private boolean qualityAlert;
    private String qualitType;
}