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

import { KafkaClass } from '../crdClasses';
import { mockKafkaClusters, getDataWithMock } from '../mockData';

function getKafkaStatus(kafka: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const data = kafka.jsonData || kafka;
  const conditions = data.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getBrokerCount(kafka: any): number {
  const data = kafka.jsonData || kafka;
  return data.spec?.kafka?.replicas || 0;
}

function getKafkaVersion(kafka: any): string {
  const data = kafka.jsonData || kafka;
  return data.status?.kafkaVersion || data.spec?.kafka?.version || 'Unknown';
}

function getListeners(kafka: any): string {
  const data = kafka.jsonData || kafka;
  const listeners = data.spec?.kafka?.listeners || [];
  return listeners.map((l: any) => l.name).join(', ') || 'None';
}

export default function KafkaList() {
  const [kafkas, error] = KafkaClass.useList();
  
  // Use mock data if no real data
  const displayData = getDataWithMock(kafkas, mockKafkaClusters as any[], error);
  const isDemoMode = error !== null || (kafkas !== null && kafkas.length === 0);

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Clusters">
        <Typography>Loading Kafka clusters...</Typography>
      </SectionBox>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#1a73e815', mr: 2 }}>
          <Icon icon="mdi:server-network" width={32} height={32} color="#1a73e8" />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">Kafka Clusters</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your Apache Kafka clusters deployed via Strimzi operator
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
              getter: (kafka: any) => {
                const data = kafka.jsonData || kafka;
                return (
                  <Link
                    component={RouterLink}
                    to={`/strimzi/kafkas/${data.metadata?.namespace}/${data.metadata?.name}`}
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                  >
                    {data.metadata?.name}
                  </Link>
                );
              },
            },
            {
              label: 'Namespace',
              getter: (kafka: any) => {
                const data = kafka.jsonData || kafka;
                return <Chip label={data.metadata?.namespace} size="small" variant="outlined" />;
              },
            },
            {
              label: 'Brokers',
              getter: (kafka: any) => (
                <Chip 
                  label={getBrokerCount(kafka)} 
                  size="small" 
                  color="primary" 
                  sx={{ minWidth: 32, fontWeight: 600 }}
                />
              ),
            },
            {
              label: 'Version',
              getter: (kafka: any) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {getKafkaVersion(kafka)}
                </Typography>
              ),
            },
            {
              label: 'Listeners',
              getter: (kafka: any) => getListeners(kafka),
            },
            {
              label: 'Status',
              getter: (kafka: any) => {
                const { status, type } = getKafkaStatus(kafka);
                return <StatusLabel status={type}>{status}</StatusLabel>;
              },
            },
          ]}
          data={displayData}
          emptyMessage="No Kafka clusters found."
        />
      </SectionBox>
    </Box>
  );
}
