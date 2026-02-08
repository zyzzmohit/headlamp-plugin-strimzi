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
import Alert from '@mui/material/Alert';
import { Link as RouterLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { KafkaUserClass } from '../crdClasses';
import { mockKafkaUsers, getDataWithMock } from '../mockData';

function getUserStatus(user: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const data = user.jsonData || user;
  const conditions = data.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getAuthType(user: any): string {
  const data = user.jsonData || user;
  return data.spec?.authentication?.type || 'None';
}

function getAuthzType(user: any): string {
  const data = user.jsonData || user;
  return data.spec?.authorization?.type || 'None';
}

export default function KafkaUserList() {
  const [users, error] = KafkaUserClass.useList();
  
  const displayData = getDataWithMock(users, mockKafkaUsers as any[], error);
  const isDemoMode = error !== null || (users !== null && users.length === 0);

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Users">
        <Typography>Loading Kafka users...</Typography>
      </SectionBox>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#ea433515', mr: 2 }}>
          <Icon icon="mdi:account-group" width={32} height={32} color="#ea4335" />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">Kafka Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage authentication and authorization for Kafka clients
          </Typography>
        </Box>
        {isDemoMode && (
          <Chip label="DEMO MODE" size="small" color="warning" sx={{ fontWeight: 600 }} />
        )}
      </Box>

      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Showing demo data. Connect to a cluster with Strimzi installed to see real resources.
        </Alert>
      )}

      <SectionBox>
        <SimpleTable
          columns={[
            {
              label: 'Name',
              getter: (user: any) => {
                const data = user.jsonData || user;
                return (
                  <Link
                    component={RouterLink}
                    to={`/strimzi/users/${data.metadata?.namespace}/${data.metadata?.name}`}
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                  >
                    {data.metadata?.name}
                  </Link>
                );
              },
            },
            {
              label: 'Namespace',
              getter: (user: any) => {
                const data = user.jsonData || user;
                return <Chip label={data.metadata?.namespace} size="small" variant="outlined" />;
              },
            },
            {
              label: 'Username',
              getter: (user: any) => {
                const data = user.jsonData || user;
                return (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {data.status?.username || data.metadata?.name}
                  </Typography>
                );
              },
            },
            {
              label: 'Authentication',
              getter: (user: any) => (
                <Chip 
                  label={getAuthType(user)} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              ),
            },
            {
              label: 'Authorization',
              getter: (user: any) => (
                <Chip 
                  label={getAuthzType(user)} 
                  size="small" 
                  color="secondary"
                  variant="outlined"
                />
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
          data={displayData}
          emptyMessage="No Kafka users found."
        />
      </SectionBox>
    </Box>
  );
}
