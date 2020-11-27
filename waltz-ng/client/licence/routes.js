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

import LicenceList from "./pages/list/licence-list";
import LicenceView from "./pages/view/licence-view";
import {CORE_API} from "../common/services/core-api-utils";


const baseState = {
};


const viewState = {
    url: "licence/{id:int}",
    views: { "content@": LicenceView.id }
};


const viewByExternalIdBouncerState = {
    url: "licence/external-id/{externalId}",
    resolve: { externalIdBouncer }
};


const listState = {
    url: "licence",
    views: {
        "content@": LicenceList.id
    }
};


function setup($stateProvider) {
    $stateProvider
        .state("main.licence", baseState)
        .state("main.licence.list", listState)
        .state("main.licence.view", viewState)
        .state("main.licence.external-id", viewByExternalIdBouncerState);
}


setup.$inject = ["$stateProvider"];


export default setup;


function externalIdBouncer($state, $stateParams, serviceBroker) {
    const externalId = $stateParams.externalId;
    serviceBroker
        .loadViewData(CORE_API.LicenceStore.getByExternalId, [externalId])
        .then(r => {
            const element = r.data;
            if(element) {
                $state.go("main.licence.view", {id: element.id});
            } else {
                console.log(`Cannot find licence corresponding to external id: ${externalId}`);
            }
        });
}

externalIdBouncer.$inject = [
    "$state",
    "$stateParams",
    "ServiceBroker"
];
