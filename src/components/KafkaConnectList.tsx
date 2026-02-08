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

import { KafkaConnectClass } from '../crdClasses';

function getConnectStatus(connect: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const conditions = connect.jsonData?.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getReplicas(connect: any): string {
  const spec = connect.jsonData?.spec || {};
  const status = connect.jsonData?.status || {};
  const desired = spec.replicas || 0;
  const ready = status.readyReplicas || 0;
  return `${ready}/${desired}`;
}

function getBootstrapServers(connect: any): string {
  return connect.jsonData?.spec?.bootstrapServers || 'N/A';
}

export default function KafkaConnectList() {
  // Use the hook pattern
  const [connects, error] = KafkaConnectClass.useList();

  if (error) {
    return (
      <SectionBox title="Kafka Connect Clusters">
        <Typography color="error">Error loading Kafka Connect clusters: {(error as any)?.message || 'Unknown error'}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Make sure Strimzi CRDs are installed in your cluster.
        </Typography>
      </SectionBox>
    );
  }

  if (connects === null) {
    return (
      <SectionBox title="Kafka Connect Clusters">
        <Typography>Loading Kafka Connect clusters...</Typography>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Kafka Connect Clusters">
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Manage your Kafka Connect clusters for streaming data integration.
        </Typography>
      </Box>

      <SimpleTable
        columns={[
          {
            label: 'Name',
            getter: (connect: any) => (
              <Link
                component={RouterLink}
                to={`/strimzi/connects/${connect.jsonData?.metadata?.namespace}/${connect.jsonData?.metadata?.name}`}
              >
                {connect.jsonData?.metadata?.name}
              </Link>
            ),
          },
          {
            label: 'Namespace',
            getter: (connect: any) => connect.jsonData?.metadata?.namespace,
          },
          {
            label: 'Replicas',
            getter: (connect: any) => (
              <Chip label={getReplicas(connect)} size="small" color="primary" variant="outlined" />
            ),
          },
          {
            label: 'Bootstrap Servers',
            getter: (connect: any) => getBootstrapServers(connect),
          },
          {
            label: 'Version',
            getter: (connect: any) => connect.jsonData?.spec?.version || 'Unknown',
          },
          {
            label: 'Status',
            getter: (connect: any) => {
              const { status, type } = getConnectStatus(connect);
              return <StatusLabel status={type}>{status}</StatusLabel>;
            },
          },
        ]}
        data={connects}
        emptyMessage="No Kafka Connect clusters found. Deploy a KafkaConnect to get started."
      />
    </SectionBox>
  );
}
