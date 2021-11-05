/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific
 *
 */

package com.khartec.waltz.web.endpoints.api;

import org.finos.waltz.service.assessment_definition.AssessmentDefinitionService;
import org.finos.waltz.service.user.UserRoleService;
import com.khartec.waltz.web.DatumRoute;
import com.khartec.waltz.web.ListRoute;
import com.khartec.waltz.web.endpoints.Endpoint;
import org.finos.waltz.common.DateTimeUtilities;
import org.finos.waltz.model.assessment_definition.AssessmentDefinition;
import org.finos.waltz.model.assessment_definition.ImmutableAssessmentDefinition;
import org.finos.waltz.model.user.SystemRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spark.Request;
import spark.Response;

import java.io.IOException;

import static com.khartec.waltz.web.WebUtilities.*;
import static com.khartec.waltz.web.endpoints.EndpointUtilities.*;
import static org.finos.waltz.common.Checks.checkNotNull;

@Service
public class AssessmentDefinitionEndpoint implements Endpoint {

    private static final String BASE_URL = mkPath("api", "assessment-definition");

    private final AssessmentDefinitionService assessmentDefinitionService;
    private final UserRoleService userRoleService;


    @Autowired
    public AssessmentDefinitionEndpoint(AssessmentDefinitionService assessmentDefinitionService, UserRoleService userRoleService) {
        checkNotNull(assessmentDefinitionService, "assessmentDefinitionService cannot be null");

        this.assessmentDefinitionService = assessmentDefinitionService;
        this.userRoleService = userRoleService;
    }


    @Override
    public void register() {
        String getByIdPath = mkPath(BASE_URL, "id", ":id");
        String findAllPath = mkPath(BASE_URL);
        String savePath = mkPath(BASE_URL);
        String findByKind = mkPath(BASE_URL, "kind", ":kind");
        String removeByIdPath = mkPath(BASE_URL, "id", ":id");


        DatumRoute<AssessmentDefinition> getByIdRoute = (request, response) -> assessmentDefinitionService.getById(getId(request));
        ListRoute<AssessmentDefinition> findAllRoute = (request, response) -> assessmentDefinitionService.findAll();
        ListRoute<AssessmentDefinition> findByKindRoute = (request, response) -> assessmentDefinitionService.findByEntityKind(getKind(request));

        getForDatum(getByIdPath, getByIdRoute);
        getForList(findAllPath, findAllRoute);
        getForList(findByKind, findByKindRoute);
        putForDatum(savePath, this::saveRoute);
        deleteForDatum(removeByIdPath, this::removeByIdRoute);
    }


    private long saveRoute(Request request, Response response) throws IOException {
        ensureUserHasEditRights(request);
        AssessmentDefinition def = ImmutableAssessmentDefinition
                .copyOf(readBody(request, AssessmentDefinition.class))
                .withLastUpdatedAt(DateTimeUtilities.nowUtc())
                .withLastUpdatedBy(getUsername(request));

        return assessmentDefinitionService.save(def);
    }

    private boolean removeByIdRoute(Request request, Response response) throws IOException {
        ensureUserHasEditRights(request);
        long definitionId = getId(request);

        return assessmentDefinitionService.remove(definitionId);
    }


    private void ensureUserHasEditRights(Request request) {
        requireAnyRole(userRoleService, request, SystemRole.ASSESSMENT_DEFINITION_ADMIN, SystemRole.ADMIN);
    }


}
