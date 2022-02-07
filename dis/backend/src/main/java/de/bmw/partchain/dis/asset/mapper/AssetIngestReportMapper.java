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

import de.bmw.partchain.dis.asset.model.gateway.AssetIngestReport;
import de.bmw.partchain.dis.asset.model.response.AssetFailedReportResponseDto;
import de.bmw.partchain.dis.asset.model.response.SentToLedgerResponseDto;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public abstract class AssetIngestReportMapper
{
    @Mapping(source = "failedAssetEntity.failReasons", target = "failReasons")
    @Mapping(source = "failedAssetEntity.warnings", target = "warnings")
    @Mapping(source = "assetsResponseDto.requestProcessId", target = "requestProcessId")
    @Mapping(source = "assetsResponseDto.requestDate", target = "requestDate")
    @Mapping(source = "assetsResponseDto.mspId", target = "mspId")
    public abstract AssetIngestReport mapTo(AssetFailedReportResponseDto failedAssetEntity,
                                            SentToLedgerResponseDto assetsResponseDto);

    @AfterMapping
    public void setSourceService(@MappingTarget AssetIngestReport entity)
    {
        entity.setSourceService("DIS");
    }
}
