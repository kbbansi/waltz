/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017 Waltz open source project
 * See README.md for more information
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
import {initialiseData} from "../common";

import template from "./editable-field.html";


const bindings = {
    initialVal: "<",
    onSave: "<",  // e.g.: (d, ctx) => console.log(d.newVal, d.oldVal, ctx)
    fieldType: "@",  // logical-data-element | person | text | textarea | boolean | date | markdown | number
    dateFormat: "@",
    ctx: "<",
    buttonLabel: "@",
    saveLabel: "@?",
    editRole: "@",
    emptyLabel: "@"
};


const initialState = {
    errorMessage: "",
    editing: false,
    saving: false,
    fieldType: "text",
    buttonLabel: "Edit",
    saveLabel:  "Save",
    onSave: () => console.log("WEF: No on-save method provided")
};


function mkNewVal(initialVal, fieldType) {
    return initialVal && fieldType === "date" ?
        new Date(initialVal)
        : initialVal;
}


function controller() {
    const vm = initialiseData(this, initialState);

    vm.$onChanges = () => {
        if (vm.initialVal) {
            vm.newVal = mkNewVal(vm.initialVal, vm.fieldType);
        }
    };

    const saveComplete = () => {
        vm.saving = false;
        vm.editing = false;
        vm.errorMessage = "";
    };

    const saveFailed = (e) => {
        vm.saving = false;
        vm.editing = true;
        vm.errorMessage = e;
    };

    vm.save = () => {
        const data = {
            newVal: vm.newVal,
            oldVal: vm.initialVal
        };

        vm.saving = true;

        const promise = vm.onSave(data, vm.ctx);

        if (promise) {
            promise.then(saveComplete, saveFailed)
                   .then(() => vm.initialVal = data.newVal);
        } else {
            saveComplete();
        }
    };

    vm.edit = () => {
        vm.editing = true;
        vm.newVal = mkNewVal(vm.initialVal, vm.fieldType);
    };

    vm.cancel = () => {
        vm.editing = false;
        vm.saving = false;
        vm.errorMessage = "";
    };

    vm.entitySelect = (entity) => {
        vm.newVal = entity;
    };

    vm.onKeyDown = (event) => {
        if (event.ctrlKey && event.keyCode === 13) {  // ctrl + enter
            vm.save();
        }
    };

}


controller.$inject = [];


const component = {
    template,
    bindings,
    controller
};


export default component;