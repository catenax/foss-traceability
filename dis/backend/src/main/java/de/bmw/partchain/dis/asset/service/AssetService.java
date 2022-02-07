/*
 *  Copyright 2021 The PartChain Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

package de.bmw.partchain.dis.asset.service;

import de.bmw.partchain.dis.asset.gateway.AssetGateway;
import de.bmw.partchain.dis.asset.mapper.AssetMapper;
import de.bmw.partchain.dis.asset.model.gateway.Asset;
import de.bmw.partchain.dis.asset.model.request.CatenaXAssetRequestDto;
import de.bmw.partchain.dis.asset.model.request.StaticDataDto;
import de.bmw.partchain.dis.asset.service.cdq.bpn.LookupBusinessPartnersService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AssetService {
    public static final String BUSINESS_PARTNER_NAME = "businessPartnerName";
    public static final String BUSINESS_PARTNER_PLANT_NAME = "businessPartnerPlantName";
    public static final String CUSTOMER_PARTNER_NAME = "customerPartnerName";
    public static final String CUSTOMER_PARTNER_PLANT_NAME = "customerPartnerPlantName";
    private final AssetGateway ledgerGateway;
    private final AssetMapper mapper;
    private final LookupBusinessPartnersService lookupBusinessPartnersService;

    public AssetService(AssetGateway ledgerGateway, AssetMapper mapper, LookupBusinessPartnersService lookupBusinessPartnersService) {
        this.ledgerGateway = ledgerGateway;
        this.mapper = mapper;
        this.lookupBusinessPartnersService = lookupBusinessPartnersService;
    }

    public void sendToLedger(CatenaXAssetRequestDto assetRequestDto, String requestProcessId) {
        Asset assetKafkaEntity = mapper.mapFrom(assetRequestDto);
        assetKafkaEntity.setRequestProcessId(requestProcessId);

        enrichAssetWithBPN(assetKafkaEntity, assetRequestDto);

        ledgerGateway.sendToLedger(assetKafkaEntity);
    }

    private void enrichAssetWithBPN(Asset assetKafkaEntity, CatenaXAssetRequestDto assetRequestDto) {
        log.debug("Enriching asset with BPN data.");

        try {
            String productionCountryCode = assetRequestDto.getIndividualData().getProductionCountryCode();
            StaticDataDto staticData = assetRequestDto.getStaticData();

            if (!staticData.getManufactureContractOneID().isEmpty()) {
                assetKafkaEntity.getCustomFields().put(BUSINESS_PARTNER_NAME, lookupBusinessPartnersService.
                        getBusinessPartnerName(staticData.getManufactureContractOneID(), productionCountryCode));
            }
            if (staticData.getManufacturerOneID().isEmpty()) {
                assetKafkaEntity.getCustomFields().put(BUSINESS_PARTNER_PLANT_NAME, lookupBusinessPartnersService.
                        getBusinessPartnerName(staticData.getManufacturerOneID(), productionCountryCode));
            }
            if (!staticData.getCustomerContractOneID().isEmpty()) {
                assetKafkaEntity.getCustomFields().put(CUSTOMER_PARTNER_NAME, lookupBusinessPartnersService.
                        getBusinessPartnerName(staticData.getCustomerContractOneID(), productionCountryCode));
            }
            if (!staticData.getCustomerOneID().isEmpty()) {
                assetKafkaEntity.getCustomFields().put(CUSTOMER_PARTNER_PLANT_NAME, lookupBusinessPartnersService.
                        getBusinessPartnerName(staticData.getCustomerOneID(), productionCountryCode));
            }

        } catch (Exception e) {
            log.warn("Unable to fetch BPN data");
            log.debug(e.getMessage());
        }
    }
}