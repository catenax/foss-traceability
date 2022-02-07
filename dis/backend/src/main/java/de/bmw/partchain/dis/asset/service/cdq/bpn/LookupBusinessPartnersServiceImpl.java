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

package de.bmw.partchain.dis.asset.service.cdq.bpn;

import de.bmw.partchain.dis.asset.model.dao.BpnDao;
import de.bmw.partchain.dis.asset.model.request.cdq.bpn.*;
import de.bmw.partchain.dis.asset.model.response.cdq.bpn.LookupBusinessPartnersResponse;
import de.bmw.partchain.dis.asset.repository.BpnRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;


@Component
@Slf4j
@RequiredArgsConstructor
public class LookupBusinessPartnersServiceImpl implements LookupBusinessPartnersService {

  @Value("${cdq.bpn.url:localhost:8081}")
  private String bpnUrl;

  @Value("${cdq.bpn.x-api-key}")
  private String apiKey;

  @Value("${cdq.bpn.technicalKey}")
  private String technicalKey;


  private RestTemplate restTemplate;

  private BpnRepository bpnRepository;

  @Autowired
  public LookupBusinessPartnersServiceImpl(RestTemplate restTemplate, BpnRepository bpnRepository) {
    this.restTemplate = restTemplate;
    this.bpnRepository = bpnRepository;
  }


  @Override
  public String getBusinessPartnerName(String manufacturerOneId, String countryCode) {
    log.debug("Searching for entry on REDIS");
    String redisResponse = getBusinessPartnerNameFromRedis(manufacturerOneId);

    if (redisResponse != null && !redisResponse.isEmpty()) {
      return redisResponse;
    }
    log.debug("Unable to find it on REDIS. Will fetch BPN API");
    LookupBusinessPartnersRequest lookupBusinessPartnersRequest = new LookupBusinessPartnersRequest();
    lookupBusinessPartnersRequest.setBusinessPartner(BusinessPartner.builder().
      identifiers(Collections.singletonList(Identifier.builder().
        value(manufacturerOneId).
        type(Type.builder().
          technicalKey(technicalKey).build()).
        build())).
      addresses(Collections.singletonList(Address.builder().
          country(new Country(countryCode)).build())).
      build());

    HttpHeaders headers = new HttpHeaders();
    headers.set("X-API-KEY", apiKey);
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

    HttpEntity<LookupBusinessPartnersRequest> entity = new HttpEntity<>(lookupBusinessPartnersRequest, headers);
    ResponseEntity<LookupBusinessPartnersResponse> response = restTemplate.exchange(bpnUrl, HttpMethod.POST, entity, LookupBusinessPartnersResponse.class);
    LookupBusinessPartnersResponse lookupBusinessPartnersResponse = response.getBody();

    AtomicReference<String> businessPartnerName = new AtomicReference<>();

    assert lookupBusinessPartnersResponse != null;
    lookupBusinessPartnersResponse.getValues().forEach(value -> {
      String bpn = value.getBusinessPartner().getNames().get(0).getValue();

      value.getBusinessPartner().getIdentifiers().forEach(identifier -> {
        if (identifier.getValue().equals(manufacturerOneId)) {
          businessPartnerName.set(bpn);
          cacheBusinessPartner(manufacturerOneId, bpn);
        }
      });

    });

    log.debug("BPN retrieved: {}", businessPartnerName.get());
    return businessPartnerName.get();
  }

  private void cacheBusinessPartner(String id, String name) {
    BpnDao bpnDao = BpnDao.builder().
      id(id).
      name(name).build();
    bpnRepository.save(bpnDao);
  }

  private String getBusinessPartnerNameFromRedis(String manufacturerOneId) {
    Optional<BpnDao> bpnDao = bpnRepository.findById(manufacturerOneId);

    return bpnDao.map(BpnDao::getName).orElse(null);
  }

}
