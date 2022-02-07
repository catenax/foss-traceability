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
package de.bmw.partchain.dis.asset.mapper;

import de.bmw.partchain.dis.asset.model.gateway.Asset;
import de.bmw.partchain.dis.asset.model.gateway.AssetQualityStatus;
import de.bmw.partchain.dis.asset.model.request.SerialNumberType;
import de.bmw.partchain.dis.asset.model.request.CatenaXAssetRequestDto;
import de.bmw.partchain.dis.security.AuthenticationFacade;
import de.bmw.partchain.dis.security.AuthenticationFacadeImpl;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Mapper(componentModel = "spring")
public abstract class AssetMapper {
    @Autowired
    private AuthenticationFacade authenticationFacade;

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "serialNumberType", ignore = true)
    @Mapping(target = "qualityStatus", ignore = true)
    @Mapping(target = "qualityDocuments", ignore = true)
    @Mapping(target = "manufacturerPlant", ignore = true)
    @Mapping(target = "manufacturerLine", ignore = true)
    @Mapping(target = "customFields", ignore = true)
    @Mapping(target = "requestProcessId", ignore = true)
    @Mapping(target = "requestDate", ignore = true)
    @Mapping(target = "mspId", ignore = true)
    @Mapping(target = "serialNumberManufacturer", source = "uniqueData.manufacturerUniqueID")
    @Mapping(target = "serialNumberCustomer", source = "uniqueData.uniqueID")
    @Mapping(target = "manufacturer", source = "staticData.manufacturerOneID")
    @Mapping(target = "partNameManufacturer", source = "staticData.partNameManufacturer")
    @Mapping(target = "partNumberManufacturer", source = "staticData.partNumberManufacturer")
    @Mapping(target = "partNumberCustomer", source = "staticData.partNumberCustomer")
    @Mapping(target = "productionDateGmt", source = "individualData.productionDateGMT")
    @Mapping(target = "productionCountryCodeManufacturer", source = "individualData.productionCountryCode")
    @Mapping(target = "componentsSerialNumbers", source = "partTree.isParentOf")
    public abstract Asset mapFrom(CatenaXAssetRequestDto dto);

    @AfterMapping
    public void assetAfterMapping(@MappingTarget Asset asset, CatenaXAssetRequestDto dto) {
        asset.setRequestDate(new Date());
        asset.setMspId(authenticationFacade.getOtherClaim(AuthenticationFacadeImpl.MSP_ID));
        asset.setSerialNumberType(SerialNumberType.SINGLE);
        asset.setQualityStatus(AssetQualityStatus.OK);
        Map<String, String> customFields = new HashMap<>();
        customFields.put("manufacturerContractOneId", dto.getStaticData().getManufactureContractOneID());
        customFields.put("manufacturerOneId", dto.getStaticData().getManufacturerOneID());
        customFields.put("productionCountryCode", dto.getIndividualData().getProductionCountryCode());
        customFields.put("manufacturerUniqueId", dto.getUniqueData().getManufacturerUniqueID());
        customFields.put("customerUniqueId", dto.getUniqueData().getCustomerUniqueID());
        customFields.put("customerContractOneId", dto.getStaticData().getCustomerContractOneID());
        customFields.put("customerOneId", dto.getStaticData().getCustomerOneID());
        customFields.put("partNameCustomer", dto.getStaticData().getPartNameCustomer());
        if (dto.getQualityAlert() != null) {
            customFields.put("qualityAlert", Boolean.toString(dto.getQualityAlert().isQualityAlert()));
            customFields.put("qualityType", dto.getQualityAlert().getQualitType());
        }
        asset.setCustomFields(customFields);
    }
}
