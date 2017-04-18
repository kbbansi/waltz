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

import _ from 'lodash';
import {initialiseData} from '../../../common';


/**
 * @name waltz-flow-diagrams-section
 *
 * @description
 * This component ...
 */


const bindings = {
    flowDiagrams: '<',
    flowDiagramEntities: '<',
    createDiagramCommands: '<',
    reload: '<'
};


const initialState = {
};


const template = require('./flow-diagrams-section.html');


function controller() {
    const vm = this;

    vm.$onInit = () => initialiseData(vm, initialState);

    vm.$onChanges = (c) => {
    };
}


controller.$inject = [
];


const component = {
    template,
    bindings,
    controller
};


export default component;