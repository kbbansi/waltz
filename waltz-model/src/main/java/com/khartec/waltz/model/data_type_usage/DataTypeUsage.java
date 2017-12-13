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

package com.khartec.waltz.model.data_type_usage;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.khartec.waltz.model.EntityReference;
import com.khartec.waltz.model.ProvenanceProvider;
import com.khartec.waltz.model.usage_info.UsageInfo;
import org.immutables.value.Value;

@Value.Immutable
@JsonSerialize(as = ImmutableDataTypeUsage.class)
@JsonDeserialize(as = ImmutableDataTypeUsage.class)
public abstract class DataTypeUsage implements
        ProvenanceProvider {

    public abstract EntityReference entityReference();
    public abstract String dataTypeCode();
    public abstract UsageInfo usage();

}
