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

function service($http, baseUrl) {

    const BASE = `${baseUrl}/survey-template`;

    const create = (cmd) => {
        return $http.post(`${BASE}`, cmd)
            .then(result => result.data);
    };

    const clone = (id) => {
        return $http.post(`${BASE}/${id}/clone`)
            .then(result => result.data);
    };

    const getById = (id) => {
        return $http.get(`${BASE}/${id}`)
            .then(result => result.data);
    };

    const findAll = () => {
        return $http.get(`${BASE}`)
            .then(result => result.data);
    };

    const update = (cmd) => {
        return $http.put(`${BASE}`, cmd)
            .then(result => result.data);
    };

    const updateStatus = (id, cmd) => {
        return $http.put(`${BASE}/${id}/status`, cmd)
            .then(result => result.data);
    };


    return {
        create,
        clone,
        getById,
        findAll,
        update,
        updateStatus
    };
}


service.$inject = [
    '$http',
    'BaseApiUrl'
];


export default service;
