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
package de.bmw.partchain.dis.asset.model.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
public class SentToLedgerResponseDto
{
    private String requestProcessId;
    private Date requestDate;
    @JsonIgnore
    private String mspId;
    private List<Integer> processedAssets;
    private List<AssetFailedReportResponseDto> failedAssets;

    public SentToLedgerResponseDto()
    {
        this(new ArrayList<>(), new ArrayList<>());
        requestDate = new Date();
        requestProcessId = UUID.randomUUID()
                .toString();
    }

    public SentToLedgerResponseDto(List<Integer> validAssets, List<AssetFailedReportResponseDto> invalidAssets)
    {
        this.processedAssets = validAssets;
        this.failedAssets = invalidAssets;
    }

    public final void addFailedAsset(int index,
                                     AssetFailType failType,
                                     List<String> failReasons)
    {
        failedAssets.add(new AssetFailedReportResponseDto(index, failType, failReasons));
    }

    public final void addProcessedAssetIndex(int index)
    {
        processedAssets.add(index);
    }
}
