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

package com.khartec.waltz.integration_test.inmem;

import com.khartec.waltz.data.actor.ActorDao;
import com.khartec.waltz.data.logical_flow.LogicalFlowDao;
import com.khartec.waltz.model.EntityKind;
import com.khartec.waltz.model.actor.Actor;
import com.khartec.waltz.model.logical_flow.LogicalFlow;
import org.junit.Test;

import java.util.List;

import static com.khartec.waltz.model.EntityReference.mkRef;
import static org.junit.Assert.*;

public class ActorDaoTest extends BaseInMemoryIntegrationTest {

    @Test
    public void actorsCanBeCreated() {
        Long id = createActor("creationTest");

        ActorDao dao = ctx.getBean(ActorDao.class);
        Actor retrieved = dao.getById(id);
        assertEquals("creationTestName", retrieved.name());
        assertEquals("creationTestDesc", retrieved.description());
        assertTrue(retrieved.isExternal());
    }


    @Test
    public void actorsCanBeDeletedIfNotUsed() {
        ActorDao dao = ctx.getBean(ActorDao.class);
        int preCount = dao.findAll().size();
        Long id = createActor("canBeDeletedTest");

        System.out.println("After creation: "+ dao.findAll());
        boolean deleted = dao.deleteIfNotUsed(id);

        assertTrue("Actor should be deleted as not used in flows", deleted);
        assertEquals("After deletion the count of actors should be the same as before the actor was added", preCount, dao.findAll().size());
    }


    @Test
    public void actorsCannotBeDeletedIfUsed() {
        LogicalFlowDao lfdao = ctx.getBean(LogicalFlowDao.class);

        List<LogicalFlow> all = lfdao.findAllActive();
        ActorDao dao = ctx.getBean(ActorDao.class);
        Long idA = createActor("cannotBeDeletedActorA");
        Long idB = createActor("cannotBeDeletedActorB");

        createLogicalFlow(
                mkRef(EntityKind.ACTOR, idA),
                mkRef(EntityKind.ACTOR, idB));

        int preCount = dao.findAll().size();
        boolean wasDeleted = dao.deleteIfNotUsed(idA);

        assertFalse("Actor should not be deleted as used in a flow", wasDeleted);
        assertEquals("After attempted deletion the count of actors should be the same", preCount, dao.findAll().size());
    }

}