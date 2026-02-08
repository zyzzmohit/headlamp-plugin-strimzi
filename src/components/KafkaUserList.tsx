/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { SectionBox, SimpleTable, StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { Link as RouterLink } from 'react-router-dom';

import { KafkaUserClass } from '../crdClasses';

function getUserStatus(user: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const conditions = user.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getAuthType(user: any): string {
  return user.spec?.authentication?.type || 'None';
}

function getAuthzType(user: any): string {
  return user.spec?.authorization?.type || 'None';
}

export default function KafkaUserList() {
  // Use the hook pattern
  const [users, error] = KafkaUserClass.useList();

  if (error) {
    return (
      <SectionBox title="Kafka Users">
        <Typography color="error">Error loading Kafka users: {error.message || 'Unknown error'}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Make sure Strimzi CRDs are installed in your cluster.
        </Typography>
      </SectionBox>
    );
  }

  if (users === null) {
    return (
      <SectionBox title="Kafka Users">
        <Typography>Loading Kafka users...</Typography>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Kafka Users">
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Manage Kafka users and their authentication/authorization settings.
        </Typography>
      </Box>

      <SimpleTable
        columns={[
          {
            label: 'Name',
            getter: (user: any) => (
              <Link
                component={RouterLink}
                to={`/strimzi/users/${user.metadata?.namespace}/${user.metadata?.name}`}
              >
                {user.metadata?.name}
              </Link>
            ),
          },
          {
            label: 'Namespace',
            getter: (user: any) => user.metadata?.namespace,
          },
          {
            label: 'Username',
            getter: (user: any) => user.status?.username || user.metadata?.name,
          },
          {
            label: 'Authentication',
            getter: (user: any) => (
              <Chip label={getAuthType(user)} size="small" color="info" variant="outlined" />
            ),
          },
          {
            label: 'Authorization',
            getter: (user: any) => (
              <Chip label={getAuthzType(user)} size="small" color="secondary" variant="outlined" />
            ),
          },
          {
            label: 'Status',
            getter: (user: any) => {
              const { status, type } = getUserStatus(user);
              return <StatusLabel status={type}>{status}</StatusLabel>;
            },
          },
        ]}
        data={users}
        emptyMessage="No Kafka users found. Create a KafkaUser resource to get started."
      />
    </SectionBox>
  );
}
