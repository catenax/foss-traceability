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

import org.apache.catalina.Context;
import org.apache.tomcat.util.descriptor.web.LoginConfig;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.keycloak.adapters.springboot.KeycloakAutoConfiguration;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.embedded.tomcat.TomcatContextCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;

@Configuration
@EnableConfigurationProperties(KeycloakSpringBootProperties.class)
public class MultiTenantConfiguration extends KeycloakAutoConfiguration
{
    private KeycloakSpringBootProperties m_keycloakProperties;

    @Autowired
    @Override
    public void setKeycloakSpringBootProperties(final KeycloakSpringBootProperties keycloakProperties)
    {
        m_keycloakProperties = keycloakProperties;
        super.setKeycloakSpringBootProperties(keycloakProperties);
        HeaderBasedConfigResolver.setAdapterConfig(keycloakProperties);
    }

    @Bean
    @Override
    public TomcatContextCustomizer tomcatKeycloakContextCustomizer()
    {
        return new MultitenantTomcatContextCustomizer(m_keycloakProperties);
    }

    static class KeycloakBaseTomcatContextCustomizer
    {
        protected final KeycloakSpringBootProperties keycloakProperties;

        public KeycloakBaseTomcatContextCustomizer(KeycloakSpringBootProperties keycloakProperties)
        {
            this.keycloakProperties = keycloakProperties;
        }

        public void customize(Context context)
        {
            LoginConfig loginConfig = new LoginConfig();
            loginConfig.setAuthMethod("KEYCLOAK");
            context.setLoginConfig(loginConfig);

            Set<String> authRoles = new HashSet<>();
            for (KeycloakSpringBootProperties.SecurityConstraint constraint :
                    keycloakProperties.getSecurityConstraints())
            {
                for (String authRole : constraint.getAuthRoles())
                {
                    if (!authRoles.contains(authRole))
                    {
                        context.addSecurityRole(authRole);
                        authRoles.add(authRole);
                    }
                }
            }

            for (KeycloakSpringBootProperties.SecurityConstraint constraint :
                    keycloakProperties.getSecurityConstraints())
            {
                SecurityConstraint tomcatConstraint = new SecurityConstraint();
                for (String authRole : constraint.getAuthRoles())
                {
                    tomcatConstraint.addAuthRole(authRole);
                    if (authRole.equals("*") || authRole.equals("**"))
                    {
                        tomcatConstraint.setAuthConstraint(true);
                    }
                }

                for (KeycloakSpringBootProperties.SecurityCollection collection : constraint.getSecurityCollections())
                {
                    SecurityCollection tomcatSecCollection = new SecurityCollection();

                    if (collection.getName() != null)
                    {
                        tomcatSecCollection.setName(collection.getName());
                    }
                    if (collection.getDescription() != null)
                    {
                        tomcatSecCollection.setDescription(collection.getDescription());
                    }

                    for (String pattern : collection.getPatterns())
                    {
                        tomcatSecCollection.addPattern(pattern);
                    }

                    for (String method : collection.getMethods())
                    {
                        tomcatSecCollection.addMethod(method);
                    }

                    for (String method : collection.getOmittedMethods())
                    {
                        tomcatSecCollection.addOmittedMethod(method);
                    }

                    tomcatConstraint.addCollection(tomcatSecCollection);
                }

                context.addConstraint(tomcatConstraint);
            }

            context.addParameter("keycloak.config.resolver", KeycloakSpringBootConfigResolver.class.getName());
        }
    }

    static class MultitenantTomcatContextCustomizer extends KeycloakBaseTomcatContextCustomizer
            implements TomcatContextCustomizer
    {
        public MultitenantTomcatContextCustomizer(final KeycloakSpringBootProperties keycloakProperties)
        {
            super(keycloakProperties);
        }

        @Override
        public void customize(final Context context)
        {
            super.customize(context);
            final String name = "keycloak.config.resolver";
            context.removeParameter(name);
            context.addParameter(name, HeaderBasedConfigResolver.class.getName());
        }
    }
}