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

package com.khartec.waltz.data.process;

import com.khartec.waltz.common.Checks;
import com.khartec.waltz.data.FindEntityReferencesByIdSelector;
import com.khartec.waltz.model.EntityReference;
import com.khartec.waltz.model.process.ImmutableProcess;
import com.khartec.waltz.model.process.Process;
import com.khartec.waltz.schema.tables.EntityRelationship;
import com.khartec.waltz.schema.tables.records.ProcessRecord;
import org.jooq.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static com.khartec.waltz.common.Checks.checkNotNull;
import static com.khartec.waltz.common.StringUtilities.mkSafe;
import static com.khartec.waltz.schema.tables.Process.PROCESS;

@Repository
public class ProcessDao implements FindEntityReferencesByIdSelector {

    private static final com.khartec.waltz.schema.tables.Process p = PROCESS.as("p");
    private static final EntityRelationship rel = EntityRelationship.ENTITY_RELATIONSHIP.as("rel");

    public static final RecordMapper<? super Record, Process> TO_DOMAIN = r -> {
        ProcessRecord record = r.into(PROCESS);
        return ImmutableProcess.builder()
                .id(record.getId())
                .parentId(Optional.ofNullable(record.getParentId()))
                .name(record.getName())
                .description(mkSafe(record.getDescription()))
                .level(record.getLevel())
                .level1(record.getLevel_1())
                .level2(Optional.ofNullable(record.getLevel_2()))
                .level3(Optional.ofNullable(record.getLevel_3()))
                .build();
    };


    private final DSLContext dsl;


    @Autowired
    public ProcessDao(DSLContext dsl) {
        Checks.checkNotNull(dsl, "dsl cannot be null");
        this.dsl = dsl;
    }


    public Process getById(long id) {
        return dsl.select(p.fields())
                .from(p)
                .where(p.ID.eq(id))
                .fetchOne(TO_DOMAIN);
    }


    public List<Process> findAll() {
        return dsl.select(p.fields())
                .from(p)
                .orderBy(p.NAME.asc())
                .fetch(TO_DOMAIN);
    }


    public Collection<Process> findForApplication(long id) {
        return null;
    }


    @Override
    public List<EntityReference> findByIdSelectorAsEntityReference(Select<Record1<Long>> selector) {
        checkNotNull(selector, "selector cannot be null");
        return null;
    }

}
