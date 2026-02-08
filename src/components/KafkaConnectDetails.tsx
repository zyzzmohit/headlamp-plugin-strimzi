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

import { KafkaConnectClass } from '../crdClasses';

export default function KafkaConnectDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  // Use the hook pattern with a filter
  const [connects, error] = KafkaConnectClass.useList({ namespace });
  
  // Find the specific connect by name
  const connect = connects?.find((c: any) => c.jsonData?.metadata?.name === name);

  if (error) {
    return (
      <SectionBox title="Kafka Connect Details">
        <Typography color="error">Error loading Kafka Connect: {(error as any)?.message || 'Unknown error'}</Typography>
      </SectionBox>
    );
  }

  if (connects === null) {
    return (
      <SectionBox title="Kafka Connect Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!connect) {
    return (
      <SectionBox title="Kafka Connect Details">
        <Typography color="error">Kafka Connect '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  // Access data via jsonData
  const data = connect.jsonData || {};
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};

  const getReadyStatus = () => {
    const conditions = status.conditions || [];
    const readyCondition = conditions.find((c: any) => c.type === 'Ready');
    if (readyCondition?.status === 'True') {
      return <StatusLabel status="success">Ready</StatusLabel>;
    } else if (readyCondition?.status === 'False') {
      return <StatusLabel status="error">{readyCondition.reason || 'Not Ready'}</StatusLabel>;
    }
    return <StatusLabel status="warning">Unknown</StatusLabel>;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Icon icon="mdi:connection" width={40} height={40} color="#ff9800" />
        <Box ml={2}>
          <Typography variant="h5" fontWeight="bold">
            {metadata.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={metadata.namespace} size="small" variant="outlined" />
            {getReadyStatus()}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Basic Information">
            <NameValueTable
              rows={[
                { name: 'Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Version', value: spec.version || 'Unknown' },
                { name: 'Replicas', value: `${status.readyReplicas || 0}/${spec.replicas || 0}` },
                { name: 'Created', value: metadata.creationTimestamp },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Connection Configuration */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Connection Configuration">
            <NameValueTable
              rows={[
                { name: 'Bootstrap Servers', value: spec.bootstrapServers || 'N/A' },
                { name: 'Image', value: spec.image || 'Default' },
                { name: 'Build Enabled', value: spec.build ? 'Yes' : 'No' },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Connector Plugins */}
        <Grid item xs={12}>
          <SectionBox title="Connector Plugins">
            {status.connectorPlugins && status.connectorPlugins.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Class', getter: (p: any) => p.class },
                  { label: 'Type', getter: (p: any) => p.type },
                  { label: 'Version', getter: (p: any) => p.version || 'N/A' },
                ]}
                data={status.connectorPlugins}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No connector plugins available yet
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
