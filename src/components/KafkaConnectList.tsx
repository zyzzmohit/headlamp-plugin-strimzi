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

import { KafkaConnectClass } from '../crdClasses';
import { mockKafkaConnects, getDataWithMock } from '../mockData';

function getConnectStatus(connect: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const data = connect.jsonData || connect;
  const conditions = data.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getReplicas(connect: any): string {
  const data = connect.jsonData || connect;
  const desired = data.spec?.replicas || 0;
  const ready = data.status?.readyReplicas || 0;
  return `${ready}/${desired}`;
}

function getBootstrapServers(connect: any): string {
  const data = connect.jsonData || connect;
  return data.spec?.bootstrapServers || 'N/A';
}

export default function KafkaConnectList() {
  const [connects, error] = KafkaConnectClass.useList();

  const displayData = getDataWithMock(connects, mockKafkaConnects as any[], error);
  const isDemoMode = error !== null || (connects !== null && connects.length === 0);

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Connect Clusters">
        <Typography>Loading Kafka Connect clusters...</Typography>
      </SectionBox>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#ff980015', mr: 2 }}>
          <Icon icon="mdi:connection" width={32} height={32} color="#ff9800" />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">Kafka Connect</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Connect clusters for streaming data integration
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
              getter: (connect: any) => {
                const data = connect.jsonData || connect;
                return (
                  <Link
                    component={RouterLink}
                    to={`/strimzi/connects/${data.metadata?.namespace}/${data.metadata?.name}`}
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                  >
                    {data.metadata?.name}
                  </Link>
                );
              },
            },
            {
              label: 'Namespace',
              getter: (connect: any) => {
                const data = connect.jsonData || connect;
                return <Chip label={data.metadata?.namespace} size="small" variant="outlined" />;
              },
            },
            {
              label: 'Replicas',
              getter: (connect: any) => (
                <Chip 
                  label={getReplicas(connect)} 
                  size="small" 
                  color="warning" 
                  sx={{ fontWeight: 600 }}
                />
              ),
            },
            {
              label: 'Bootstrap Servers',
              getter: (connect: any) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {getBootstrapServers(connect)}
                </Typography>
              ),
            },
            {
              label: 'Version',
              getter: (connect: any) => {
                const data = connect.jsonData || connect;
                return data.spec?.version || 'Unknown';
              },
            },
            {
              label: 'Status',
              getter: (connect: any) => {
                const { status, type } = getConnectStatus(connect);
                return <StatusLabel status={type}>{status}</StatusLabel>;
              },
            },
          ]}
          data={displayData}
          emptyMessage="No Kafka Connect clusters found."
        />
      </SectionBox>
    </Box>
  );
}
