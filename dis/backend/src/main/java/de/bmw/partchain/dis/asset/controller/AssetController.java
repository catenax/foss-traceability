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
package de.bmw.partchain.dis.asset.controller;

import de.bmw.partchain.dis.asset.model.request.CatenaXAssetRequestDto;
import de.bmw.partchain.dis.asset.model.response.AssetFailType;
import de.bmw.partchain.dis.asset.model.response.AssetFailedReportResponseDto;
import de.bmw.partchain.dis.asset.model.response.SentToLedgerResponseDto;
import de.bmw.partchain.dis.asset.service.AssetIngestReportService;
import de.bmw.partchain.dis.asset.service.AssetService;
import de.bmw.partchain.dis.security.AuthenticationFacadeImpl;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.ResponseEntity.ok;
import static org.springframework.http.ResponseEntity.status;

@OpenAPIDefinition(
        info = @Info(title = "Data integration service", description = "Part of FOSS Traceability app. Validates and ingest the received data to")
)
@SecurityScheme(
        name = "Authorization",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        in = SecuritySchemeIn.HEADER
)
@RestController
@RequestMapping("asset")
@Secured("ROLE_USER")
@Slf4j
public class AssetController {
    public static final String DEFAULT_ASSET_LOG_MESSAGE = "[DIS][%s] DESCRIPTION: %s at INDEX: %s";
    private final AssetService assetService;
    private final AssetIngestReportService failedAssetReportService;
    private final AuthenticationFacadeImpl authenticationFacade;

    public AssetController(AssetService assetService, AssetIngestReportService failedAssetService,
                           AuthenticationFacadeImpl authenticationFacade) {
        this.assetService = assetService;
        this.failedAssetReportService = failedAssetService;
        this.authenticationFacade = authenticationFacade;
    }

    @RequestMapping(consumes = MediaType.APPLICATION_JSON_VALUE, method = RequestMethod.POST, path = "bulk")
    @Operation(summary = "Receives a list of assets that will be ingested",
            security = @SecurityRequirement(name = "Authorization")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200",
                    description = "All the assets are valid and processed with success",
                    content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "206",
                    description = "Partial assets are valid and successfuly processed and partial invalid asset or " +
                            "fail the process",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = SentToLedgerResponseDto.class))}),
            @ApiResponse(responseCode = "400",
                    description = "All the assets are invalid or process",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = SentToLedgerResponseDto.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = {@Content(mediaType = "application/json")})})
    public ResponseEntity<SentToLedgerResponseDto> bulkPost(@RequestBody List<CatenaXAssetRequestDto> request) {
        SentToLedgerResponseDto responseDto = new SentToLedgerResponseDto();
        String mspId = authenticationFacade.getOtherClaim(AuthenticationFacadeImpl.MSP_ID);
        responseDto.setMspId(mspId);

        for (CatenaXAssetRequestDto asset : request) {
            int index = request.indexOf(asset);
            List<String> failReasons = validateAsset(asset);

            if (failReasons.isEmpty()) {
                processValidAsset(responseDto, index, asset);
            } else {
                responseDto.addFailedAsset(index, AssetFailType.VALIDATION,
                        failReasons);
            }
        }
        if (!responseDto.getFailedAssets()
                .isEmpty()) {
            failedAssetReportService.publishAssetIngestReport(responseDto);
        }


        return buildResponse(responseDto);
    }

    @RequestMapping(consumes = MediaType.APPLICATION_JSON_VALUE, method = RequestMethod.POST)
    @Operation(summary = "Receives a asset that will be ingested",
            security = @SecurityRequirement(name = "Authorization")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200",
                    description = "Asset is valid and processed with success",
                    content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "400",
                    description = "Assets is invalid or ",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = SentToLedgerResponseDto.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = {@Content(mediaType = "application/json")})})
    public ResponseEntity<SentToLedgerResponseDto> post(@RequestBody CatenaXAssetRequestDto asset) {
        SentToLedgerResponseDto responseDto = new SentToLedgerResponseDto();
        String mspId = authenticationFacade.getOtherClaim(AuthenticationFacadeImpl.MSP_ID);
        responseDto.setMspId(mspId);

        List<String> failReasons = validateAsset(asset);

        if (failReasons.isEmpty()) {
            processValidAsset(responseDto, 0, asset);
        } else {
            responseDto.addFailedAsset(0, AssetFailType.VALIDATION, failReasons);
        }

        if (!responseDto.getFailedAssets().isEmpty()) {
            failedAssetReportService.publishAssetIngestReport(responseDto);
        }

        return buildResponse(responseDto);
    }

    private List<String> validateAsset(CatenaXAssetRequestDto asset) {
        Validator validator = Validation.buildDefaultValidatorFactory()
                .getValidator();

        Set<ConstraintViolation<CatenaXAssetRequestDto>> violations = validator.validate(asset);
        return violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.toList());
    }

    private void processValidAsset(SentToLedgerResponseDto responseDto, int index, CatenaXAssetRequestDto asset) {
        try {
            assetService.sendToLedger(asset, responseDto.getRequestProcessId());
            responseDto.addProcessedAssetIndex(index);
        } catch (Exception exception) {
            responseDto.addFailedAsset(index, AssetFailType.OTHER,
                    Collections.singletonList(exception.getMessage()));
        }
    }

    private ResponseEntity<SentToLedgerResponseDto> buildResponse(SentToLedgerResponseDto responseDto) {
        boolean hasValidAssets = !responseDto.getProcessedAssets()
                .isEmpty();
        boolean hasViolations = !responseDto.getFailedAssets()
                .isEmpty();
        logExceptions(responseDto.getFailedAssets());

        if (!hasValidAssets && hasViolations) {
            return status(HttpStatus.BAD_REQUEST).body(responseDto);
        } else if (hasValidAssets && hasViolations) {
            return status(HttpStatus.PARTIAL_CONTENT).body(responseDto);
        } else {
            return ok().build();
        }
    }

    private void logExceptions(List<AssetFailedReportResponseDto> invalidAssets) {
        String mspId = authenticationFacade.getOtherClaim(AuthenticationFacadeImpl.MSP_ID);
        for (AssetFailedReportResponseDto assetFailedReport : invalidAssets) {
            assetFailedReport.getWarnings()
                    .forEach(
                            warning -> log.warn(
                                    String.format(DEFAULT_ASSET_LOG_MESSAGE, mspId, warning,
                                            assetFailedReport.getIndex())));

            assetFailedReport.getFailReasons()
                    .forEach(
                            failReason -> log.error(
                                    String.format(DEFAULT_ASSET_LOG_MESSAGE, mspId, failReason,
                                            assetFailedReport.getIndex())));
        }
    }
}