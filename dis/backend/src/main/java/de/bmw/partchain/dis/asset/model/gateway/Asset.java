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

package de.bmw.partchain.dis.asset.model.gateway;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bmw.partchain.dis.asset.model.request.SerialNumberType;
import lombok.Data;
import lombok.SneakyThrows;

import java.util.Date;
import java.util.Map;
import java.util.Set;

@Data
public class Asset
{
    @JsonProperty
    private String requestProcessId;
    @JsonProperty
    private Date requestDate;
    @JsonProperty
    private String manufacturer;
    @JsonProperty
    private String productionCountryCodeManufacturer;
    @JsonProperty
    private String partNameManufacturer;
    @JsonProperty
    private String partNumberManufacturer;
    @JsonProperty
    private String partNumberCustomer;
    @JsonProperty
    private String serialNumberManufacturer;
    @JsonProperty
    private String serialNumberCustomer;
    @JsonProperty
    private AssetQualityStatus qualityStatus;
    @JsonProperty
    private Set<String> componentsSerialNumbers;
    @JsonProperty
    private String status;
    @JsonProperty
    private String productionDateGmt;
    @JsonProperty
    private String mspId;
    @JsonProperty
    private SerialNumberType serialNumberType;
    @JsonProperty
    private String manufacturerPlant;
    @JsonProperty
    private String manufacturerLine;
    @JsonProperty
    private Map<String, String> customFields;
    @JsonProperty
    private Map<String, String> qualityDocuments;

    @SneakyThrows
    @Override
    public String toString()
    {
        return new ObjectMapper().writeValueAsString(this);
    }
}
