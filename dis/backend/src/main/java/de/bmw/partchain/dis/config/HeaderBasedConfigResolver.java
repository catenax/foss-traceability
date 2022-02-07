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
package de.bmw.partchain.dis.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.SneakyThrows;
import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.KeycloakDeployment;
import org.keycloak.adapters.KeycloakDeploymentBuilder;
import org.keycloak.adapters.OIDCHttpFacade;
import org.keycloak.representations.adapters.config.AdapterConfig;
import org.springframework.beans.factory.annotation.Value;

import java.util.concurrent.ConcurrentHashMap;

public class HeaderBasedConfigResolver implements KeycloakConfigResolver
{
    private static AdapterConfig adapterConfig;
    private final ConcurrentHashMap<String, KeycloakDeployment> cache = new ConcurrentHashMap<>();
    @Value(value = "${keycloak.auth-server-url}")
    private String keycloakHost;

    static void setAdapterConfig(AdapterConfig adapterConfig)
    {
        HeaderBasedConfigResolver.adapterConfig = adapterConfig;
    }

    @Override
    @SneakyThrows
    public KeycloakDeployment resolve(OIDCHttpFacade.Request request)
    {
        String token = request.getHeader("authorization");
        if (token == null)
        {
            return new KeycloakDeployment();
        }

        DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));

        Claim realmClaim = jwt.getClaim("mspid");

        if (realmClaim.isNull())
        { throw new Exception("no realm claim found in JWT"); }
        String realm = realmClaim.asString()
                .toLowerCase();
        if (!cache.containsKey(realm))
        {
            AdapterConfig realmAdapterConfig = new AdapterConfig();
            realmAdapterConfig.setBearerOnly(true);
            realmAdapterConfig.setRealm(realm);
            realmAdapterConfig.setResource("dis");
            realmAdapterConfig.setAuthServerUrl(keycloakHost);
            cache.put(realm, KeycloakDeploymentBuilder.build(realmAdapterConfig));
        }

        return cache.get(realm);
    }
}