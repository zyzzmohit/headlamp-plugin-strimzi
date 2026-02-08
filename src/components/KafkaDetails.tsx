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

import { KafkaClass } from '../crdClasses';

export default function KafkaDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  // Use the hook pattern with a filter to get specific resource
  const [kafkas, error] = KafkaClass.useList({ namespace });
  
  // Find the specific kafka by name using jsonData
  const kafka = kafkas?.find((k: any) => k.jsonData?.metadata?.name === name);

  if (error) {
    return (
      <SectionBox title="Kafka Cluster Details">
        <Typography color="error">Error loading Kafka cluster: {(error as any)?.message || 'Unknown error'}</Typography>
      </SectionBox>
    );
  }

  if (kafkas === null) {
    return (
      <SectionBox title="Kafka Cluster Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!kafka) {
    return (
      <SectionBox title="Kafka Cluster Details">
        <Typography color="error">Kafka cluster '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  // Access data via jsonData
  const data = kafka.jsonData || {};
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
        <Icon icon="mdi:server-network" width={40} height={40} color="#1a73e8" />
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
                { name: 'Kafka Version', value: status.kafkaVersion || spec.kafka?.version || 'Unknown' },
                { name: 'Cluster ID', value: status.clusterId || 'N/A' },
                { name: 'Created', value: metadata.creationTimestamp },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Kafka Configuration */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Kafka Configuration">
            <NameValueTable
              rows={[
                { name: 'Broker Replicas', value: spec.kafka?.replicas || 0 },
                { name: 'Storage Type', value: spec.kafka?.storage?.type || 'Unknown' },
                { name: 'Storage Size', value: spec.kafka?.storage?.size || 'N/A' },
                { name: 'ZooKeeper Replicas', value: spec.zookeeper?.replicas || 'N/A (KRaft mode)' },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Listeners */}
        <Grid item xs={12}>
          <SectionBox title="Listeners">
            {spec.kafka?.listeners && spec.kafka.listeners.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Name', getter: (l: any) => l.name },
                  { label: 'Port', getter: (l: any) => l.port },
                  { label: 'Type', getter: (l: any) => l.type },
                  { label: 'TLS', getter: (l: any) => (l.tls ? 'Enabled' : 'Disabled') },
                ]}
                data={spec.kafka.listeners}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No listeners configured
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* Bootstrap Servers */}
        <Grid item xs={12}>
          <SectionBox title="Bootstrap Servers">
            {status.listeners && status.listeners.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Listener', getter: (l: any) => l.name },
                  { label: 'Bootstrap Server', getter: (l: any) => l.bootstrapServers || 'N/A' },
                ]}
                data={status.listeners}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Bootstrap servers not yet available
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
                  { label: 'Last Transition', getter: (c: any) => c.lastTransitionTime || '-' },
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
