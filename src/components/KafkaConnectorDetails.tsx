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
import { SectionBox, NameValueTable, StatusLabel, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Icon } from '@iconify/react';

import { KafkaConnectorClass } from '../crdClasses';
import { mockKafkaConnectors, getDataWithMock } from '../mockData';

export default function KafkaConnectorDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  const [connectors, error] = KafkaConnectorClass.useList({ namespace });
  const displayData = getDataWithMock(connectors, mockKafkaConnectors as any[], error);
  
  const connector = displayData?.find((c: any) => {
    const data = c.jsonData || c;
    return data.metadata?.name === name;
  });

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Connector Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!connector) {
    return (
      <SectionBox title="Kafka Connector Details">
        <Typography color="error">Kafka Connector '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  const data = connector.jsonData || connector;
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};
  const connectorStatus = status.connectorStatus?.connector || {};
  const tasks = status.connectorStatus?.tasks || [];

  const getReadyStatus = () => {
    const state = connectorStatus.state;
    if (state === 'RUNNING') {
      return <StatusLabel status="success">Running</StatusLabel>;
    } else if (state === 'PAUSED') {
      return <StatusLabel status="warning">Paused</StatusLabel>;
    } else if (state === 'FAILED') {
      return <StatusLabel status="error">Failed</StatusLabel>;
    }
    return <StatusLabel status="warning">{state || 'Unknown'}</StatusLabel>;
  };

  // Parse connector config
  const configEntries = Object.entries(spec.config || {}).map(([key, value]) => ({
    key,
    value: String(value),
  }));

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #9c27b015 0%, #9c27b005 100%)',
          border: '1px solid #9c27b030'
        }}
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#9c27b020', mr: 2 }}>
            <Icon icon="mdi:pipe" width={40} height={40} color="#9c27b0" />
          </Box>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold">
              {metadata.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={metadata.namespace} size="small" variant="outlined" />
              <Chip label={`${spec.tasksMax || 1} tasks`} size="small" color="secondary" />
              {spec.pause && <Chip label="Paused" size="small" color="warning" />}
              {getReadyStatus()}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Connector Information">
            <NameValueTable
              rows={[
                { name: 'Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Class', value: (
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {spec.class || 'Unknown'}
                  </Typography>
                )},
                { name: 'Max Tasks', value: spec.tasksMax || 1 },
                { name: 'Created', value: metadata.creationTimestamp },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Connector Status */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Connector Status">
            <NameValueTable
              rows={[
                { name: 'State', value: (
                  <Chip 
                    label={connectorStatus.state || 'Unknown'} 
                    size="small" 
                    color={connectorStatus.state === 'RUNNING' ? 'success' : 'warning'}
                  />
                )},
                { name: 'Worker ID', value: (
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {connectorStatus.worker_id || 'N/A'}
                  </Typography>
                )},
                { name: 'Observed Generation', value: status.observedGeneration || 'N/A' },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Tasks */}
        <Grid item xs={12}>
          <SectionBox title="Tasks">
            {tasks.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Task ID', getter: (t: any) => (
                    <Chip label={t.id} size="small" variant="outlined" />
                  )},
                  {
                    label: 'State',
                    getter: (t: any) => (
                      <StatusLabel status={t.state === 'RUNNING' ? 'success' : t.state === 'PAUSED' ? 'warning' : 'error'}>
                        {t.state}
                      </StatusLabel>
                    ),
                  },
                  { label: 'Worker ID', getter: (t: any) => (
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {t.worker_id || 'N/A'}
                    </Typography>
                  )},
                ]}
                data={tasks}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No task information available
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* Configuration */}
        <Grid item xs={12}>
          <SectionBox title="Connector Configuration">
            {configEntries.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Config Key', getter: (c: any) => (
                    <Typography fontWeight={500}>{c.key}</Typography>
                  )},
                  { label: 'Value', getter: (c: any) => (
                    <Typography sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.85rem' }}>
                      {c.value}
                    </Typography>
                  )},
                ]}
                data={configEntries}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No configuration set
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* Conditions */}
        <Grid item xs={12}>
          <SectionBox title="Conditions">
            {status.conditions && status.conditions.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Type', getter: (c: any) => c.type },
                  {
                    label: 'Status',
                    getter: (c: any) => (
                      <StatusLabel status={c.status === 'True' ? 'success' : 'error'}>
                        {c.status}
                      </StatusLabel>
                    ),
                  },
                  { label: 'Reason', getter: (c: any) => c.reason || '-' },
                  { label: 'Message', getter: (c: any) => c.message || '-' },
                ]}
                data={status.conditions}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No conditions available
              </Typography>
            )}
          </SectionBox>
        </Grid>
      </Grid>
    </Box>
  );
}
