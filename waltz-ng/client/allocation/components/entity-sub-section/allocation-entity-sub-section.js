import template from "./allocation-entity-sub-section.html";
import {initialiseData} from "../../../common";
import {CORE_API} from "../../../common/services/core-api-utils";
import {
    calcWorkingTotal,
    determineChangeType,
    updateDirtyFlags,
    validateItems
} from "../../allocation-utilities";
import _ from "lodash";
import {displayError} from "../../../common/error-utils";


const bindings = {
    entityReference: "<",
    schemeId: "<",
    onDismiss: "<"
};


const initialState = {
    scheme: null,
    allocated: [],
    unallocated: [],
    editing: false,
    saveEnabled: false,
    showingHelp: false
};


function findMeasurablesRelatedToScheme(ratings = [], measurablesById = {}, scheme) {
    return _
        .chain(ratings)
        .map(r => measurablesById[r.measurableId])
        .filter(m => m.categoryId === scheme.measurableCategoryId)
        .value();
}


function controller($q, notification, serviceBroker) {
    const vm = initialiseData(this, initialState);
    let items = [];

    // -- UTILS --
    function loadData() {
        const measurablePromise = serviceBroker
            .loadAppData(CORE_API.MeasurableStore.findAll)
            .then(r => r.data);

        const ratingsPromise = serviceBroker
            .loadViewData(
                CORE_API.MeasurableRatingStore.findForEntityReference,
                [vm.entityReference])
            .then(r => r.data);

        const schemePromise = serviceBroker
            .loadViewData(
                CORE_API.AllocationSchemeStore.getById,
                [vm.schemeId])
            .then(r => r.data);

        const allocationPromise = serviceBroker
            .loadViewData(
                CORE_API.AllocationStore.findByEntityAndScheme,
                [vm.entityReference, vm.schemeId],
                { force: true })
            .then(r => r.data);

        return $q
            .all([measurablePromise, ratingsPromise, schemePromise, allocationPromise])
            .then(([allMeasurables, ratings, scheme, allocations]) => {
                const measurablesById = _.keyBy(allMeasurables, "id");
                const availableMeasurables = findMeasurablesRelatedToScheme(ratings, measurablesById, scheme);
                const allocationsByMeasurableId = _.keyBy(allocations, a => a.measurableId);

                items = _
                    .chain(availableMeasurables)
                    .map(measurable => {
                        const allocation = allocationsByMeasurableId[measurable.id];
                        const working = {
                            isAllocated: !_.isNil(allocation),
                            dirty: false,
                            percentage: _.get(allocation, "percentage", 0)
                        };
                        return {
                            allocation,
                            measurable,
                            working
                        };
                    })
                    .value();

                vm.scheme = scheme;
            });
    }


    function recalcData() {
        const [allocated, unallocated] = _
            .chain(items)
            .orderBy(d => d.measurable.name)
            .partition(d => d.working.isAllocated)
            .value();

        const hasDirtyData = updateDirtyFlags(items);
        const validAllocations = validateItems(items);

        vm.saveEnabled = validAllocations && hasDirtyData;

        vm.allocatedTotal = calcWorkingTotal(allocated);
        vm.remainder = 100 - vm.allocatedTotal;
        vm.allocated = allocated;
        vm.unallocated = unallocated;
    }


    function reload() {
        return loadData()
            .then(recalcData);
    }


    // -- LIFECYCLE

    vm.$onInit = () => {
    };

    vm.$onChanges = (c) => {
        reload();
    };

    vm.$onDestroy = () => {
    };


    // -- INTERACT

    vm.onMoveToAllocated = (d) => {
        d.working = {
            isAllocated: true,
            percentage: 0
        };
        recalcData();
    };

    vm.onMoveToUnallocated = (d) => {
        d.working = {
            isAllocated: false,
            percentage: 0
        };
        recalcData();
    };

    vm.onGrabUnallocated = (d) => {
        d.working.percentage = d.working.percentage + vm.remainder;
        recalcData();
    };

    vm.onPercentageChange = () => recalcData();

    vm.onPercentageFocusLost = () => {
        _.each(items, d => {
            if (_.isNil(d.working.percentage)) {
                d.working.percentage = 0;
            }
            if (!_.isInteger(d.working.percentage)) {
                const rounded = Math.round(d.working.percentage);
                notification.warning(`Allocations must be whole numbers, therefore rounding: ${d.working.percentage} to: ${rounded}`);
                d.working.percentage = rounded;
            }
        });
        recalcData();
    };

    vm.onSavePercentages = () => {
        const changes = _
            .chain(items)
            .filter(d => d.working.dirty)
            .map(d => ({
                operation: determineChangeType(d),
                measurablePercentage: {
                    measurableId: d.measurable.id,
                    percentage: d.working.percentage
                }
            }))
            .value();

        serviceBroker
            .execute(CORE_API.AllocationStore.updateAllocations,
                [vm.entityReference, vm.schemeId, changes])
            .then(r => {
                if (r.data === true) {
                    notification.success("Updated allocations");
                } else {
                    notification.warning("Could not update allocations");
                }
                reload();
                vm.setEditable(false);
            })
            .catch(e => displayError(notification, "Could not update allocations", e));
    };

    vm.setEditable = (targetState) => {
        vm.editing = targetState;
    };

    vm.onCancel = () => {
        vm.setEditable(false);
        return reload()
            .then(() => notification.info("Edit cancelled: reverting to last saved"));
    };

}


controller.$inject = [
    "$q",
    "Notification",
    "ServiceBroker"
];


const component = {
    bindings,
    controller,
    template
};


export default {
    component,
    id: "waltzAllocationEntitySubSection"
};