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

import { KafkaConnectClass } from '../crdClasses';
import { mockKafkaConnects, getDataWithMock } from '../mockData';

export default function KafkaConnectDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  const [connects, error] = KafkaConnectClass.useList({ namespace });
  const displayData = getDataWithMock(connects, mockKafkaConnects as any[], error);
  
  const connect = displayData?.find((c: any) => {
    const data = c.jsonData || c;
    return data.metadata?.name === name;
  });

  if (displayData === null) {
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

  const data = connect.jsonData || connect;
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
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #ff980015 0%, #ff980005 100%)',
          border: '1px solid #ff980030'
        }}
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#ff980020', mr: 2 }}>
            <Icon icon="mdi:connection" width={40} height={40} color="#ff9800" />
          </Box>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold">
              {metadata.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={metadata.namespace} size="small" variant="outlined" />
              <Chip label={`v${spec.version || 'Unknown'}`} size="small" color="warning" variant="outlined" />
              <Chip 
                label={`${status.readyReplicas || 0}/${spec.replicas || 0} replicas`} 
                size="small" 
                color="primary" 
              />
              {getReadyStatus()}
            </Box>
          </Box>
        </Box>
      </Paper>

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
                { name: 'Bootstrap Servers', value: (
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {spec.bootstrapServers || 'N/A'}
                  </Typography>
                )},
                { name: 'Image', value: spec.image || 'Default' },
                { name: 'Build Enabled', value: spec.build ? 'Yes' : 'No' },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Connector Plugins */}
        <Grid item xs={12}>
          <SectionBox title="Available Connector Plugins">
            {status.connectorPlugins && status.connectorPlugins.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Class', getter: (p: any) => (
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {p.class}
                    </Typography>
                  )},
                  { label: 'Type', getter: (p: any) => (
                    <Chip 
                      label={p.type} 
                      size="small" 
                      color={p.type === 'source' ? 'success' : 'info'}
                      variant="outlined"
                    />
                  )},
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
