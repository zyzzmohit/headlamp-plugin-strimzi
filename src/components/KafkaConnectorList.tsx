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

import { KafkaConnectorClass } from '../crdClasses';
import { mockKafkaConnectors, getDataWithMock } from '../mockData';

function getConnectorStatus(connector: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const data = connector.jsonData || connector;
  const state = data.status?.connectorStatus?.connector?.state;
  
  if (state === 'RUNNING') {
    return { status: 'Running', type: 'success' };
  } else if (state === 'PAUSED') {
    return { status: 'Paused', type: 'warning' };
  } else if (state === 'FAILED' || state === 'UNASSIGNED') {
    return { status: state, type: 'error' };
  }
  
  const conditions = data.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getConnectorClass(connector: any): string {
  const data = connector.jsonData || connector;
  return data.spec?.class || 'Unknown';
}

function getShortClassName(fullClass: string): string {
  const parts = fullClass.split('.');
  return parts[parts.length - 1];
}

export default function KafkaConnectorList() {
  const [connectors, error] = KafkaConnectorClass.useList();

  const displayData = getDataWithMock(connectors, mockKafkaConnectors as any[], error);
  const isDemoMode = error !== null || (connectors !== null && connectors.length === 0);

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Connectors">
        <Typography>Loading Kafka connectors...</Typography>
      </SectionBox>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#9c27b015', mr: 2 }}>
          <Icon icon="mdi:pipe" width={32} height={32} color="#9c27b0" />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">Kafka Connectors</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage individual connectors for streaming data between systems
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
              getter: (connector: any) => {
                const data = connector.jsonData || connector;
                return (
                  <Link
                    component={RouterLink}
                    to={`/strimzi/connectors/${data.metadata?.namespace}/${data.metadata?.name}`}
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                  >
                    {data.metadata?.name}
                  </Link>
                );
              },
            },
            {
              label: 'Namespace',
              getter: (connector: any) => {
                const data = connector.jsonData || connector;
                return <Chip label={data.metadata?.namespace} size="small" variant="outlined" />;
              },
            },
            {
              label: 'Class',
              getter: (connector: any) => {
                const cls = getConnectorClass(connector);
                const shortClass = getShortClassName(cls);
                const isSource = shortClass.toLowerCase().includes('source');
                const isSink = shortClass.toLowerCase().includes('sink');
                return (
                  <Chip 
                    label={shortClass} 
                    size="small" 
                    color={isSource ? 'success' : isSink ? 'info' : 'default'}
                    variant="outlined" 
                  />
                );
              },
            },
            {
              label: 'Tasks',
              getter: (connector: any) => {
                const data = connector.jsonData || connector;
                return (
                  <Chip 
                    label={data.spec?.tasksMax || 1} 
                    size="small" 
                    color="secondary" 
                    sx={{ minWidth: 32 }}
                  />
                );
              },
            },
            {
              label: 'Pause',
              getter: (connector: any) => {
                const data = connector.jsonData || connector;
                return (
                  <Chip
                    label={data.spec?.pause ? 'Paused' : 'Active'}
                    size="small"
                    color={data.spec?.pause ? 'warning' : 'success'}
                    variant="outlined"
                  />
                );
              },
            },
            {
              label: 'Status',
              getter: (connector: any) => {
                const { status, type } = getConnectorStatus(connector);
                return <StatusLabel status={type}>{status}</StatusLabel>;
              },
            },
          ]}
          data={displayData}
          emptyMessage="No Kafka connectors found."
        />
      </SectionBox>
    </Box>
  );
}
