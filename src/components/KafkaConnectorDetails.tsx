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
import { Icon } from '@iconify/react';

import { KafkaConnectorClass } from '../crdClasses';

export default function KafkaConnectorDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  // Use the hook pattern with a filter
  const [connectors, error] = KafkaConnectorClass.useList({ namespace });
  
  // Find the specific connector by name
  const connector = connectors?.find((c: any) => c.jsonData?.metadata?.name === name);

  if (error) {
    return (
      <SectionBox title="Kafka Connector Details">
        <Typography color="error">Error loading Kafka Connector: {(error as any)?.message || 'Unknown error'}</Typography>
      </SectionBox>
    );
  }

  if (connectors === null) {
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

  // Access data via jsonData
  const data = connector.jsonData || {};
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
      <Box display="flex" alignItems="center" mb={3}>
        <Icon icon="mdi:pipe" width={40} height={40} color="#9c27b0" />
        <Box ml={2}>
          <Typography variant="h5" fontWeight="bold">
            {metadata.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={metadata.namespace} size="small" variant="outlined" />
            {getReadyStatus()}
            {spec.pause && <Chip label="Paused" size="small" color="warning" />}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Connector Information">
            <NameValueTable
              rows={[
                { name: 'Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Class', value: spec.class || 'Unknown' },
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
                { name: 'State', value: connectorStatus.state || 'Unknown' },
                { name: 'Worker ID', value: connectorStatus.worker_id || 'N/A' },
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
                  { label: 'Task ID', getter: (t: any) => t.id },
                  {
                    label: 'State',
                    getter: (t: any) => (
                      <StatusLabel status={t.state === 'RUNNING' ? 'success' : 'error'}>
                        {t.state}
                      </StatusLabel>
                    ),
                  },
                  { label: 'Worker ID', getter: (t: any) => t.worker_id || 'N/A' },
                  { label: 'Trace', getter: (t: any) => t.trace ? t.trace.substring(0, 50) + '...' : '-' },
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
                  { label: 'Config Key', getter: (c: any) => c.key },
                  { label: 'Value', getter: (c: any) => c.value },
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
