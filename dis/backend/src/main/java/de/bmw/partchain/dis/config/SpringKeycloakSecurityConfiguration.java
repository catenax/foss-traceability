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

import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakSecurityComponents;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.preauth.x509.X509AuthenticationFilter;
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;

public class SpringKeycloakSecurityConfiguration
{
    @Configuration
    @EnableWebSecurity
    @ComponentScan(basePackageClasses = KeycloakSecurityComponents.class)
    public static class KeycloakConfigurationAdapter extends KeycloakWebSecurityConfigurerAdapter
    {
        @Bean
        @Override
        protected SessionAuthenticationStrategy sessionAuthenticationStrategy()
        {
            return new NullAuthenticatedSessionStrategy();
        }

        @Autowired
        public void configureGlobal(AuthenticationManagerBuilder auth)
        {
            KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();
            keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());
            auth.authenticationProvider(keycloakAuthenticationProvider);
        }

        @Bean
        public KeycloakConfigResolver KeycloakConfigResolver()
        {
            return new HeaderBasedConfigResolver();
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception
        {
            http
                    .sessionManagement()
                    .sessionAuthenticationStrategy(sessionAuthenticationStrategy())

                    .and()
                    .addFilterBefore(keycloakPreAuthActionsFilter(), LogoutFilter.class)
                    .addFilterBefore(keycloakAuthenticationProcessingFilter(), X509AuthenticationFilter.class)
                    .exceptionHandling()
                    .authenticationEntryPoint(authenticationEntryPoint())
                    .and()
                    .cors()
                    .and()
                    .logout()
                    .addLogoutHandler(keycloakLogoutHandler())
                    .logoutUrl("/logout")
                    .logoutSuccessHandler(
                            (HttpServletRequest request, HttpServletResponse response, Authentication authentication) ->
                                    response.setStatus(HttpServletResponse.SC_OK)
                    )
                    .and()
                    .apply(new CommonSpringKeycloakTutorialsSecuritAdapter());
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource()
        {
            CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedOrigins(Arrays.asList("*"));
            configuration.setAllowedMethods(Arrays.asList(HttpMethod.OPTIONS.name(), "GET", "POST"));
            configuration.setAllowedHeaders(
                    Arrays.asList("Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Authorization"));
            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
        }
    }

    public static class CommonSpringKeycloakTutorialsSecuritAdapter
            extends AbstractHttpConfigurer<CommonSpringKeycloakTutorialsSecuritAdapter, HttpSecurity>
    {
        @Override
        public void init(HttpSecurity http) throws Exception
        {
            super.configure(http);

            http.csrf()
                    .disable();
            http
                    .authorizeRequests()
                    .antMatchers("/api/*")
                    .authenticated()
                    .anyRequest()
                    .permitAll();
            http.headers()
                    .frameOptions()
                    .sameOrigin();
        }
    }
}