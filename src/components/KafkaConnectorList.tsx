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

import { KafkaConnectorClass } from '../crdClasses';

function getConnectorStatus(connector: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const state = connector.jsonData?.status?.connectorStatus?.connector?.state;
  
  if (state === 'RUNNING') {
    return { status: 'Running', type: 'success' };
  } else if (state === 'PAUSED') {
    return { status: 'Paused', type: 'warning' };
  } else if (state === 'FAILED' || state === 'UNASSIGNED') {
    return { status: state, type: 'error' };
  }
  
  // Fallback to conditions
  const conditions = connector.jsonData?.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getConnectorClass(connector: any): string {
  return connector.jsonData?.spec?.class || 'Unknown';
}

function getTasksMax(connector: any): number {
  return connector.jsonData?.spec?.tasksMax || 1;
}

export default function KafkaConnectorList() {
  // Use the hook pattern
  const [connectors, error] = KafkaConnectorClass.useList();

  if (error) {
    return (
      <SectionBox title="Kafka Connectors">
        <Typography color="error">Error loading Kafka Connectors: {(error as any)?.message || 'Unknown error'}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Make sure Strimzi CRDs are installed in your cluster.
        </Typography>
      </SectionBox>
    );
  }

  if (connectors === null) {
    return (
      <SectionBox title="Kafka Connectors">
        <Typography>Loading Kafka Connectors...</Typography>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Kafka Connectors">
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Manage individual connectors for your Kafka Connect clusters.
        </Typography>
      </Box>

      <SimpleTable
        columns={[
          {
            label: 'Name',
            getter: (connector: any) => (
              <Link
                component={RouterLink}
                to={`/strimzi/connectors/${connector.jsonData?.metadata?.namespace}/${connector.jsonData?.metadata?.name}`}
              >
                {connector.jsonData?.metadata?.name}
              </Link>
            ),
          },
          {
            label: 'Namespace',
            getter: (connector: any) => connector.jsonData?.metadata?.namespace,
          },
          {
            label: 'Class',
            getter: (connector: any) => {
              const cls = getConnectorClass(connector);
              // Show only the class name without package
              const shortClass = cls.split('.').pop() || cls;
              return (
                <Chip 
                  label={shortClass} 
                  size="small" 
                  color={cls.includes('Source') ? 'success' : cls.includes('Sink') ? 'info' : 'default'}
                  variant="outlined" 
                />
              );
            },
          },
          {
            label: 'Tasks',
            getter: (connector: any) => getTasksMax(connector),
          },
          {
            label: 'Pause',
            getter: (connector: any) => (
              <Chip
                label={connector.jsonData?.spec?.pause ? 'Paused' : 'Active'}
                size="small"
                color={connector.jsonData?.spec?.pause ? 'warning' : 'success'}
                variant="outlined"
              />
            ),
          },
          {
            label: 'Status',
            getter: (connector: any) => {
              const { status, type } = getConnectorStatus(connector);
              return <StatusLabel status={type}>{status}</StatusLabel>;
            },
          },
        ]}
        data={connectors}
        emptyMessage="No Kafka Connectors found. Create a KafkaConnector to start streaming data."
      />
    </SectionBox>
  );
}
