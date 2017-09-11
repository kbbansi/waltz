/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016  Khartec Ltd.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import _ from "lodash";
import {CORE_API} from "../../common/services/core-api-utils";

function mkRef(orgUnitId) {
    return {
        kind: 'ORG_UNIT',
        id: orgUnitId
    };
}


function mkSelector(orgUnitId) {
    return {
        entityReference: mkRef(orgUnitId),
        scope: 'CHILDREN'
    };
}


function reset(data = {}) {
    _.each(data, (v, k) => data[k] = null);
}


function loadOrgUnit(orgUnitStore, id, holder) {
    return orgUnitStore
        .getById(id)
        .then(unit => holder.orgUnit = unit);
}


function loadImmediateHierarchy(store, id, holder) {
    return store
        .findImmediateHierarchy(id)
        .then(d => holder.immediateHierarchy = d);
}


function loadApps(serviceBroker, selector, holder) {
    return serviceBroker
        .loadViewData(CORE_API.ApplicationStore.findBySelector, [selector])
        .then(r => _.map(
            r.data,
            a => _.assign(a, { management: 'IT' })))
        .then(apps => holder.apps = apps);
}


function initialiseDataFlows(service, id, holder) {
    return service
        .initialise(id, "ORG_UNIT", "CHILDREN")
        .then(dataFlows => holder.dataFlows = dataFlows);
}


function loadComplexity(store, id, holder) {
    return store
        .findBySelector(id, 'ORG_UNIT', 'CHILDREN')
        .then(r => holder.complexity = r);
}


function loadTechStats(serviceBroker, id, holder) {
    const selector = mkSelector(id);

    return serviceBroker
        .loadViewData(CORE_API.TechnologyStatisticsService.findBySelector, [selector])
        .then(r => holder.techStats = r.data);
}


function service($q,
                 serviceBroker,
                 complexityStore,
                 logicalFlowViewService,
                 orgUnitStore) {

    const rawData = {};

    /*
     * As this page is quite large we load it in 4 'waves' so that
     * we have some control over the order data is requested (and
     * hopefully displayed
     */
    function loadAll(orgUnitId) {
        reset(rawData);
        return loadFirstWave(orgUnitId)
            .then(() => loadSecondWave(orgUnitId))
            .then(() => rawData.combinedApps = _.concat(rawData.apps, rawData.endUserApps))
            .then(() => loadThirdWave(orgUnitId))
            .then(() => rawData);
    }


    function loadFirstWave(orgUnitId) {
        const selector = mkSelector(orgUnitId);

        rawData.entityReference = selector.entityReference;
        rawData.orgUnitId = orgUnitId;

        return $q.all([
            loadOrgUnit(orgUnitStore, orgUnitId, rawData),
            loadImmediateHierarchy(orgUnitStore, orgUnitId, rawData),
            loadApps(serviceBroker, selector, rawData),
        ]);
    }


    function loadSecondWave(orgUnitId) {
        return $q.all([
            initialiseDataFlows(logicalFlowViewService, orgUnitId, rawData),
            loadComplexity(complexityStore, orgUnitId, rawData)
        ]);
    }


    function loadThirdWave(orgUnitId) {
        return $q.all([
            loadTechStats(serviceBroker, orgUnitId, rawData)
        ]);
    }


    function loadFlowDetail() {
        return logicalFlowViewService
            .loadDetail()
            .then(dataFlows => rawData.dataFlows = dataFlows);
    }

    function loadOrgUnitDescendants(orgUnitId) {
        return orgUnitStore
            .findDescendants(orgUnitId)
            .then(descendants => rawData.orgUnitDescendants = descendants);
    }

    return {
        data: rawData,
        loadAll,
        loadFlowDetail,
        loadOrgUnitDescendants
    };

}


service.$inject = [
    '$q',
    'ServiceBroker',
    'ComplexityStore',
    'LogicalFlowViewService',
    'OrgUnitStore'
];


export default service;
